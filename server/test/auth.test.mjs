import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createAuthService, hashToken, provisionUser } from '../src/auth/service.mjs';
import { createResetEmailSender, parseResetUrl } from '../src/auth/email.mjs';
import { hashPassword, verifyPassword } from '../src/auth/password.mjs';
import { createMongoAuthStore, ensureAuthIndexes } from '../src/auth/store.mjs';
import { createMemoryAuthStore } from './helpers/memory-auth.mjs';
import { createApiServer } from '../src/app.mjs';
import { createRateLimiter } from '../src/security/rate-limit.mjs';

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

// Starts an isolated local API instance for authentication HTTP tests.
async function startApi(
  authService,
  knowledgeStore = { databaseStatus: 'connected', list: async () => [] },
  options = {},
) {
  const server = createApiServer({ authService, knowledgeStore, config: {}, logger: quietLogger, ...options });
  server.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

// Provides fast deterministic authentication responses for HTTP limiter tests.
function rateLimitAuthService() {
  const user = { id: 'rate-test-user', name: 'Rate Test', email: 'rate@example.test', role: 'student' };
  return {
    configured: true,
    passwordResetConfigured: false,
    async login() { return { user, token: 'a'.repeat(43) }; },
    async forgotPassword() { return { message: 'If eligible, the request was recorded.' }; },
    async getCurrentUser() { return user; },
    async waitForEmailJobs() {},
  };
}

async function post(base, path, body) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}

async function adminRequest(base, path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
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
  await subject.service.requestStudentPasswordReset(student.id);
  return new URL(subject.messages.at(-1).resetUrl).searchParams.get('token');
}

test('auth HTTP: Forgot Password has a dedicated fixed-window IP bucket with Retry-After', async () => {
  let time = 0;
  const base = await startApi(rateLimitAuthService(), undefined, { rateLimitNow: () => time });

  // Other authentication activity exhausts its own bucket without consuming Forgot Password capacity.
  for (let index = 0; index < 10; index += 1) {
    assert.equal((await post(base, '/api/auth/login', {
      email: `login-${index}@example.test`, password: 'test-password',
    })).status, 200);
    const sessionCheck = await fetch(`${base}/api/auth/me`);
    assert.equal(sessionCheck.status, 200);
    await sessionCheck.json();
  }

  let firstBody;
  for (let index = 0; index < 40; index += 1) {
    const response = await fetch(`${base}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `203.0.113.${index + 1}`,
      },
      body: JSON.stringify({ email: `rotated-${index}@example.test` }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    firstBody ||= body;
    assert.deepEqual(body, firstBody);
  }

  const blocked = await post(base, '/api/auth/forgot-password', { email: 'request-41@example.test' });
  assert.equal(blocked.status, 429);
  const blockedResponse = await fetch(`${base}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'request-42@example.test' }),
  });
  assert.equal(blockedResponse.status, 429);
  assert.equal(blockedResponse.headers.get('retry-after'), '900');
  assert.deepEqual(await blockedResponse.json(), { error: 'Too many requests. Try again shortly.' });

  time = 899_001;
  const nearlyExpired = await fetch(`${base}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'near-expiry@example.test' }),
  });
  assert.equal(nearlyExpired.status, 429);
  assert.equal(nearlyExpired.headers.get('retry-after'), '1');

  time = 900_000;
  assert.equal((await post(base, '/api/auth/forgot-password', {
    email: 'new-window@example.test',
  })).status, 200);
});

test('auth HTTP: existing authentication and general IP limits remain active', async () => {
  let time = 0;
  const authBase = await startApi(rateLimitAuthService(), undefined, { rateLimitNow: () => time });
  for (let index = 0; index < 20; index += 1) {
    assert.equal((await post(authBase, '/api/auth/login', {
      email: `login-${index}@example.test`, password: 'test-password',
    })).status, 200);
  }
  const authBlocked = await fetch(`${authBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'blocked@example.test', password: 'test-password' }),
  });
  assert.equal(authBlocked.status, 429);
  assert.equal(authBlocked.headers.get('retry-after'), '900');

  const generalBase = await startApi(rateLimitAuthService(), undefined, { rateLimitNow: () => time });
  for (let index = 0; index < 120; index += 1) {
    const response = await fetch(`${generalBase}/health`);
    assert.equal(response.status, 200);
    await response.json();
  }
  const generalBlocked = await fetch(`${generalBase}/health`);
  assert.equal(generalBlocked.status, 429);
  assert.equal(generalBlocked.headers.get('retry-after'), '60');
});

test('auth: limiter keys representing different socket IPs remain independent', () => {
  let time = 0;
  const limit = createRateLimiter({ now: () => time });
  limit('forgot-password:192.0.2.1', { limit: 1, windowMs: 10_000 });
  limit('forgot-password:192.0.2.2', { limit: 1, windowMs: 10_000 });
  assert.throws(
    () => limit('forgot-password:192.0.2.1', { limit: 1, windowMs: 10_000 }),
    (error) => error.status === 429 && error.retryAfter === 10,
  );
  time = 9_001;
  assert.throws(
    () => limit('forgot-password:192.0.2.1', { limit: 1, windowMs: 10_000 }),
    (error) => error.status === 429 && error.retryAfter === 1,
  );
  time = 10_000;
  assert.doesNotThrow(() => limit('forgot-password:192.0.2.1', { limit: 1, windowMs: 10_000 }));
});

