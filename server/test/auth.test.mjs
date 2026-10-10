import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createAuthService, hashToken, provisionUser } from '../src/auth/service.mjs';
import { createResetEmailSender, parseResetUrl } from '../src/auth/email.mjs';
import { hashPassword, verifyPassword } from '../src/auth/password.mjs';
import { createMongoAuthStore, ensureAuthIndexes } from '../src/auth/store.mjs';
import { createMemoryAuthStore } from './helpers/memory-auth.mjs';
import { createApiServer } from '../src/app.mjs';

// Fictional test users and runtime-generated test secrets never provision a real account.
const password = randomBytes(24).toString('base64url');
const newPassword = randomBytes(24).toString('base64url');
const passwordHash = await hashPassword(password);
const student = { id: 'test-student', name: 'Test Student', email: 'student@example.test', role: 'student', passwordHash, active: true, credentialVersion: 1 };
const admin = { ...student, id: 'test-admin', name: 'Test Admin', email: 'admin@example.test', role: 'admin' };
const resetConfig = { RESET_PASSWORD_URL: 'https://portal.example.test/reset-password' };
const quietLogger = { error() {} };
const servers = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(async (server) => {
    await server.authService.waitForEmailJobs();
    await new Promise((resolve) => server.close(resolve));
  }));
});

async function startApi(authService, knowledgeStore = { databaseStatus: 'connected', list: async () => [] }) {
  const server = createApiServer({ authService, knowledgeStore, config: {}, logger: quietLogger });
  server.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

async function post(base, path, body) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

function fixture(options = {}) {
  let clock = new Date('2026-10-04T00:00:00.000Z');
  const messages = [];
  const store = createMemoryAuthStore([student, admin]);
  const service = createAuthService({ store, config: resetConfig, now: () => new Date(clock), emailSender: async (message) => messages.push(message), logger: quietLogger, ...options });
  return { store, service, messages, advance: (ms) => { clock = new Date(clock.getTime() + ms); } };
}

const rejectsStatus = (work, status) => assert.rejects(work, (error) => error.status === status);
async function requestReset(subject) {
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  return new URL(subject.messages.at(-1).resetUrl).searchParams.get('token');
}

test('auth: login verifies a salted scrypt password and only stores a hashed opaque session', async () => {
  const { service, store } = fixture();
  const result = await service.login({ email: ' STUDENT@EXAMPLE.TEST ', password, role: 'admin' });
  assert.equal(result.user.role, 'student');
  assert.match(result.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(result.expiresAt, '2026-10-04T12:00:00.000Z');
  assert.deepEqual(await service.authenticate(`Bearer ${result.token}`), result.user);
  const snapshot = store.snapshot();
  assert.equal(snapshot.sessions[0].tokenHash, hashToken(result.token));
  assert.equal(JSON.stringify(snapshot).includes(result.token), false);
  assert.equal(JSON.stringify(snapshot).includes(password), false);
  assert.equal('passwordHash' in result.user, false);
  assert.match(snapshot.users[0].passwordHash, /^scrypt\$v1\$32768\$8\$3\$/);
});

test('auth: invalid login and unknown accounts use the same 401 message', async () => {
  const { service } = fixture();
  const errors = [];
  for (const input of [{ email: student.email, password: newPassword }, { email: 'unknown@example.test', password }]) {
    await assert.rejects(() => service.login(input), (error) => { errors.push(error.message); return error.status === 401; });
  }
  assert.equal(errors[0], errors[1]);
  await rejectsStatus(() => service.login({ email: 'invalid-email', password }), 400);
});

test('auth: expired sessions are rejected without waiting for TTL deletion', async () => {
  const subject = fixture();
  const result = await subject.service.login({ email: student.email, password });
  subject.advance(12 * 60 * 60 * 1000);
  await rejectsStatus(() => subject.service.authenticate(`Bearer ${result.token}`), 401);
  assert.equal(subject.store.snapshot().sessions.length, 1);
});

test('auth: anonymous, demo, and ordinary student identities cannot administer knowledge', async () => {
  const { service } = fixture();
  await rejectsStatus(() => service.requireAdmin(undefined), 401);
  await rejectsStatus(() => service.requireAdmin('Bearer demo-student'), 401);
  const ordinary = await service.login({ email: student.email, password, role: 'admin' });
  await rejectsStatus(() => service.requireAdmin(`Bearer ${ordinary.token}`), 403);
  const authorized = await service.login({ email: admin.email, password });
  assert.equal((await service.requireAdmin(`Bearer ${authorized.token}`)).role, 'admin');
});

test('auth: logout revokes the bearer session', async () => {
  const { service } = fixture();
  const { token } = await service.login({ email: student.email, password });
  await service.logout(`Bearer ${token}`);
  await rejectsStatus(() => service.authenticate(`Bearer ${token}`), 401);
});

test('auth: forgot-password uses a generic response and sends only to an existing account', async () => {
  const subject = fixture();
  const existing = await subject.service.forgotPassword({ email: student.email });
  const unknown = await subject.service.forgotPassword({ email: 'unknown@example.test' });
  assert.deepEqual(existing, unknown);
  assert.doesNotMatch(existing.message, /have been sent/);
  await subject.service.waitForEmailJobs();
  assert.equal(subject.messages.length, 1);
  assert.equal(subject.messages[0].email, student.email);
  const token = new URL(subject.messages[0].resetUrl).searchParams.get('token');
  const user = subject.store.snapshot().users.find((item) => item.id === student.id);
  assert.equal(user.resetTokenHash, hashToken(token));
  assert.equal(user.resetExpiresAt.toISOString(), '2026-10-04T00:15:00.000Z');
  assert.equal(JSON.stringify(subject.store.snapshot()).includes(token), false);
});

test('auth: forgot-password response does not wait for provider latency', async () => {
  let finishSend;
  const delivery = new Promise((resolve) => { finishSend = resolve; });
  const subject = fixture({ emailSender: () => delivery });
  const result = await subject.service.forgotPassword({ email: student.email });
  assert.equal(typeof result.message, 'string');
  finishSend();
  await subject.service.waitForEmailJobs();
});

test('auth: repeated reset requests have an atomic per-account email cooldown', async () => {
  const subject = fixture();
  const token = await requestReset(subject);
  await requestReset(subject);
  assert.equal(subject.messages.length, 1);
  subject.advance(60_001);
  const second = await requestReset(subject);
  assert.notEqual(second, token);
  assert.equal(subject.messages.length, 2);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: newPassword }), 400);
});

