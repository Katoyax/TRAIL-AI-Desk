export async function ensureAuthIndexes(database) {
  const users = database.collection('users');
  const sessions = database.collection('authSessions');
  const passwordRequests = database.collection('passwordResetRequests');
  await Promise.all([
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
    users.createIndex(
      { 'studentProfile.studentIdNumber': 1 },
      {
        unique: true,
        name: 'unique_student_id_number',
        partialFilterExpression: { 'studentProfile.studentIdNumber': { $type: 'string' } },
      },
    ),
    users.createIndex({ resetTokenHash: 1 }, { unique: true, sparse: true }),
    sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    sessions.createIndex({ userId: 1 }),
    // TTL is only session housekeeping. Every authentication still checks expiry.
    // Knowledge sources and user documents never expire via TTL.
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    passwordRequests.createIndex({ id: 1 }, { unique: true }),
    passwordRequests.createIndex({ requestedAt: -1, id: 1 }),
    passwordRequests.createIndex(
      { studentId: 1, status: 1 },
      { unique: true, partialFilterExpression: { status: 'pending' } },
    ),
    passwordRequests.createIndex({ retentionExpiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}

export function createMongoAuthStore(connection) {
  if (!connection?.database) return null;
  const users = connection.database.collection('users');
  const sessions = connection.database.collection('authSessions');
  const passwordRequests = connection.database.collection('passwordResetRequests');
  const requestProjection = {
    _id: 0,
    id: 1,
    studentId: 1,
    requestedAt: 1,
    status: 1,
    resolutionAt: 1,
  };
  return {
    findUserByEmail: (email) => users.findOne({ email }),
    findUserById: (id) => users.findOne({ id }),
    listStudents: ({ limit = 100 } = {}) => users.find(
      { role: 'student' },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          email: 1,
          'studentProfile.studentIdNumber': 1,
          role: 1,
          active: 1,
          mustChangePassword: 1,
          createdAt: 1,
        },
      },
    ).sort({ createdAt: -1, email: 1, id: 1 }).limit(Math.min(Math.max(limit, 1), 100)).toArray(),
    listKnowledgeManagers: ({ limit = 100 } = {}) => users.find(
      { role: 'knowledge_manager' },
      {
        projection: {
          _id: 0,
          id: 1,
          name: 1,
          email: 1,
          role: 1,
          active: 1,
          mustChangePassword: 1,
          createdAt: 1,
        },
      },
    ).sort({ createdAt: -1, email: 1, id: 1 }).limit(Math.min(Math.max(limit, 1), 100)).toArray(),
    insertUser: (user) => users.insertOne(user),
    createSession: (session) => sessions.insertOne(session),
    findSessionByHash: (tokenHash) => sessions.findOne({ tokenHash }),
    deleteSessionByHash: (tokenHash) => sessions.deleteOne({ tokenHash }),
    async updateStudentActive({ userId, active }) {
      // Changing the credential version invalidates every session issued before this lifecycle transition.
      return users.findOneAndUpdate({
        id: userId,
        role: 'student',
        active: { $ne: active },
      }, {
        $set: { active },
        $inc: { credentialVersion: 1 },
      }, { returnDocument: 'after', includeResultMetadata: false });
    },
    async updateKnowledgeManagerActive({ userId, active }) {
      // A lifecycle transition invalidates every previously issued manager session.
      return users.findOneAndUpdate({
        id: userId,
        role: 'knowledge_manager',
        active: { $ne: active },
      }, {
        $set: { active },
        $inc: { credentialVersion: 1 },
      }, { returnDocument: 'after', includeResultMetadata: false });
    },
    async completeInitialPasswordChange({ userId, role, credentialVersion, passwordHash, changedAt }) {
      // The credential version check makes the password replacement and session revocation one atomic write.
      const result = await users.updateOne({
        id: userId,
        role: { $in: ['student', 'knowledge_manager'] },
        ...(role ? { role } : {}),
        active: true,
        mustChangePassword: true,
        credentialVersion,
      }, {
        $set: { passwordHash, passwordChangedAt: changedAt, mustChangePassword: false },
        $inc: { credentialVersion: 1 },
      });
      return result.modifiedCount === 1;
    },
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
        $set: { passwordHash, passwordChangedAt: now, mustChangePassword: false },
        $inc: { credentialVersion: 1 },
        $unset: { resetTokenHash: '', resetExpiresAt: '' },
      }, { returnDocument: 'after', includeResultMetadata: false, projection: { id: 1 } });
      return Boolean(user);
    },
    async createPasswordResetRequest(request) {
      try {
        return await passwordRequests.findOneAndUpdate(
          { studentId: request.studentId, status: 'pending' },
          { $setOnInsert: request },
          { upsert: true, returnDocument: 'after', includeResultMetadata: false, projection: requestProjection },
        );
      } catch (error) {
        if (error?.code !== 11000) throw error;
        return passwordRequests.findOne(
          { studentId: request.studentId, status: 'pending' },
          { projection: requestProjection },
        );
      }
    },
    async listPasswordResetRequests({ limit = 100 } = {}) {
      const bounded = Math.min(Math.max(limit, 1), 100);
      const [items, pendingCount] = await Promise.all([
        passwordRequests.find({}, { projection: requestProjection })
          .sort({ requestedAt: -1, id: 1 })
          .limit(bounded)
          .toArray(),
        passwordRequests.countDocuments({ status: 'pending' }),
      ]);
      return { items, pendingCount };
    },
    updatePasswordResetRequest({ id, status, resolutionAt, resolvedBy }) {
      return passwordRequests.findOneAndUpdate(
        { id, status: 'pending' },
        { $set: { status, resolutionAt, resolvedBy } },
        { returnDocument: 'after', includeResultMetadata: false, projection: requestProjection },
      );
    },
    async approvePasswordResetRequest({ id, passwordHash, changedAt, resolvedBy }) {
      const session = connection.client.startSession();
      let outcome = null;

      try {
        await session.withTransaction(async () => {
          outcome = null;
          const request = await passwordRequests.findOne(
            { id, status: 'pending' },
            { session, projection: requestProjection },
          );
          if (!request) return;

          const student = await users.findOne(
            { id: request.studentId, role: 'student', active: true },
            { session },
          );
          if (!student) return;

          const updatedStudent = await users.findOneAndUpdate({
            id: student.id,
            role: 'student',
            active: true,
            credentialVersion: student.credentialVersion,
          }, {
            $set: {
              passwordHash,
              passwordChangedAt: changedAt,
              mustChangePassword: true,
            },
            $inc: { credentialVersion: 1 },
            $unset: { resetTokenHash: '', resetExpiresAt: '' },
          }, {
            session,
            returnDocument: 'after',
            includeResultMetadata: false,
          });
          if (!updatedStudent) return;

          const resolvedRequest = await passwordRequests.findOneAndUpdate(
            { id, status: 'pending' },
            { $set: { status: 'handled', resolutionAt: changedAt, resolvedBy } },
            { session, returnDocument: 'after', includeResultMetadata: false, projection: requestProjection },
          );
          if (!resolvedRequest) {
            const conflict = new Error('Password reset request changed during approval.');
            conflict.code = 'RESET_APPROVAL_CONFLICT';
            throw conflict;
          }

          outcome = { request: resolvedRequest, user: updatedStudent };
        });
        return outcome;
      } catch (error) {
        if (error?.code === 'RESET_APPROVAL_CONFLICT') return null;
        throw error;
      } finally {
        // Session cleanup must not replace the outcome of an already committed reset.
        await session.endSession().catch(() => {});
      }
    },
  };
}