test('auth: login verifies a salted scrypt password and only stores a hashed opaque session', async () => {
  const { service, store } = fixture();
  const result = await service.login({ email: ' STUDENT@EXAMPLE.TEST ', password });
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
  const ordinary = await service.login({ email: student.email, password });
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

test('auth: forgot-password records one eligible Student request without issuing credentials', async () => {
  const subject = fixture();
  const existing = await subject.service.forgotPassword({ email: student.email });
  const unknown = await subject.service.forgotPassword({ email: 'unknown@example.test' });
  const staff = await subject.service.forgotPassword({ email: admin.email });
  const repeated = await subject.service.forgotPassword({ email: student.email });
  assert.deepEqual(existing, unknown);
  assert.deepEqual(existing, staff);
  assert.deepEqual(existing, repeated);
  assert.match(existing.message, /Admin review/);
  await subject.service.waitForEmailJobs();
  assert.equal(subject.messages.length, 0);
  assert.equal(subject.store.snapshot().passwordResetRequests.length, 1);
  assert.equal(subject.store.snapshot().passwordResetRequests[0].studentId, student.id);
  const user = subject.store.snapshot().users.find((item) => item.id === student.id);
  assert.equal(user.resetTokenHash, undefined);

  const inactive = fixture();
  await inactive.store.updateStudentActive({ userId: student.id, active: false });
  await inactive.service.forgotPassword({ email: student.email });
  await inactive.service.waitForEmailJobs();
  assert.equal(inactive.store.snapshot().passwordResetRequests.length, 0);
});

test('auth: forgot-password response does not wait for request persistence', async () => {
  let finishLookup;
  const lookup = new Promise((resolve) => { finishLookup = resolve; });
  const store = createMemoryAuthStore([student, admin]);
  const findUserByEmail = store.findUserByEmail;
  store.findUserByEmail = async (email) => {
    await lookup;
    return findUserByEmail(email);
  };
  const subject = fixture({ store });
  const result = await subject.service.forgotPassword({ email: student.email });
  assert.equal(typeof result.message, 'string');
  finishLookup();
  await subject.service.waitForEmailJobs();
});

test('auth: repeated reset requests have an atomic per-account email cooldown', async () => {
  const subject = fixture();
  const token = await requestReset(subject);
  await rejectsStatus(() => requestReset(subject), 429);
  assert.equal(subject.messages.length, 1);
  subject.advance(60_001);
  const second = await requestReset(subject);
  assert.notEqual(second, token);
  assert.equal(subject.messages.length, 2);
  await rejectsStatus(() => subject.service.resetPassword({ token, password: newPassword }), 400);
});

test('auth: forgot-password assistance does not require reset email configuration', async () => {
  const subject = fixture({ config: {}, emailSender: null });
  assert.equal(subject.service.passwordResetConfigured, false);
  for (const email of [student.email, 'unknown@example.test']) {
    assert.equal(typeof (await subject.service.forgotPassword({ email })).message, 'string');
  }
  await subject.service.waitForEmailJobs();
  assert.equal(subject.store.snapshot().passwordResetRequests.length, 1);
  assert.equal(subject.store.snapshot().users[0].resetTokenHash, undefined);
});

test('auth: Admin reset email provider failure clears the reset token', async () => {
  const subject = fixture({ emailSender: async () => { throw new Error('provider failure'); } });
  await rejectsStatus(() => subject.service.requestStudentPasswordReset(student.id), 503);
  assert.equal(subject.store.snapshot().users[0].resetTokenHash, undefined);
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
  const user = await provisionUser(store, {
    email: student.email,
    name: student.name,
    password,
    role: 'student',
    studentIdNumber: '0012345678',
  });
  assert.equal(user.role, 'student');
  assert.equal(user.mustChangePassword, true);
  assert.equal(user.id === '0012345678', false);
  assert.equal(store.snapshot().users[0].studentProfile.studentIdNumber, '0012345678');
  assert.equal(await verifyPassword(password, store.snapshot().users[0].passwordHash), true);
  await rejectsStatus(() => provisionUser(store, { email: student.email, name: student.name, password, role: 'admin' }), 409);
});

test('auth HTTP: Admin can provision and list Students without exposing credential material', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const email = 'new.student@example.test';
  const studentIdNumber = '0001234567';
  const created = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token: adminLogin.body.token,
    body: { name: 'New Student', studentIdNumber, email },
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.user.role, 'student');
  assert.equal(created.body.user.active, true);
  assert.equal(created.body.user.studentIdNumber, studentIdNumber);
  assert.equal(created.body.user.mustChangePassword, true);
  assert.deepEqual(Object.keys(created.body.user).sort(), [
    'active', 'createdAt', 'email', 'id', 'mustChangePassword', 'name', 'role', 'studentIdNumber',
  ]);
  assert.match(created.body.initialPassword, /^[A-Za-z0-9_-]{43}$/);

  const stored = subject.store.snapshot().users.find((user) => user.email === email);
  assert.equal(stored.role, 'student');
  assert.match(stored.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(stored.id, studentIdNumber);
  assert.equal(stored.studentProfile.studentIdNumber, studentIdNumber);
  assert.equal(stored.mustChangePassword, true);
  assert.equal(await verifyPassword(created.body.initialPassword, stored.passwordHash), true);
  assert.equal(JSON.stringify(subject.store.snapshot()).includes(created.body.initialPassword), false);

  const listed = await adminRequest(base, '/api/admin/students', { token: adminLogin.body.token });
  assert.equal(listed.status, 200);
  assert.equal(listed.body.items.every((user) => user.role === 'student'), true);
  assert.equal(listed.body.items.some((user) => user.email === admin.email), false);
  assert.equal(listed.body.items.some((user) => user.email === email), true);
  assert.equal(JSON.stringify(listed.body).includes('passwordHash'), false);
  assert.equal(JSON.stringify(listed.body).includes('tokenHash'), false);
  assert.equal(JSON.stringify(listed.body).includes('resetTokenHash'), false);

  const studentLogin = await post(base, '/api/auth/login', {
    email,
    password: created.body.initialPassword,
  });
  assert.equal(studentLogin.status, 200);
  assert.equal(studentLogin.body.user.role, 'student');
  assert.equal(studentLogin.body.user.mustChangePassword, true);
});

test('auth HTTP: Student provisioning validates input and rejects duplicates or role injection', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const token = adminLogin.body.token;

  for (const body of [
    { name: '', studentIdNumber: '0000000001', email: 'valid@example.test' },
    { name: 'Valid Name', studentIdNumber: '0000000002', email: 'invalid-email' },
    { name: 'Valid Name', email: 'missing-id@example.test' },
    { name: 'Valid Name', studentIdNumber: '', email: 'empty-id@example.test' },
    { name: 'Valid Name', studentIdNumber: '0000000003', email: 'escalation@example.test', role: 'admin' },
  ]) {
    const response = await adminRequest(base, '/api/admin/students', { method: 'POST', token, body });
    assert.equal(response.status, 400);
  }

  const duplicate = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token,
    body: { name: 'Duplicate Student', studentIdNumber: '0000000004', email: student.email.toUpperCase() },
  });
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.body.error, /already exists/i);

  const first = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token,
    body: { name: 'First Student', studentIdNumber: '0000000005', email: 'first.student@example.test' },
  });
  assert.equal(first.status, 201);
  const duplicateId = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token,
    body: { name: 'Second Student', studentIdNumber: '0000000005', email: 'second.student@example.test' },
  });
  assert.equal(duplicateId.status, 409);
  assert.match(duplicateId.body.error, /Student ID Number/i);
});