test('auth: unconfigured reset email is reported honestly for all email addresses', async () => {
  const subject = fixture({ config: {}, emailSender: null });
  assert.equal(subject.service.passwordResetConfigured, false);
  const errors = [];
  for (const email of [student.email, 'unknown@example.test']) {
    await assert.rejects(() => subject.service.forgotPassword({ email }), (error) => { errors.push(error.message); return error.status === 503; });
  }
  assert.equal(errors[0], errors[1]);
  assert.equal(subject.store.snapshot().users[0].resetTokenHash, undefined);
});

test('auth: email provider failure clears its reset token without exposing account existence', async () => {
  const log = [];
  const subject = fixture({ emailSender: async () => { throw new Error(`provider failure involving ${student.email}`); }, logger: { error: (message) => log.push(message) } });
  const first = await subject.service.forgotPassword({ email: student.email });
  const second = await subject.service.forgotPassword({ email: 'unknown@example.test' });
  assert.deepEqual(first, second);
  await subject.service.waitForEmailJobs();
  assert.equal(subject.store.snapshot().users[0].resetTokenHash, undefined);
  assert.equal(log.some((message) => message.includes(student.email)), false);
  assert.ok(log.length > 0);
});

test('auth: invalid reset tokens fail and do not change the password', async () => {
  const subject = fixture();
  await rejectsStatus(() => subject.service.resetPassword({ token: 'bad', password: newPassword }), 400);
  await rejectsStatus(() => subject.service.resetPassword({ token: randomBytes(32).toString('base64url'), password: newPassword }), 400);
  assert.equal(subject.store.snapshot().users[0].passwordHash, passwordHash);
});

test('auth: expired reset tokens fail at their expiry time', async () => {
  const subject = fixture();
  const token = await requestReset(subject);
  subject.advance(15 * 60 * 1000);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: newPassword }), 400);
  assert.equal(subject.store.snapshot().users[0].passwordHash, passwordHash);
});

