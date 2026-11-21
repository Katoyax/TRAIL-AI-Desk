// Test-only adapter: production authentication always uses MongoDB.
export function createMemoryAuthStore(seedUsers = []) {
  const users = new Map(seedUsers.map((user) => [user.id, structuredClone(user)]));
  const sessions = new Map();
  const passwordRequests = new Map();
  const copy = (value) => value ? structuredClone(value) : null;
  return {
    snapshot() {
      return {
        users: [...users.values()].map(copy),
        sessions: [...sessions.values()].map(copy),
        passwordResetRequests: [...passwordRequests.values()].map(copy),
      };
    },
    async findUserByEmail(email) { return copy([...users.values()].find((user) => user.email === email)); },
    async findUserById(id) { return copy(users.get(id)); },
    async listStudents({ limit = 100 } = {}) {
      return [...users.values()]
        .filter((user) => user.role === 'student')
        .sort((left, right) => {
          const dateOrder = new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
          return dateOrder || left.email.localeCompare(right.email) || left.id.localeCompare(right.id);
        })
        .slice(0, Math.min(Math.max(limit, 1), 100))
        .map(copy);
    },
    async listKnowledgeManagers({ limit = 100 } = {}) {
      return [...users.values()]
        .filter((user) => user.role === 'knowledge_manager')
        .sort((left, right) => {
          const dateOrder = new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
          return dateOrder || left.email.localeCompare(right.email) || left.id.localeCompare(right.id);
        })
        .slice(0, Math.min(Math.max(limit, 1), 100))
        .map(copy);
    },
    async insertUser(user) {
      if ([...users.values()].some((item) => item.email === user.email)) throw Object.assign(new Error('Duplicate email'), { code: 11000 });
      if (user.studentProfile?.studentIdNumber && [...users.values()].some(
        (item) => item.studentProfile?.studentIdNumber === user.studentProfile.studentIdNumber,
      )) {
        throw Object.assign(new Error('Duplicate Student ID Number'), {
          code: 11000,
          keyPattern: { 'studentProfile.studentIdNumber': 1 },
        });
      }
      users.set(user.id, copy(user));
    },
    async createSession(session) { sessions.set(session.tokenHash, copy(session)); },
    async findSessionByHash(tokenHash) { return copy(sessions.get(tokenHash)); },
    async deleteSessionByHash(tokenHash) { sessions.delete(tokenHash); },
    async updateStudentActive({ userId, active }) {
      const user = users.get(userId);
      if (!user || user.role !== 'student' || user.active === active) return null;
      user.active = active;
      user.credentialVersion += 1;
      return copy(user);
    },
    async updateKnowledgeManagerActive({ userId, active }) {
      const user = users.get(userId);
      if (!user || user.role !== 'knowledge_manager' || user.active === active) return null;
      user.active = active;
      user.credentialVersion += 1;
      return copy(user);
    },
    async completeInitialPasswordChange({ userId, role, credentialVersion, passwordHash, changedAt }) {
      const user = users.get(userId);
      if (!user || !['student', 'knowledge_manager'].includes(user.role) || user.role !== role || user.active !== true ||
          user.mustChangePassword !== true || user.credentialVersion !== credentialVersion) return false;
      user.passwordHash = passwordHash;
      user.passwordChangedAt = new Date(changedAt);
      user.mustChangePassword = false;
      user.credentialVersion += 1;
      return true;
    },
    async setPasswordReset(userId, { tokenHash, expiresAt, requestedAt, cooldownMS }) {
      const user = users.get(userId);
      if (!user || user.active !== true || user.resetRequestedAt && user.resetRequestedAt.getTime() > requestedAt.getTime() - cooldownMS) return false;
      Object.assign(user, { resetTokenHash: tokenHash, resetExpiresAt: new Date(expiresAt), resetRequestedAt: new Date(requestedAt) });
      return true;
    },
    async clearPasswordReset(userId, tokenHash) {
      const user = users.get(userId);
      if (user?.resetTokenHash === tokenHash) { delete user.resetTokenHash; delete user.resetExpiresAt; }
    },
    async consumePasswordReset({ tokenHash, passwordHash, now }) {
      // No awaits before mutation: behaves as one atomic operation in tests.
      const user = [...users.values()].find((item) => item.resetTokenHash === tokenHash && item.resetExpiresAt > now && item.active === true);
      if (!user) return false;
      user.passwordHash = passwordHash;
      user.credentialVersion += 1;
      user.passwordChangedAt = new Date(now);
      user.mustChangePassword = false;
      delete user.resetTokenHash;
      delete user.resetExpiresAt;
      return true;
    },
    async createPasswordResetRequest(request) {
      const existing = [...passwordRequests.values()].find(
        (item) => item.studentId === request.studentId && item.status === 'pending',
      );
      if (existing) return copy(existing);
      passwordRequests.set(request.id, copy(request));
      return copy(request);
    },
    async listPasswordResetRequests({ limit = 100 } = {}) {
      const all = [...passwordRequests.values()];
      return {
        items: all
          .sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt) || left.id.localeCompare(right.id))
          .slice(0, Math.min(Math.max(limit, 1), 100))
          .map(copy),
        pendingCount: all.filter((item) => item.status === 'pending').length,
      };
    },
    async updatePasswordResetRequest({ id, status, resolutionAt, resolvedBy }) {
      const request = passwordRequests.get(id);
      if (!request || request.status !== 'pending') return null;
      Object.assign(request, { status, resolutionAt: new Date(resolutionAt), resolvedBy });
      return copy(request);
    },
    async approvePasswordResetRequest({ id, passwordHash, changedAt, resolvedBy }) {
      // Synchronous mutation makes the request claim and credential replacement atomic in tests.
      const request = passwordRequests.get(id);
      if (!request || request.status !== 'pending') return null;
      const user = users.get(request.studentId);
      if (!user || user.role !== 'student' || user.active !== true) return null;

      user.passwordHash = passwordHash;
      user.passwordChangedAt = new Date(changedAt);
      user.mustChangePassword = true;
      user.credentialVersion += 1;
      delete user.resetTokenHash;
      delete user.resetExpiresAt;
      Object.assign(request, {
        status: 'handled',
        resolutionAt: new Date(changedAt),
        resolvedBy,
      });
      return { request: copy(request), user: copy(user) };
    },
  };
}