test('auth HTTP: newly provisioned Students must replace their temporary password before protected use', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const created = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token: adminLogin.body.token,
    body: {
      name: 'Password Change Student',
      studentIdNumber: '0011111111',
      email: 'password.change@example.test',
    },
  });
  assert.equal(created.status, 201);

  const firstLogin = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: created.body.initialPassword,
  });
  const secondLogin = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: created.body.initialPassword,
  });
  assert.equal(firstLogin.status, 200);
  assert.equal(firstLogin.body.user.mustChangePassword, true);
  await rejectsStatus(
    () => subject.service.authenticate(`Bearer ${firstLogin.body.token}`),
    403,
  );
  const meBeforeChange = await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${firstLogin.body.token}` },
  });
  assert.equal(meBeforeChange.status, 200);
  assert.equal((await meBeforeChange.json()).user.mustChangePassword, true);

  const changed = await adminRequest(base, '/api/auth/change-initial-password', {
    method: 'POST',
    token: firstLogin.body.token,
    body: {
      currentPassword: created.body.initialPassword,
      password: newPassword,
      confirmPassword: newPassword,
    },
  });
  assert.equal(changed.status, 200);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${firstLogin.body.token}` },
  })).status, 401);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${secondLogin.body.token}` },
  })).status, 401);
  assert.equal((await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: created.body.initialPassword,
  })).status, 401);

  const finalLogin = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: newPassword,
  });
  assert.equal(finalLogin.status, 200);
  assert.equal(finalLogin.body.user.mustChangePassword, false);
  assert.equal((await subject.service.authenticate(`Bearer ${finalLogin.body.token}`)).role, 'student');
  const stored = subject.store.snapshot().users.find((user) => user.id === created.body.user.id);
  assert.equal(stored.mustChangePassword, false);
  assert.equal(stored.credentialVersion, 2);
});

test('auth HTTP: Student management rejects anonymous, demo, Student, and expired Admin sessions', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const initialUserCount = subject.store.snapshot().users.length;

  assert.equal((await adminRequest(base, '/api/admin/students')).status, 401);
  assert.equal((await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    body: { name: 'Unauthorized', email: 'unauthorized@example.test' },
  })).status, 401);

  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, '/api/admin/students', { token: studentLogin.body.token })).status, 403);
  assert.equal((await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token: studentLogin.body.token,
    body: { name: 'Unauthorized', email: 'unauthorized@example.test' },
  })).status, 403);
  assert.equal((await adminRequest(base, '/api/admin/students', { token: 'demo-student' })).status, 401);

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  subject.advance(12 * 60 * 60 * 1000);
  assert.equal((await adminRequest(base, '/api/admin/students', { token: adminLogin.body.token })).status, 401);
  assert.equal(subject.store.snapshot().users.length, initialUserCount);
});

test('auth HTTP: Admin deactivates and reactivates a Student while prior sessions remain revoked', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const path = `/api/admin/students/${student.id}/status`;
  const original = subject.store.snapshot().users.find((user) => user.id === student.id);

  const deactivated = await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  });
  assert.equal(deactivated.status, 200);
  assert.equal(deactivated.body.user.active, false);
  assert.equal(JSON.stringify(deactivated.body).includes('passwordHash'), false);
  assert.equal((await post(base, '/api/auth/login', { email: student.email, password })).status, 401);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${studentLogin.body.token}` },
  })).status, 401);

  const afterDeactivation = subject.store.snapshot().users.find((user) => user.id === student.id);
  assert.equal(afterDeactivation.credentialVersion, original.credentialVersion + 1);
  assert.equal(afterDeactivation.email, original.email);
  assert.equal(afterDeactivation.passwordHash, original.passwordHash);

  assert.equal((await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 200);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === student.id).credentialVersion, 2);

  const reactivated = await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: true },
  });
  assert.equal(reactivated.status, 200);
  assert.equal(reactivated.body.user.active, true);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === student.id).credentialVersion, 3);
  assert.equal((await post(base, '/api/auth/login', { email: student.email, password })).status, 200);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${studentLogin.body.token}` },
  })).status, 401);
  assert.equal((await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: true },
  })).status, 200);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === student.id).credentialVersion, 3);
});

test('auth HTTP: Student lifecycle rejects unauthorized, invalid, and non-Student targets', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const path = `/api/admin/students/${student.id}/status`;

  assert.equal((await adminRequest(base, path, { method: 'PATCH', body: { active: false } })).status, 401);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, path, {
    method: 'PATCH', token: studentLogin.body.token, body: { active: false },
  })).status, 403);

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  for (const body of [{}, { active: 'false' }, { active: false, role: 'admin' }]) {
    assert.equal((await adminRequest(base, path, {
      method: 'PATCH', token: adminLogin.body.token, body,
    })).status, 400);
  }
  assert.equal((await adminRequest(base, `/api/admin/students/${admin.id}/status`, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 404);
  assert.equal((await adminRequest(base, '/api/admin/students/missing-student/status', {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 404);
  await rejectsStatus(() => subject.service.updateStudentStatus('invalid id', { active: false }), 400);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === student.id).active, true);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === admin.id).active, true);
});

test('auth HTTP: lifecycle changes preserve Student identity and mandatory password-change state', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const created = await adminRequest(base, '/api/admin/students', {
    method: 'POST',
    token: adminLogin.body.token,
    body: { name: 'Lifecycle Student', studentIdNumber: '0099999999', email: 'lifecycle@example.test' },
  });
  const path = `/api/admin/students/${created.body.user.id}/status`;
  const before = subject.store.snapshot().users.find((user) => user.id === created.body.user.id);

  assert.equal((await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 200);
  assert.equal((await adminRequest(base, path, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: true },
  })).status, 200);

  const after = subject.store.snapshot().users.find((user) => user.id === created.body.user.id);
  assert.equal(after.id, before.id);
  assert.equal(after.studentProfile.studentIdNumber, before.studentProfile.studentIdNumber);
  assert.equal(after.email, before.email);
  assert.equal(after.passwordHash, before.passwordHash);
  assert.equal(after.mustChangePassword, true);
  const login = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: created.body.initialPassword,
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.mustChangePassword, true);
  await rejectsStatus(() => subject.service.authenticate(`Bearer ${login.body.token}`), 403);
});

test('auth HTTP: Admin provisions a Knowledge-Base Manager with a hashed one-time credential', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password, role: 'admin' });
  const email = 'knowledge.manager@example.test';
  const created = await adminRequest(base, '/api/admin/kb-managers', {
    method: 'POST',
    token: adminLogin.body.token,
    body: { name: 'Knowledge Manager', email },
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.user.role, 'knowledge_manager');
  assert.equal(created.body.user.active, true);
  assert.equal(created.body.user.mustChangePassword, true);
  assert.match(created.body.initialPassword, /^[A-Za-z0-9_-]{43}$/);
  const stored = subject.store.snapshot().users.find((user) => user.email === email);
  assert.match(stored.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(stored.role, 'knowledge_manager');
  assert.equal(await verifyPassword(created.body.initialPassword, stored.passwordHash), true);
  assert.equal(JSON.stringify(subject.store.snapshot()).includes(created.body.initialPassword), false);

  const listed = await adminRequest(base, '/api/admin/kb-managers', { token: adminLogin.body.token });
  assert.equal(listed.status, 200);
  assert.equal(listed.body.items.length, 1);
  assert.deepEqual(Object.keys(listed.body.items[0]).sort(), [
    'active', 'createdAt', 'email', 'id', 'mustChangePassword', 'name', 'role',
  ]);
  assert.equal(JSON.stringify(listed.body).includes('passwordHash'), false);
  assert.equal(JSON.stringify(listed.body).includes('tokenHash'), false);

  assert.equal((await adminRequest(base, '/api/admin/kb-managers', {
    method: 'POST', token: adminLogin.body.token, body: { name: 'Duplicate', email },
  })).status, 409);
  assert.equal((await adminRequest(base, '/api/admin/kb-managers', {
    method: 'POST', token: adminLogin.body.token, body: { name: 'Escalation', email: 'escalation.manager@example.test', role: 'admin' },
  })).status, 400);
});

test('auth HTTP: staff role matching and exact backend guards isolate Admin and Knowledge Manager access', async () => {
  const subject = fixture();
  let managerWrites = 0;
  const knowledgeStore = {
    databaseStatus: 'connected',
    async listManagerSources() { return [{ id: 'source-one', title: 'Source One', verificationStatus: 'pending_verification' }]; },
    async createManagerDraft(input, { actor }) {
      managerWrites += 1;
      return { id: 'draft-one', ...input, createdBy: actor.id, draftStatus: 'draft' };
    },
  };
  const base = await startApi(subject.service, knowledgeStore);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password, role: 'admin' });
  const created = await adminRequest(base, '/api/admin/kb-managers', {
    method: 'POST',
    token: adminLogin.body.token,
    body: { name: 'Guarded Manager', email: 'guarded.manager@example.test' },
  });
  assert.equal(created.status, 201);

  const sessionCount = subject.store.snapshot().sessions.length;
  assert.equal((await post(base, '/api/auth/login', {
    email: created.body.user.email, password: created.body.initialPassword, role: 'admin',
  })).status, 401);
  assert.equal((await post(base, '/api/auth/login', {
    email: student.email, password, role: 'knowledge_manager',
  })).status, 401);
  assert.equal(subject.store.snapshot().sessions.length, sessionCount);

  const managerLogin = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: created.body.initialPassword,
    role: 'knowledge_manager',
  });
  assert.equal(managerLogin.status, 200);
  assert.equal(managerLogin.body.user.role, 'knowledge_manager');
  assert.equal(managerLogin.body.user.mustChangePassword, true);
  assert.equal((await adminRequest(base, '/api/admin/students', { token: managerLogin.body.token })).status, 403);
  assert.equal((await adminRequest(base, '/api/knowledge-manager/sources', { token: managerLogin.body.token })).status, 403);
  assert.equal((await adminRequest(base, '/api/knowledge-manager/sources', { token: adminLogin.body.token })).status, 403);
  assert.equal((await adminRequest(base, '/api/knowledge-manager/sources', {
    method: 'POST', token: adminLogin.body.token, body: { title: 'Rejected Admin source' },
  })).status, 403);
  assert.equal(managerWrites, 0);

  const changed = await adminRequest(base, '/api/auth/change-initial-password', {
    method: 'POST',
    token: managerLogin.body.token,
    body: { currentPassword: created.body.initialPassword, password: newPassword, confirmPassword: newPassword },
  });
  assert.equal(changed.status, 200);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${managerLogin.body.token}` },
  })).status, 401);

  const finalLogin = await post(base, '/api/auth/login', {
    email: created.body.user.email,
    password: newPassword,
    role: 'knowledge_manager',
  });
  assert.equal(finalLogin.status, 200);
  assert.equal(finalLogin.body.user.mustChangePassword, false);
  const sources = await adminRequest(base, '/api/knowledge-manager/sources', { token: finalLogin.body.token });
  assert.equal(sources.status, 200);
  assert.deepEqual(sources.body.items, await knowledgeStore.listManagerSources());
  const managerDraft = await adminRequest(base, '/api/knowledge-manager/sources', {
    method: 'POST', token: finalLogin.body.token,
    body: { sourceType: 'office_verified_information', title: 'Manager draft' },
  });
  assert.equal(managerDraft.status, 201);
  assert.equal(managerDraft.body.source.createdBy, created.body.user.id);
  assert.equal(managerWrites, 1);
  assert.equal((await adminRequest(base, '/api/admin/password-requests', { token: finalLogin.body.token })).status, 403);

  const statusPath = `/api/admin/kb-managers/${created.body.user.id}/status`;
  assert.equal((await adminRequest(base, statusPath, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 200);
  assert.equal((await post(base, '/api/auth/login', {
    email: created.body.user.email, password: newPassword, role: 'knowledge_manager',
  })).status, 401);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${finalLogin.body.token}` },
  })).status, 401);
  assert.equal((await adminRequest(base, statusPath, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: true },
  })).status, 200);
  assert.equal((await post(base, '/api/auth/login', {
    email: created.body.user.email, password: newPassword, role: 'knowledge_manager',
  })).status, 200);
});

test('auth HTTP: Knowledge Manager provisioning and lifecycle reject unauthorized or invalid targets', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, '/api/admin/kb-managers', {
    method: 'POST', token: studentLogin.body.token, body: { name: 'Unauthorized', email: 'unauthorized.manager@example.test' },
  })).status, 403);
  assert.equal((await adminRequest(base, '/api/admin/kb-managers')).status, 401);

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password, role: 'admin' });
  assert.equal((await adminRequest(base, `/api/admin/kb-managers/${admin.id}/status`, {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 404);
  assert.equal((await adminRequest(base, '/api/admin/kb-managers/missing-manager/status', {
    method: 'PATCH', token: adminLogin.body.token, body: { active: false },
  })).status, 404);
  assert.equal((await adminRequest(base, '/api/admin/kb-managers/invalid/status', {
    method: 'PATCH', token: adminLogin.body.token, body: { active: 'false' },
  })).status, 400);
  assert.equal(subject.store.snapshot().users.find((user) => user.id === admin.id).active, true);
});

test('auth HTTP: Admin initiates a Student reset through the registered email without exposing its token', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });

  const response = await adminRequest(base, `/api/admin/students/${student.id}/reset-password`, {
    method: 'POST',
    token: adminLogin.body.token,
  });

  assert.equal(response.status, 200);
  assert.match(response.body.message, /accepted for delivery/i);
  assert.equal(JSON.stringify(response.body).includes('token'), false);
  assert.equal(JSON.stringify(response.body).includes('resetUrl'), false);
  assert.equal(subject.messages.length, 1);
  assert.equal(subject.messages[0].email, student.email);

  const token = new URL(subject.messages[0].resetUrl).searchParams.get('token');
  assert.equal((await post(base, '/api/auth/reset-password', {
    token,
    password: newPassword,
    confirmPassword: newPassword,
  })).status, 200);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${studentLogin.body.token}` },
  })).status, 401);
});

