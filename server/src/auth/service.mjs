import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createResetEmailSender, parseResetUrl } from './email.mjs';
import { hashPassword, validatePassword, verifyPassword } from './password.mjs';
import { createMongoAuthStore } from './store.mjs';

const resetMessage = 'If an account exists and email delivery succeeds, you will receive password reset instructions.';
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const fail = (status, message) => Object.assign(new Error(message), { status });
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export function normalizeEmail(email) {
  if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw fail(400, 'Enter a valid email address.');
  }
  return email.trim().toLowerCase();
}

function duration(configValue, fallback, minimum, maximum) {
  const parsed = Number(configValue);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? Math.round(parsed) : fallback;
}

// Only the CLI and controlled test fixtures provision accounts. There is no
// public registration endpoint that accepts a role supplied by a student.
export async function provisionUser(store, { email, password, name, role }) {
  if (!store) throw fail(503, 'Account storage is unavailable. Configure MongoDB first.');
  if (!['student', 'admin'].includes(role)) throw fail(400, 'Choose the student or admin role explicitly.');
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) throw fail(400, 'Enter a name between 1 and 100 characters.');
  const user = {
    id: randomUUID(), email: normalizeEmail(email), name: name.trim(), role,
    passwordHash: await hashPassword(password), active: true, credentialVersion: 1, createdAt: new Date(),
  };
  try { await store.insertUser(user); }
  catch (error) {
    if (error.code === 11000) throw fail(409, 'An account already exists for this email.');
    throw fail(503, 'Account storage is unavailable.');
  }
  return publicUser(user);
}

export function createAuthService({ connection = null, store = createMongoAuthStore(connection), config = process.env, emailSender = createResetEmailSender(config), now = () => new Date(), logger = console } = {}) {
  const sessionHours = duration(config.AUTH_SESSION_HOURS, 12, 1, 168);
  const resetMinutes = duration(config.PASSWORD_RESET_MINUTES, 15, 5, 60);
  const resetUrl = parseResetUrl(config.RESET_PASSWORD_URL);
  const pendingEmails = new Set();
  // Same KDF work for nonexistent and existing usernames, without a default
  // account, usable password, or hardcoded real credentials.
  let dummyHash;

  const requireStore = () => {
    if (!store) throw fail(503, 'Account sign-in is unavailable. Configure MongoDB first; demo access remains separate.');
  };
  async function databaseCall(operation) {
    try { return await operation(); }
    catch (error) {
      if (error.status) throw error;
      logger.error('Authentication database operation failed.');
      throw fail(503, 'Account storage is temporarily unavailable. Please try again.');
    }
  }
  function bearerToken(authorization) {
    if (typeof authorization !== 'string') throw fail(401, 'Sign in with an account to continue.');
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(authorization);
    if (!match) throw fail(401, 'The session is invalid. Sign in again.');
    return match[1];
  }

  const service = {
    get configured() { return Boolean(store); },
    get passwordResetConfigured() { return Boolean(store && emailSender && resetUrl); },
    async login({ email, password } = {}) {
      requireStore();
      const normalizedEmail = normalizeEmail(email);
      if (typeof password !== 'string' || !password || password.length > 128) throw fail(400, 'Enter your password (up to 128 characters).');
      const user = await databaseCall(() => store.findUserByEmail(normalizedEmail));
      if (!dummyHash) dummyHash = hashPassword(newToken());
      const fallbackHash = await dummyHash;
      const encoded = user?.passwordHash || fallbackHash;
      const valid = await verifyPassword(password, encoded);
      if (!valid || user?.active !== true || !['student', 'admin'].includes(user?.role) || !Number.isInteger(user?.credentialVersion) || user.credentialVersion < 1) throw fail(401, 'The email or password is incorrect.');
      const token = newToken();
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + sessionHours * 60 * 60 * 1000);
      await databaseCall(() => store.createSession({
        tokenHash: hashToken(token), userId: user.id, credentialVersion: user.credentialVersion, createdAt, expiresAt,
      }));
      return { token, expiresAt: expiresAt.toISOString(), user: publicUser(user) };
    },
    async authenticate(authorization) {
      const token = bearerToken(authorization);
      requireStore();
      const session = await databaseCall(() => store.findSessionByHash(hashToken(token)));
      const expiresAt = new Date(session?.expiresAt).getTime();
      if (!session || !Number.isFinite(expiresAt) || expiresAt <= now().getTime()) throw fail(401, 'The session has expired. Sign in again.');
      const user = await databaseCall(() => store.findUserById(session.userId));
      if (!user || user.active !== true || !['student', 'admin'].includes(user.role) || user.credentialVersion !== session.credentialVersion) throw fail(401, 'The session is no longer valid. Sign in again.');
      return publicUser(user);
    },
    async requireAdmin(authorization) {
      const user = await service.authenticate(authorization);
      if (user.role !== 'admin') throw fail(403, 'Administrator access is required.');
      return user;
    },
    async logout(authorization) {
      const token = bearerToken(authorization);
      requireStore();
      await databaseCall(() => store.deleteSessionByHash(hashToken(token)));
      return { message: 'You have signed out.' };
    },
    async forgotPassword({ email } = {}) {
      requireStore();
      const normalizedEmail = normalizeEmail(email);
      if (!emailSender || !resetUrl) throw fail(503, 'Password reset email is not configured. Contact the university support team.');
      if (pendingEmails.size >= 100) throw fail(503, 'Password reset requests are temporarily busy. Please try again.');
      // Lookup and provider latency cannot change the public response timing.
      // The queue is bounded but process-local; production can replace it with
      // a durable job queue. Each account has an atomic 60-second send cooldown.
      const job = Promise.resolve().then(async () => {
        const user = await databaseCall(() => store.findUserByEmail(normalizedEmail));
        if (!user || user.active !== true) return;
        const token = newToken();
        const tokenHash = hashToken(token);
        const requestedAt = now();
        const expiresAt = new Date(requestedAt.getTime() + resetMinutes * 60 * 1000);
        const changed = await databaseCall(() => store.setPasswordReset(user.id, { tokenHash, expiresAt, requestedAt, cooldownMS: 60_000 }));
        if (!changed) return;
        const link = new URL(resetUrl);
        link.searchParams.set('token', token);
        try { await emailSender({ email: user.email, resetUrl: link.toString(), expiresMinutes: resetMinutes }); }
        catch {
          await databaseCall(() => store.clearPasswordReset(user.id, tokenHash));
          logger.error('Password reset email was not accepted by the provider. Check server email configuration.');
        }
      }).catch(() => { logger.error('Password reset request could not be processed.'); });
      pendingEmails.add(job);
      void job.finally(() => pendingEmails.delete(job));
      return { message: resetMessage };
    },
    async waitForEmailJobs() { await Promise.all([...pendingEmails]); },
    async resetPassword({ token, password, confirmPassword } = {}) {
      requireStore();
      if (typeof token !== 'string' || !tokenPattern.test(token)) throw fail(400, 'The password reset link is invalid or expired. Request a new link.');
      validatePassword(password);
      if (confirmPassword !== undefined && confirmPassword !== password) throw fail(400, 'The passwords do not match.');
      const passwordHash = await hashPassword(password);
      const changed = await databaseCall(() => store.consumePasswordReset({ tokenHash: hashToken(token), passwordHash, now: now() }));
      if (!changed) throw fail(400, 'The password reset link is invalid or expired. Request a new link.');
      return { message: 'Your password has been reset. Sign in with your new password.' };
    },
  };
  return service;
}
