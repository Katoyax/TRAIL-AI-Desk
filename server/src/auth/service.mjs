import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { createResetEmailSender, parseResetUrl } from './email.mjs';
import { hashPassword, validatePassword, verifyPassword } from './password.mjs';
import { createMongoAuthStore } from './store.mjs';

const resetMessage = 'If the account is eligible, the password reset request has been submitted for Admin review.';
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const identifierPattern = /^[A-Za-z0-9_-]{1,100}$/;
const accountRoles = ['student', 'admin', 'knowledge_manager'];
const staffRoles = ['admin', 'knowledge_manager'];
const fail = (status, message) => Object.assign(new Error(message), { status });
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  mustChangePassword: user.mustChangePassword === true,
});
const publicStudent = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  studentIdNumber: user.studentProfile?.studentIdNumber || null,
  role: 'student',
  active: user.active === true,
  mustChangePassword: user.mustChangePassword === true,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt || null,
});
const publicKnowledgeManager = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: 'knowledge_manager',
  active: user.active === true,
  mustChangePassword: user.mustChangePassword === true,
  createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt || null,
});
const publicProvisionedUser = (user) => ({
  ...publicUser(user),
  ...(user.studentProfile ? { studentProfile: user.studentProfile } : {}),
  active: user.active === true,
  createdAt: user.createdAt.toISOString(),
});
const publicPasswordRequest = (request, student) => ({
  id: request.id,
  studentId: request.studentId,
  studentName: student.name,
  studentEmail: student.email,
  requestedAt: request.requestedAt instanceof Date ? request.requestedAt.toISOString() : request.requestedAt,
  status: request.status,
  resolutionAt: request.resolutionAt instanceof Date ? request.resolutionAt.toISOString() : request.resolutionAt || null,
});

export function normalizeEmail(email) {
  if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw fail(400, 'Enter a valid email address.');
  }
  return email.trim().toLowerCase();
}

// Validates a Student ID as an opaque string without inventing a university format.
export function normalizeStudentIdNumber(studentIdNumber) {
  if (typeof studentIdNumber !== 'string') throw fail(400, 'Enter the Student ID Number.');
  const normalized = studentIdNumber.trim();
  if (!normalized || normalized.length > 50 || /[\u0000-\u001f\u007f]/.test(normalized)) {
    throw fail(400, 'Enter a Student ID Number between 1 and 50 characters.');
  }
  return normalized;
}

function duration(configValue, fallback, minimum, maximum) {
  const parsed = Number(configValue);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? Math.round(parsed) : fallback;
}

// Only the CLI and controlled test fixtures provision accounts. There is no
// public registration endpoint that accepts a role supplied by a student.
export async function provisionUser(store, {
  email,
  password,
  name,
  role,
  studentIdNumber,
}) {
  if (!store) throw fail(503, 'Account storage is unavailable. Configure MongoDB first.');
  if (!accountRoles.includes(role)) throw fail(400, 'Choose a supported account role explicitly.');
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) throw fail(400, 'Enter a name between 1 and 100 characters.');
  if (role !== 'student' && studentIdNumber !== undefined) throw fail(400, 'Student ID Numbers may be assigned only to Student accounts.');
  const studentProfile = role === 'student'
    ? { studentIdNumber: normalizeStudentIdNumber(studentIdNumber) }
    : undefined;
  const user = {
    id: randomUUID(), email: normalizeEmail(email), name: name.trim(), role,
    passwordHash: await hashPassword(password), active: true, credentialVersion: 1, createdAt: new Date(),
    ...(studentProfile ? { studentProfile } : {}),
    ...(['student', 'knowledge_manager'].includes(role) ? { mustChangePassword: true } : {}),
  };
  try { await store.insertUser(user); }
  catch (error) {
    if (error.code === 11000) {
      const studentIdDuplicate = error.keyPattern?.['studentProfile.studentIdNumber'] ||
        error.keyValue?.['studentProfile.studentIdNumber'];
      throw fail(409, studentIdDuplicate
        ? 'An account already exists for this Student ID Number.'
        : 'An account already exists for this email.');
    }
    throw fail(503, 'Account storage is unavailable.');
  }
  return publicProvisionedUser(user);
}