test('auth HTTP: Student reset assistance rejects unauthorized callers, non-Students, cooldown floods, and missing delivery', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const path = `/api/admin/students/${student.id}/reset-password`;
  assert.equal((await adminRequest(base, path, { method: 'POST' })).status, 401);

  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, path, { method: 'POST', token: studentLogin.body.token })).status, 403);

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  assert.equal((await adminRequest(base, `/api/admin/students/${admin.id}/reset-password`, {
    method: 'POST', token: adminLogin.body.token,
  })).status, 404);
  assert.equal((await adminRequest(base, path, { method: 'POST', token: adminLogin.body.token })).status, 200);
  assert.equal((await adminRequest(base, path, { method: 'POST', token: adminLogin.body.token })).status, 429);

  const unavailable = fixture({ config: {}, emailSender: null });
  const unavailableBase = await startApi(unavailable.service);
  const unavailableAdmin = await post(unavailableBase, '/api/auth/login', { email: admin.email, password });
  assert.equal((await adminRequest(unavailableBase, path, {
    method: 'POST', token: unavailableAdmin.body.token,
  })).status, 503);
});

test('auth HTTP: Student forgot-password creates one safe Admin request that can be dismissed', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const first = await post(base, '/api/auth/forgot-password', { email: student.email });
  const unknown = await post(base, '/api/auth/forgot-password', { email: 'unknown@example.test' });
  const repeated = await post(base, '/api/auth/forgot-password', { email: student.email });
  assert.deepEqual(first.body, unknown.body);
  assert.deepEqual(first.body, repeated.body);
  await subject.service.waitForEmailJobs();

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  const listed = await adminRequest(base, '/api/admin/password-requests', { token: adminLogin.body.token });
  assert.equal(listed.status, 200);
  assert.equal(listed.body.pendingCount, 1);
  assert.equal(listed.body.items.length, 1);
  assert.deepEqual(Object.keys(listed.body.items[0]).sort(), [
    'id', 'requestedAt', 'resolutionAt', 'status', 'studentEmail', 'studentId', 'studentName',
  ]);
  assert.equal(listed.body.items[0].studentId, student.id);
  assert.equal(listed.body.items[0].status, 'pending');
  assert.equal(/token|passwordHash|resetUrl/.test(JSON.stringify(listed.body)), false);

  const requestId = listed.body.items[0].id;
  for (const status of ['resolved', 'handled']) {
    assert.equal((await adminRequest(base, `/api/admin/password-requests/${requestId}`, {
      method: 'PATCH', token: adminLogin.body.token, body: { status },
    })).status, 400);
  }
  const dismissed = await adminRequest(base, `/api/admin/password-requests/${requestId}`, {
    method: 'PATCH', token: adminLogin.body.token, body: { status: 'dismissed' },
  });
  assert.equal(dismissed.status, 200);
  assert.equal(dismissed.body.request.status, 'dismissed');
  assert.equal(typeof dismissed.body.request.resolutionAt, 'string');

  const after = await adminRequest(base, '/api/admin/password-requests', { token: adminLogin.body.token });
  assert.equal(after.body.pendingCount, 0);
  assert.equal((await adminRequest(base, `/api/admin/password-requests/${requestId}`, {
    method: 'PATCH', token: adminLogin.body.token, body: { status: 'dismissed' },
  })).status, 404);
});