test('auth: a successful password reset is single use and revokes prior sessions', async () => {
  const subject = fixture();
  const oldSession = await subject.service.login({ email: student.email, password });
  const token = await requestReset(subject);
  const result = await subject.service.resetPassword({ token, password: newPassword, confirmPassword: newPassword });
  assert.match(result.message, /Sign in/);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: newPassword }), 400);
  await rejectsStatus(() => subject.service.authenticate(`Bearer ${oldSession.token}`), 401);
  await rejectsStatus(() => subject.service.login({ email: student.email, password }), 401);
  assert.equal((await subject.service.login({ email: student.email, password: newPassword })).user.id, student.id);
  const user = subject.store.snapshot().users[0];
  assert.equal(user.resetTokenHash, undefined);
  assert.equal(user.credentialVersion, 2);
  assert.equal(await verifyPassword(newPassword, user.passwordHash), true);
});

test('auth: concurrent reset attempts consume a token exactly once', async () => {
  const subject = fixture();
  const token = await requestReset(subject);
  const results = await Promise.allSettled([
    subject.service.resetPassword({ token, password: newPassword }),
    subject.service.resetPassword({ token, password: newPassword }),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.find((result) => result.status === 'rejected').reason.status, 400);
});

test('auth: weak passwords and mismatched confirmation leave the reset token usable', async () => {
  const subject = fixture();
  const token = await requestReset(subject);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: 'short' }), 400);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: newPassword, confirmPassword: password }), 400);
  assert.equal(subject.store.snapshot().users[0].resetTokenHash, hashToken(token));
  await subject.service.resetPassword({ token, password: newPassword });
});

test('auth: MongoDB absence/failure never falls back to demo account privileges', async () => {
  const absent = createAuthService({ config: {}, logger: quietLogger });
  assert.equal(absent.configured, false);
  await rejectsStatus(() => absent.login({ email: student.email, password }), 503);
  const broken = fixture({ store: { findUserByEmail: async () => { throw new Error('database offline'); } } }).service;
  await rejectsStatus(() => broken.login({ email: student.email, password }), 503);
});

test('auth: provisioning requires an explicit trusted role and hashes the password', async () => {
  const store = createMemoryAuthStore();
  await rejectsStatus(() => provisionUser(store, { email: student.email, name: student.name, password }), 400);
  const user = await provisionUser(store, { email: student.email, name: student.name, password, role: 'student' });
  assert.equal(user.role, 'student');
  assert.equal(await verifyPassword(password, store.snapshot().users[0].passwordHash), true);
  await rejectsStatus(() => provisionUser(store, { email: student.email, name: student.name, password, role: 'admin' }), 409);
});

test('auth: reset links allow HTTPS and local prototype HTTP without credentials/fragments', () => {
  assert.equal(parseResetUrl('https://portal.example.test/reset-password').protocol, 'https:');
  assert.equal(parseResetUrl('http://localhost:8081/reset-password').protocol, 'http:');
  for (const value of ['http://portal.example.test/reset-password', 'https://name:secret@portal.example.test/', 'https://portal.example.test/#token', 'not a URL']) assert.equal(parseResetUrl(value), null);
});

test('auth: Resend is used only when configured and provider acceptance is validated', async () => {
  assert.equal(createResetEmailSender({}), null);
  const key = randomUUID();
  let captured;
  const sender = createResetEmailSender({ RESEND_API_KEY: key, RESET_EMAIL_FROM: 'TRAIL Test <reset@example.test>' }, { fetchImpl: async (url, options) => {
    captured = { url, options };
    return { ok: true, json: async () => ({ id: randomUUID() }) };
  } });
  assert.equal((await sender({ email: student.email, resetUrl: 'https://portal.example.test/reset-password', expiresMinutes: 15 })).accepted, true);
  assert.equal(captured.url, 'https://api.resend.com/emails');
  assert.equal(captured.options.headers.authorization, `Bearer ${key}`);
  assert.deepEqual(JSON.parse(captured.options.body).to, [student.email]);
  const failed = createResetEmailSender({ RESEND_API_KEY: key, RESET_EMAIL_FROM: 'reset@example.test' }, { fetchImpl: async () => ({ ok: false }) });
  await assert.rejects(() => failed({ email: student.email, resetUrl: 'https://portal.example.test/', expiresMinutes: 15 }));
});

