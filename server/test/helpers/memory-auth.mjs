// Test-only adapter: production authentication always uses MongoDB.
export function createMemoryAuthStore(seedUsers = []) {
  const users = new Map(seedUsers.map((user) => [user.id, structuredClone(user)]));
  const sessions = new Map();
  const copy = (value) => value ? structuredClone(value) : null;
  return {
    snapshot() { return { users: [...users.values()].map(copy), sessions: [...sessions.values()].map(copy) }; },
    async findUserByEmail(email) { return copy([...users.values()].find((user) => user.email === email)); },
    async findUserById(id) { return copy(users.get(id)); },
    async insertUser(user) {
      if ([...users.values()].some((item) => item.email === user.email)) throw Object.assign(new Error('Duplicate email'), { code: 11000 });
      users.set(user.id, copy(user));
    },
    async createSession(session) { sessions.set(session.tokenHash, copy(session)); },
    async findSessionByHash(tokenHash) { return copy(sessions.get(tokenHash)); },
    async deleteSessionByHash(tokenHash) { sessions.delete(tokenHash); },
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
      delete user.resetTokenHash;
      delete user.resetExpiresAt;
      return true;
    },
  };
}