test('auth HTTP: Password request administration rejects anonymous, Student, and expired Admin sessions', async () => {
  const subject = fixture();
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  const requestId = subject.store.snapshot().passwordResetRequests[0].id;
  const base = await startApi(subject.service);

  assert.equal((await adminRequest(base, '/api/admin/password-requests')).status, 401);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, '/api/admin/password-requests', { token: studentLogin.body.token })).status, 403);
  assert.equal((await adminRequest(base, `/api/admin/password-requests/${requestId}`, {
    method: 'PATCH', token: studentLogin.body.token, body: { status: 'dismissed' },
  })).status, 403);

  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  subject.advance(12 * 60 * 60 * 1000);
  assert.equal((await adminRequest(base, '/api/admin/password-requests', { token: adminLogin.body.token })).status, 401);
});

test('auth HTTP: Admin approval atomically issues a temporary Student password and handles the request', async () => {
  const subject = fixture();
  const base = await startApi(subject.service);
  const priorStudentSession = await post(base, '/api/auth/login', { email: student.email, password });
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  const requestId = subject.store.snapshot().passwordResetRequests[0].id;
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });

  const approved = await adminRequest(base, `/api/admin/password-requests/${requestId}/approve-reset`, {
    method: 'POST', token: adminLogin.body.token, body: { identityVerified: true },
  });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.request.status, 'handled');
  assert.equal(approved.body.credential.studentName, student.name);
  assert.equal(approved.body.credential.registeredEmail, student.email);
  assert.match(approved.body.credential.temporaryPassword, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(/passwordHash|token/.test(JSON.stringify(approved.body)), false);

  const stored = subject.store.snapshot().users.find((item) => item.id === student.id);
  assert.equal(stored.mustChangePassword, true);
  assert.equal(stored.credentialVersion, 2);
  assert.notEqual(stored.passwordHash, approved.body.credential.temporaryPassword);
  assert.equal(await verifyPassword(approved.body.credential.temporaryPassword, stored.passwordHash), true);
  assert.equal((await fetch(`${base}/api/auth/me`, {
    headers: { authorization: `Bearer ${priorStudentSession.body.token}` },
  })).status, 401);

  const temporaryLogin = await post(base, '/api/auth/login', {
    email: student.email,
    password: approved.body.credential.temporaryPassword,
  });
  assert.equal(temporaryLogin.status, 200);
  assert.equal(temporaryLogin.body.user.mustChangePassword, true);
  assert.equal((await post(base, '/api/auth/change-initial-password', {
    currentPassword: approved.body.credential.temporaryPassword,
    password: newPassword,
    confirmPassword: newPassword,
  })).status, 401);

  const changed = await fetch(`${base}/api/auth/change-initial-password`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${temporaryLogin.body.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword: approved.body.credential.temporaryPassword,
      password: newPassword,
      confirmPassword: newPassword,
    }),
  });
  assert.equal(changed.status, 200);
  assert.equal((await post(base, '/api/auth/login', {
    email: student.email,
    password: approved.body.credential.temporaryPassword,
  })).status, 401);
  assert.equal((await post(base, '/api/auth/login', { email: student.email, password: newPassword })).status, 200);

  const listed = await adminRequest(base, '/api/admin/password-requests', { token: adminLogin.body.token });
  assert.equal(listed.body.items[0].status, 'handled');
  assert.equal(/temporaryPassword|passwordHash|token/.test(JSON.stringify(listed.body)), false);
  assert.equal((await adminRequest(base, `/api/admin/password-requests/${requestId}/approve-reset`, {
    method: 'POST', token: adminLogin.body.token, body: { identityVerified: true },
  })).status, 409);
});