test('auth: MongoDB indexes and atomic reset use real expiry checks with no user TTL', async () => {
  const indexes = [];
  let resetOperation;
  const database = { collection: (collection) => ({
    createIndex: async (keys, options) => indexes.push({ collection, keys, options }),
    findOneAndUpdate: async (filter, update, options) => { resetOperation = { filter, update, options }; return { id: student.id }; },
  }) };
  await ensureAuthIndexes(database);
  assert.ok(indexes.some((index) => index.collection === 'users' && index.keys.email && index.options.unique));
  assert.ok(indexes.some((index) => index.collection === 'authSessions' && index.keys.expiresAt && index.options.expireAfterSeconds === 0));
  assert.equal(indexes.some((index) => index.collection === 'users' && index.options.expireAfterSeconds !== undefined), false);
  const now = new Date();
  const store = createMongoAuthStore({ database });
  assert.equal(await store.consumePasswordReset({ tokenHash: 'test-hash', passwordHash, now }), true);
  assert.equal(resetOperation.filter.resetExpiresAt.$gt, now);
  assert.equal(resetOperation.filter.active, true);
  assert.equal(resetOperation.update.$inc.credentialVersion, 1);
  assert.equal(resetOperation.update.$unset.resetTokenHash, '');
  assert.equal(resetOperation.options.includeResultMetadata, false);
});

test('auth HTTP: login, me, forgot-password, reset-password, and session revocation are wired end to end', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const login = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal(login.status, 200);
  const authorization = `Bearer ${login.body.token}`;
  const me = await fetch(`${base}/api/auth/me`, { headers: { authorization } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.role, 'student');
  const requested = await post(base, '/api/auth/forgot-password', { email: student.email });
  assert.equal(requested.status, 200);
  assert.equal('token' in requested.body, false);
  await subject.service.waitForEmailJobs();
  const token = new URL(subject.messages[0].resetUrl).searchParams.get('token');
  const reset = await post(base, '/api/auth/reset-password', { token, password: newPassword, confirmPassword: newPassword });
  assert.equal(reset.status, 200);
  assert.equal((await fetch(`${base}/api/auth/me`, { headers: { authorization } })).status, 401);
  assert.equal((await post(base, '/api/auth/reset-password', { token, password: newPassword })).status, 400);
  assert.equal((await post(base, '/api/auth/login', { email: student.email, password: newPassword })).status, 200);
});

test('auth HTTP: anonymous and student requests are rejected before administrative reads or mutations', async () => {
  const subject = fixture();
  let adminReads = 0;
  let adminWrites = 0;
  const store = {
    databaseStatus: 'connected',
    list: async () => { adminReads += 1; return []; },
    createSource: async () => { adminWrites += 1; return {}; },
  };
  const base = await startApi(subject.service, store);
  assert.equal((await fetch(`${base}/api/admin/sources`)).status, 401);
  const login = await post(base, '/api/auth/login', { email: student.email, password });
  const headers = { authorization: `Bearer ${login.body.token}`, 'content-type': 'application/json' };
  for (const [path, method] of [
    ['/api/admin/sources', 'GET'], ['/api/admin/sources', 'POST'], ['/api/admin/sources/test-source', 'PATCH'],
    ['/api/admin/sources/test-source/verify', 'POST'], ['/api/admin/sources/test-source/unverify', 'POST'],
    ['/api/admin/sources/test-source/archive', 'POST'], ['/api/admin/sources/test-source/refresh', 'POST'],
  ]) {
    const response = await fetch(`${base}${path}`, { method, headers, ...(method === 'GET' ? {} : { body: '{}' }) });
    assert.equal(response.status, 403, `${method} ${path}`);
  }
  assert.equal(adminReads, 0);
  assert.equal(adminWrites, 0);
  const privileged = await post(base, '/api/auth/login', { email: admin.email, password });
  assert.equal((await fetch(`${base}/api/admin/sources`, { headers: { authorization: `Bearer ${privileged.body.token}` } })).status, 200);
  assert.equal(adminReads, 1);
});

test('auth HTTP: demo remains available without being issued an administrator session', async () => {
  const base = await startApi(createAuthService({ config: {}, logger: quietLogger }));
  const demo = await post(base, '/api/auth/demo', { email: 'student@ustp.edu.ph', password: 'student123' });
  assert.equal(demo.status, 200);
  assert.equal(demo.body.demo, true);
  assert.equal('token' in demo.body, false);
  assert.equal((await fetch(`${base}/api/admin/sources`, { headers: { authorization: `Bearer ${demo.body.user.id}` } })).status, 401);
});
