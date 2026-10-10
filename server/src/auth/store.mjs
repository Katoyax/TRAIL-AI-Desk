export async function ensureAuthIndexes(database) {
  const users = database.collection('users');
  const sessions = database.collection('authSessions');
  await Promise.all([
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex({ resetTokenHash: 1 }, { unique: true, sparse: true }),
    sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    sessions.createIndex({ userId: 1 }),
    // TTL is only session housekeeping. Every authentication still checks expiry.
    // Knowledge sources and user documents never expire via TTL.
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export function createMongoAuthStore(connection) {
  if (!connection?.database) return null;
  const users = connection.database.collection('users');
  const sessions = connection.database.collection('authSessions');
  return {
    findUserByEmail: (email) => users.findOne({ email }),
    findUserById: (id) => users.findOne({ id }),
    insertUser: (user) => users.insertOne(user),
    createSession: (session) => sessions.insertOne(session),
    findSessionByHash: (tokenHash) => sessions.findOne({ tokenHash }),
    deleteSessionByHash: (tokenHash) => sessions.deleteOne({ tokenHash }),
    async setPasswordReset(userId, { tokenHash, expiresAt, requestedAt, cooldownMS }) {
      const result = await users.updateOne({
        id: userId, active: true,
        $or: [{ resetRequestedAt: { $exists: false } }, { resetRequestedAt: { $lte: new Date(requestedAt.getTime() - cooldownMS) } }],
      }, { $set: { resetTokenHash: tokenHash, resetExpiresAt: expiresAt, resetRequestedAt: requestedAt } });
      return result.modifiedCount === 1;
    },
    clearPasswordReset: (userId, tokenHash) => users.updateOne(
      { id: userId, resetTokenHash: tokenHash },
      { $unset: { resetTokenHash: '', resetExpiresAt: '' } },
    ),
    async consumePasswordReset({ tokenHash, passwordHash, now }) {
      // Single-document atomic write: one caller wins; the password change and
      // token consumption cannot be separated even without MongoDB transactions.
      const user = await users.findOneAndUpdate({
        resetTokenHash: tokenHash, resetExpiresAt: { $gt: now }, active: true,
      }, {
        $set: { passwordHash, passwordChangedAt: now },
        $inc: { credentialVersion: 1 },
        $unset: { resetTokenHash: '', resetExpiresAt: '' },
      }, { returnDocument: 'after', includeResultMetadata: false, projection: { id: 1 } });
      return Boolean(user);
    },
  };
}