test('auth HTTP: password approval requires Admin authorization and explicit identity verification', async () => {
  const subject = fixture();
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  const requestId = subject.store.snapshot().passwordResetRequests[0].id;
  const base = await startApi(subject.service);
  const path = `/api/admin/password-requests/${requestId}/approve-reset`;

  assert.equal((await adminRequest(base, path, {
    method: 'POST', body: { identityVerified: true },
  })).status, 401);
  const studentLogin = await post(base, '/api/auth/login', { email: student.email, password });
  assert.equal((await adminRequest(base, path, {
    method: 'POST', token: studentLogin.body.token, body: { identityVerified: true },
  })).status, 403);
  const adminLogin = await post(base, '/api/auth/login', { email: admin.email, password });
  for (const body of [{}, { identityVerified: false }, { identityVerified: true, role: 'admin' }]) {
    assert.equal((await adminRequest(base, path, {
      method: 'POST', token: adminLogin.body.token, body,
    })).status, 400);
  }
  assert.equal(subject.store.snapshot().passwordResetRequests[0].status, 'pending');
  assert.equal(subject.store.snapshot().users[0].passwordHash, passwordHash);
});

test('auth: inactive or non-Student requests cannot be approved and dismissal preserves credentials', async () => {
  const inactive = fixture();
  await inactive.service.forgotPassword({ email: student.email });
  await inactive.service.waitForEmailJobs();
  const inactiveRequest = inactive.store.snapshot().passwordResetRequests[0];
  await inactive.store.updateStudentActive({ userId: student.id, active: false });
  await rejectsStatus(() => inactive.service.approvePasswordResetRequest(
    inactiveRequest.id,
    { identityVerified: true },
    admin,
  ), 409);
  assert.equal(inactive.store.snapshot().passwordResetRequests[0].status, 'pending');

  const staffTarget = fixture();
  await staffTarget.store.createPasswordResetRequest({
    id: 'staff-request', studentId: admin.id, requestedAt: new Date(), status: 'pending', retentionExpiresAt: new Date(),
  });
  await rejectsStatus(() => staffTarget.service.approvePasswordResetRequest(
    'staff-request',
    { identityVerified: true },
    admin,
  ), 409);
  assert.equal(staffTarget.store.snapshot().users.find((item) => item.id === admin.id).passwordHash, passwordHash);

  const dismissed = fixture();
  await dismissed.service.forgotPassword({ email: student.email });
  await dismissed.service.waitForEmailJobs();
  const dismissedRequest = dismissed.store.snapshot().passwordResetRequests[0];
  await dismissed.service.updatePasswordResetRequest(dismissedRequest.id, { status: 'dismissed' }, admin);
  assert.equal(dismissed.store.snapshot().users[0].passwordHash, passwordHash);
  await rejectsStatus(() => dismissed.service.approvePasswordResetRequest(
    dismissedRequest.id,
    { identityVerified: true },
    admin,
  ), 409);
});