export function createAuthService({ connection = null, store = createMongoAuthStore(connection), config = process.env, emailSender = createResetEmailSender(config), now = () => new Date(), logger = console } = {}) {
  const sessionHours = duration(config.AUTH_SESSION_HOURS, 12, 1, 168);
  const resetMinutes = duration(config.PASSWORD_RESET_MINUTES, 15, 5, 60);
  const requestRetentionDays = duration(config.PASSWORD_RESET_REQUEST_RETENTION_DAYS, 30, 1, 365);
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

  // Resolves a valid session to its full User record for internal authorization decisions.
  async function authenticatedUser(authorization) {
    const token = bearerToken(authorization);
    requireStore();
    const session = await databaseCall(() => store.findSessionByHash(hashToken(token)));
    const expiresAt = new Date(session?.expiresAt).getTime();
    if (!session || !Number.isFinite(expiresAt) || expiresAt <= now().getTime()) throw fail(401, 'The session has expired. Sign in again.');
    const user = await databaseCall(() => store.findUserById(session.userId));
    if (!user || user.active !== true || !accountRoles.includes(user.role) || user.credentialVersion !== session.credentialVersion) throw fail(401, 'The session is no longer valid. Sign in again.');
    return user;
  }

  async function issuePasswordReset(user) {
    if (!emailSender || !resetUrl) throw fail(503, 'Password reset email is not configured. Contact the university support team.');
    const token = newToken();
    const tokenHash = hashToken(token);
    const requestedAt = now();
    const expiresAt = new Date(requestedAt.getTime() + resetMinutes * 60 * 1000);
    const changed = await databaseCall(() => store.setPasswordReset(
      user.id,
      { tokenHash, expiresAt, requestedAt, cooldownMS: 60_000 },
    ));
    if (!changed) throw fail(429, 'A password reset email was requested recently. Wait before requesting another.');
    const link = new URL(resetUrl);
    link.searchParams.set('token', token);
    try {
      await emailSender({ email: user.email, resetUrl: link.toString(), expiresMinutes: resetMinutes });
    } catch {
      await databaseCall(() => store.clearPasswordReset(user.id, tokenHash));
      throw fail(503, 'Password reset email could not be sent. Check the configured email service.');
    }
    return { requestedAt };
  }

  async function recordStudentRecoveryRequest(user, requestedAt) {
    try {
      await databaseCall(() => store.createPasswordResetRequest({
        id: randomUUID(),
        studentId: user.id,
        requestedAt,
        status: 'pending',
        retentionExpiresAt: new Date(requestedAt.getTime() + requestRetentionDays * 24 * 60 * 60 * 1000),
      }));
    } catch {
      // Persistence failure must not make the generic public response reveal
      // whether the submitted email belongs to an eligible Student account.
      logger.error('Password recovery assistance notification could not be recorded.');
    }
  }

  const service = {
    get configured() { return Boolean(store); },
    get passwordResetConfigured() { return Boolean(store && emailSender && resetUrl); },
    async login({ email, password, role } = {}) {
      requireStore();
      if (role !== undefined && !staffRoles.includes(role)) {
        throw fail(400, 'Choose a valid staff login role.');
      }
      const normalizedEmail = normalizeEmail(email);
      if (typeof password !== 'string' || !password || password.length > 128) throw fail(400, 'Enter your password (up to 128 characters).');
      const user = await databaseCall(() => store.findUserByEmail(normalizedEmail));
      if (!dummyHash) dummyHash = hashPassword(newToken());
      const fallbackHash = await dummyHash;
      const encoded = user?.passwordHash || fallbackHash;
      const valid = await verifyPassword(password, encoded);
      if (!valid || user?.active !== true || !accountRoles.includes(user?.role) ||
          role !== undefined && user?.role !== role ||
          !Number.isInteger(user?.credentialVersion) || user.credentialVersion < 1) {
        throw fail(401, 'The email or password is incorrect.');
      }
      const token = newToken();
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + sessionHours * 60 * 60 * 1000);
      await databaseCall(() => store.createSession({
        tokenHash: hashToken(token), userId: user.id, credentialVersion: user.credentialVersion, createdAt, expiresAt,
      }));
      return { token, expiresAt: expiresAt.toISOString(), user: publicUser(user) };
    },
    async authenticate(authorization) {
      const user = await authenticatedUser(authorization);
      if (user.mustChangePassword === true) {
        throw fail(403, 'Change your temporary password before accessing protected features.');
      }
      return publicUser(user);
    },
    async getCurrentUser(authorization) {
      return publicUser(await authenticatedUser(authorization));
    },
    // Enforces one exact backend role after normal session and password-change checks.
    async requireRole(authorization, role) {
      if (!accountRoles.includes(role)) throw fail(500, 'The requested role guard is unavailable.');
      const user = await service.authenticate(authorization);
      if (user.role !== role) throw fail(403, 'This account is not authorized for the requested operation.');
      return user;
    },
    async requireAdmin(authorization) {
      return service.requireRole(authorization, 'admin');
    },
    async requireKnowledgeManager(authorization) {
      return service.requireRole(authorization, 'knowledge_manager');
    },
    async listStudents() {
      requireStore();
      const students = await databaseCall(() => store.listStudents({ limit: 100 }));
      return students
        .filter((user) => user?.role === 'student')
        .slice(0, 100)
        .map(publicStudent);
    },
    async provisionStudent(input = {}) {
      requireStore();
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw fail(400, 'Student account details must be a JSON object.');
      }
      const unexpected = Object.keys(input).filter((field) => !['name', 'email', 'studentIdNumber'].includes(field));
      if (unexpected.length) {
        throw fail(400, 'Only the Student name, Student ID Number, and email may be supplied.');
      }
      const studentIdNumber = normalizeStudentIdNumber(input.studentIdNumber);
      const initialPassword = newToken();
      const user = await provisionUser(store, {
        name: input.name,
        email: input.email,
        studentIdNumber,
        password: initialPassword,
        role: 'student',
      });
      return {
        user: publicStudent(user),
        initialPassword,
      };
    },
    async listKnowledgeManagers() {
      requireStore();
      const managers = await databaseCall(() => store.listKnowledgeManagers({ limit: 100 }));
      return managers
        .filter((user) => user?.role === 'knowledge_manager')
        .slice(0, 100)
        .map(publicKnowledgeManager);
    },
    // Provisions exactly the third application role; clients cannot supply another role.
    async provisionKnowledgeManager(input = {}) {
      requireStore();
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw fail(400, 'Knowledge-Base Manager account details must be a JSON object.');
      }
      const unexpected = Object.keys(input).filter((field) => !['name', 'email'].includes(field));
      if (unexpected.length) {
        throw fail(400, 'Only the Knowledge-Base Manager name and email may be supplied.');
      }
      const initialPassword = newToken();
      const user = await provisionUser(store, {
        name: input.name,
        email: input.email,
        password: initialPassword,
        role: 'knowledge_manager',
      });
      return { user: publicKnowledgeManager(user), initialPassword };
    },
    async updateKnowledgeManagerStatus(managerId, input = {}) {
      requireStore();
      if (typeof managerId !== 'string' || !identifierPattern.test(managerId)) {
        throw fail(400, 'Choose a valid Knowledge-Base Manager account.');
      }
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          Object.keys(input).length !== 1 || typeof input.active !== 'boolean') {
        throw fail(400, 'Provide only an active Boolean value.');
      }
      const current = await databaseCall(() => store.findUserById(managerId));
      if (!current || current.role !== 'knowledge_manager') {
        throw fail(404, 'Knowledge-Base Manager account not found.');
      }
      if (current.active === input.active) return publicKnowledgeManager(current);
      const updated = await databaseCall(() => store.updateKnowledgeManagerActive({
        userId: managerId,
        active: input.active,
      }));
      if (updated) return publicKnowledgeManager(updated);
      const latest = await databaseCall(() => store.findUserById(managerId));
      if (latest?.role === 'knowledge_manager' && latest.active === input.active) {
        return publicKnowledgeManager(latest);
      }
      throw fail(409, 'The Knowledge-Base Manager account changed before the status update completed. Refresh and try again.');
    },
    async updateStudentStatus(studentId, input = {}) {
      requireStore();
      if (typeof studentId !== 'string' || !identifierPattern.test(studentId)) {
        throw fail(400, 'Choose a valid Student account.');
      }
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          Object.keys(input).length !== 1 || typeof input.active !== 'boolean') {
        throw fail(400, 'Provide only an active Boolean value.');
      }
      const current = await databaseCall(() => store.findUserById(studentId));
      if (!current || current.role !== 'student') throw fail(404, 'Student account not found.');
      if (current.active === input.active) return publicStudent(current);

      const updated = await databaseCall(() => store.updateStudentActive({
        userId: studentId,
        active: input.active,
      }));
      if (updated) return publicStudent(updated);

      const latest = await databaseCall(() => store.findUserById(studentId));
      if (latest?.role === 'student' && latest.active === input.active) return publicStudent(latest);
      throw fail(409, 'The Student account changed before the status update completed. Refresh and try again.');
    },
    async changeInitialPassword(authorization, input = {}) {
      requireStore();
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          Object.keys(input).some((field) => !['currentPassword', 'password', 'confirmPassword'].includes(field))) {
        throw fail(400, 'Provide the current temporary password and the new password fields.');
      }
      const user = await authenticatedUser(authorization);
      if (!['student', 'knowledge_manager'].includes(user.role) || user.mustChangePassword !== true) {
        throw fail(409, 'This account does not require an initial password change.');
      }
      if (typeof input.currentPassword !== 'string' || !input.currentPassword || input.currentPassword.length > 128) {
        throw fail(400, 'Enter the current temporary password.');
      }
      if (!await verifyPassword(input.currentPassword, user.passwordHash)) {
        throw fail(401, 'The current temporary password is incorrect.');
      }
      validatePassword(input.password);
      if (input.confirmPassword !== input.password) throw fail(400, 'The passwords do not match.');
      if (await verifyPassword(input.password, user.passwordHash)) throw fail(400, 'Choose a new password that differs from the temporary password.');
      const passwordHash = await hashPassword(input.password);
      const changed = await databaseCall(() => store.completeInitialPasswordChange({
        userId: user.id,
        role: user.role,
        credentialVersion: user.credentialVersion,
        passwordHash,
        changedAt: now(),
      }));
      if (!changed) throw fail(409, 'The account changed before the password update completed. Sign in again.');
      return { message: 'Your password has been changed. Sign in again with the new password.' };
    },
    async requestStudentPasswordReset(studentId) {
      requireStore();
      if (typeof studentId !== 'string' || !identifierPattern.test(studentId)) throw fail(400, 'Choose a valid Student account.');
      const user = await databaseCall(() => store.findUserById(studentId));
      if (!user || user.role !== 'student' || user.active !== true) throw fail(404, 'Active Student account not found.');
      await issuePasswordReset(user);
      return { message: 'The password reset email was accepted for delivery to the Student registered address.' };
    },
    async listPasswordResetRequests() {
      requireStore();
      const result = await databaseCall(() => store.listPasswordResetRequests({ limit: 100 }));
      const items = await Promise.all(result.items.map(async (request) => {
        const student = await databaseCall(() => store.findUserById(request.studentId));
        return student?.role === 'student' ? publicPasswordRequest(request, student) : null;
      }));
      return {
        items: items.filter(Boolean),
        pendingCount: Number.isInteger(result.pendingCount) && result.pendingCount >= 0 ? result.pendingCount : 0,
      };
    },
    async updatePasswordResetRequest(id, input = {}, actor) {
      requireStore();
      if (typeof id !== 'string' || !identifierPattern.test(id)) throw fail(400, 'Choose a valid password reset request.');
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          Object.keys(input).some((field) => field !== 'status') ||
          input.status !== 'dismissed') {
        throw fail(400, 'Only dismissal is allowed without completing a password reset.');
      }
      const request = await databaseCall(() => store.updatePasswordResetRequest({
        id,
        status: input.status,
        resolutionAt: now(),
        resolvedBy: actor.id,
      }));
      if (!request) throw fail(404, 'Pending password reset request not found.');
      const student = await databaseCall(() => store.findUserById(request.studentId));
      if (!student || student.role !== 'student') throw fail(404, 'Student account not found.');
      return publicPasswordRequest(request, student);
    },
    // Atomically replaces an eligible Student password after documented Admin identity verification.
    async approvePasswordResetRequest(id, input = {}, actor) {
      requireStore();
      if (typeof id !== 'string' || !identifierPattern.test(id)) {
        throw fail(400, 'Choose a valid password reset request.');
      }
      if (!input || typeof input !== 'object' || Array.isArray(input) ||
          Object.keys(input).length !== 1 || input.identityVerified !== true) {
        throw fail(400, 'Confirm that the Student identity was verified through an approved procedure.');
      }

      const temporaryPassword = newToken();
      const passwordHash = await hashPassword(temporaryPassword);
      const result = await databaseCall(() => store.approvePasswordResetRequest({
        id,
        passwordHash,
        changedAt: now(),
        resolvedBy: actor.id,
      }));
      if (!result) {
        throw fail(409, 'The pending request could not be approved for an active Student. Refresh and review its status.');
      }

      return {
        request: publicPasswordRequest(result.request, result.user),
        credential: {
          studentName: result.user.name,
          studentIdNumber: result.user.studentProfile?.studentIdNumber || null,
          registeredEmail: result.user.email,
          temporaryPassword,
        },
      };
    },
    async logout(authorization) {
      const token = bearerToken(authorization);
      requireStore();
      await databaseCall(() => store.deleteSessionByHash(hashToken(token)));
      return { message: 'You have signed out.' };
    },
    // Records eligible Student requests for Admin review without requiring email delivery.
    async forgotPassword({ email } = {}) {
      requireStore();
      const normalizedEmail = normalizeEmail(email);
      if (pendingEmails.size >= 100) throw fail(503, 'Password reset requests are temporarily busy. Please try again.');
      // Lookup and persistence latency cannot change the public response timing.
      // The queue is bounded but process-local; production can replace it with
      // a durable job queue. The store atomically deduplicates pending requests.
      const job = Promise.resolve().then(async () => {
        const user = await databaseCall(() => store.findUserByEmail(normalizedEmail));
        if (!user || user.role !== 'student' || user.active !== true) return;
        await recordStudentRecoveryRequest(user, now());
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