test('auth: approval storage failure leaves the request pending and credential unchanged', async () => {
  const subject = fixture();
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  const requestId = subject.store.snapshot().passwordResetRequests[0].id;
  subject.store.approvePasswordResetRequest = async () => { throw new Error('simulated storage failure'); };

  await rejectsStatus(() => subject.service.approvePasswordResetRequest(
    requestId,
    { identityVerified: true },
    admin,
  ), 503);
  const snapshot = subject.store.snapshot();
  assert.equal(snapshot.passwordResetRequests[0].status, 'pending');
  assert.equal(snapshot.users.find((item) => item.id === student.id).passwordHash, passwordHash);
});

test('auth: concurrent password-request approvals produce exactly one temporary credential', async () => {
  const subject = fixture();
  await subject.service.forgotPassword({ email: student.email });
  await subject.service.waitForEmailJobs();
  const requestId = subject.store.snapshot().passwordResetRequests[0].id;
  const results = await Promise.allSettled([
    subject.service.approvePasswordResetRequest(requestId, { identityVerified: true }, admin),
    subject.service.approvePasswordResetRequest(requestId, { identityVerified: true }, admin),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected' && result.reason.status === 409).length, 1);
  assert.equal(subject.store.snapshot().users.find((item) => item.id === student.id).credentialVersion, 2);
  assert.equal(subject.store.snapshot().passwordResetRequests[0].status, 'handled');
});

test('auth: MongoDB password approval uses one transaction for credential replacement and request handling', async () => {
  const observed = { userUpdates: [], requestUpdates: [], transactionCalls: 0, ended: false };
  const session = {
    async withTransaction(operation) { observed.transactionCalls += 1; await operation(); },
    async endSession() { observed.ended = true; },
  };
  const request = {
    id: 'request-1', studentId: student.id, status: 'pending', requestedAt: new Date(),
  };
  const users = {
    async findOne(filter, options) {
      assert.deepEqual(filter, { id: student.id, role: 'student', active: true });
      assert.equal(options.session, session);
      return student;
    },
    async findOneAndUpdate(filter, update, options) {
      observed.userUpdates.push({ filter, update, options });
      return { ...student, mustChangePassword: true, credentialVersion: 2 };
    },
  };
  const passwordRequests = {
    async findOne(filter, options) {
      assert.deepEqual(filter, { id: request.id, status: 'pending' });
      assert.equal(options.session, session);
      return request;
    },
    async findOneAndUpdate(filter, update, options) {
      observed.requestUpdates.push({ filter, update, options });
      return { ...request, status: 'handled', resolutionAt: update.$set.resolutionAt };
    },
  };
  const connection = {
    client: { startSession: () => session },
    database: {
      collection(name) {
        if (name === 'users') return users;
        if (name === 'passwordResetRequests') return passwordRequests;
        return {};
      },
    },
  };
  const store = createMongoAuthStore(connection);
  const changedAt = new Date('2026-11-19T08:00:00.000Z');
  const result = await store.approvePasswordResetRequest({
    id: request.id,
    passwordHash,
    changedAt,
    resolvedBy: admin.id,
  });

  assert.equal(observed.transactionCalls, 1);
  assert.equal(observed.ended, true);
  assert.equal(observed.userUpdates.length, 1);
  assert.equal(observed.requestUpdates.length, 1);
  assert.equal(observed.userUpdates[0].options.session, session);
  assert.equal(observed.userUpdates[0].update.$set.passwordHash, passwordHash);
  assert.equal(observed.userUpdates[0].update.$set.mustChangePassword, true);
  assert.deepEqual(observed.userUpdates[0].update.$inc, { credentialVersion: 1 });
  assert.equal(observed.requestUpdates[0].options.session, session);
  assert.equal(observed.requestUpdates[0].update.$set.status, 'handled');
  assert.equal(result.request.status, 'handled');
});

test('auth: MongoDB Student listing uses an explicit projection, deterministic sort, and bounded limit', async () => {
  const observed = {};
  const cursor = {
    sort(value) { observed.sort = value; return cursor; },
    limit(value) { observed.limit = value; return cursor; },
    async toArray() { return []; },
  };
  const database = {
    collection: () => ({
      find(filter, options) { observed.filter = filter; observed.options = options; return cursor; },
    }),
  };
  const store = createMongoAuthStore({ database });
  await store.listStudents({ limit: 1000 });
  assert.deepEqual(observed.filter, { role: 'student' });
  assert.deepEqual(observed.sort, { createdAt: -1, email: 1, id: 1 });
  assert.equal(observed.limit, 100);
  assert.deepEqual(observed.options.projection, {
    _id: 0, id: 1, name: 1, email: 1, 'studentProfile.studentIdNumber': 1, role: 1, active: 1,
    mustChangePassword: 1, createdAt: 1,
  });
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
  assert.ok(indexes.some((index) => index.collection === 'users' &&
    index.keys['studentProfile.studentIdNumber'] && index.options.unique &&
    index.options.partialFilterExpression?.['studentProfile.studentIdNumber']?.$type === 'string'));
  assert.ok(indexes.some((index) => index.collection === 'authSessions' && index.keys.expiresAt && index.options.expireAfterSeconds === 0));
  assert.ok(indexes.some((index) => index.collection === 'passwordResetRequests' && index.keys.id && index.options.unique));
  assert.ok(indexes.some((index) => index.collection === 'passwordResetRequests' && index.keys.retentionExpiresAt && index.options.expireAfterSeconds === 0));
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
  await subject.service.requestStudentPasswordReset(student.id);
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
