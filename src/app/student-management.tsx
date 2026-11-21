import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Brand } from '../constants/brand';
import { ApiError } from '../services/api';
import { useSession, validEmail } from '../services/auth';
import {
  createStudent,
  listStudents,
  requestStudentPasswordReset,
  type StudentAccount,
  updateStudentStatus,
} from '../services/students';

type StudentListState = {
  token: string;
  items: StudentAccount[];
  error: string;
  loading: boolean;
};

function orderedStudents(items: StudentAccount[]) {
  return [...items].sort((left, right) => {
    const dateOrder = new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    return dateOrder || left.email.localeCompare(right.email) || left.id.localeCompare(right.id);
  });
}

export default function StudentManagementScreen() {
  const session = useSession();
  const { width } = useWindowDimensions();
  const token = session?.token;
  const role = session?.user.role;
  const isDemo = session?.demo;
  const emailInput = useRef<TextInput>(null);
  const studentIdInput = useRef<TextInput>(null);
  const requestGeneration = useRef(0);
  const resetGeneration = useRef(0);
  const lifecycleGeneration = useRef(0);

  const [name, setName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [credential, setCredential] = useState<{
    owner: string;
    name: string;
    studentIdNumber: string;
    email: string;
    password: string;
  } | null>(null);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [reload, setReload] = useState(0);
  const [listState, setListState] = useState<StudentListState | null>(null);
  const [resetTarget, setResetTarget] = useState<StudentAccount | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState('');
  const [resetError, setResetError] = useState('');
  const [lifecycleTarget, setLifecycleTarget] = useState<StudentAccount | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [lifecycleNotice, setLifecycleNotice] = useState('');
  const [lifecycleError, setLifecycleError] = useState('');

  useEffect(() => {
    const clear = setTimeout(() => {
      setName('');
      setStudentIdNumber('');
      setEmail('');
      setFormError('');
      setNotice('');
      setCreating(false);
      setCredential(null);
      setPasswordRevealed(false);
      setCopyStatus('');
      setResetTarget(null);
      setResettingId(null);
      setResetNotice('');
      setResetError('');
      setLifecycleTarget(null);
      setStatusUpdatingId(null);
      setLifecycleNotice('');
      setLifecycleError('');
    }, 0);
    return () => {
      clearTimeout(clear);
      requestGeneration.current += 1;
      resetGeneration.current += 1;
      lifecycleGeneration.current += 1;
    };
  }, [token]);

  useEffect(() => {
    if (!token || isDemo || role !== 'admin') return;
    const currentToken = token;
    const controller = new AbortController();

    async function load() {
      try {
        const items = await listStudents(controller.signal);
        if (!controller.signal.aborted) {
          setListState({ token: currentToken, items, error: '', loading: false });
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setListState({
            token: currentToken,
            items: [],
            error: cause instanceof Error ? cause.message : 'Unable to load Student accounts.',
            loading: false,
          });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [token, role, isDemo, reload]);

  const clearInitialPassword = () => {
    setCredential(null);
    setPasswordRevealed(false);
    setCopyStatus('');
  };

  const handleBack = () => {
    clearInitialPassword();
    router.replace('/admin-dashboard');
  };

  const handleRefresh = () => {
    if (!token) return;
    setListState((current) => ({
      token,
      items: current?.token === token ? current.items : [],
      error: '',
      loading: true,
    }));
    setReload((value) => value + 1);
  };

  const handleCreate = async () => {
    if (creating || !token) return;
    const normalizedName = name.trim();
    const normalizedStudentIdNumber = studentIdNumber.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || normalizedName.length > 100) {
      setFormError('Enter a full name between 1 and 100 characters.');
      return;
    }
    if (!normalizedStudentIdNumber || normalizedStudentIdNumber.length > 50) {
      setFormError('Enter a Student ID Number between 1 and 50 characters.');
      studentIdInput.current?.focus();
      return;
    }
    if (!validEmail(normalizedEmail)) {
      setFormError('Enter a valid institutional email address.');
      emailInput.current?.focus();
      return;
    }

    const requestToken = token;
    const generation = ++requestGeneration.current;
    setFormError('');
    setNotice('');
    clearInitialPassword();
    setCreating(true);

    try {
      const result = await createStudent(normalizedName, normalizedStudentIdNumber, normalizedEmail);
      if (requestGeneration.current !== generation) return;
      setCredential({
        owner: requestToken,
        name: result.user.name,
        studentIdNumber: result.user.studentIdNumber || normalizedStudentIdNumber,
        email: result.user.email,
        password: result.initialPassword,
      });
      setPasswordRevealed(false);
      setNotice('Student account created. Deliver the initial password through an approved private channel.');
      setName('');
      setStudentIdNumber('');
      setEmail('');
      setListState((current) => {
        const existing = current?.token === requestToken ? current.items : [];
        const deduplicated = existing.filter(
          (item) => item.id !== result.user.id && item.email !== result.user.email,
        );
        return {
          token: requestToken,
          items: orderedStudents([result.user, ...deduplicated]),
          error: '',
          loading: false,
        };
      });
    } catch (cause) {
      if (requestGeneration.current !== generation) return;
      if (cause instanceof ApiError && cause.status < 500) {
        setFormError(cause.message);
      } else {
        setFormError(
          'Account creation could not be confirmed. Refresh the Student list before trying again because the account may already exist.',
        );
      }
    } finally {
      if (requestGeneration.current === generation) setCreating(false);
    }
  };

  // Copies only the in-memory one-time password and never persists it in application storage.
  const handleCopyPassword = async () => {
    const active = credential?.owner === token ? credential : null;
    if (!active) return;
    setCopyStatus('');
    try {
      const copied = await Clipboard.setStringAsync(active.password);
      setCopyStatus(copied ? 'Temporary password copied.' : 'The password could not be copied on this device.');
    } catch {
      setCopyStatus('The password could not be copied on this device.');
    }
  };

  const handleResetPassword = async (student: StudentAccount) => {
    if (resettingId || !token) return;
    const generation = ++resetGeneration.current;
    setResettingId(student.id);
    setResetError('');
    setResetNotice('');
    try {
      const result = await requestStudentPasswordReset(student.id);
      if (resetGeneration.current !== generation) return;
      setResetNotice(result.message);
      setResetTarget(null);
    } catch (cause) {
      if (resetGeneration.current !== generation) return;
      setResetError(cause instanceof Error ? cause.message : 'Unable to send the password reset email.');
    } finally {
      if (resetGeneration.current === generation) setResettingId(null);
    }
  };

  // Applies a Student lifecycle transition and immediately reconciles the visible account row.
  const handleStatusChange = async (student: StudentAccount, active: boolean) => {
    if (statusUpdatingId || !token) return;
    const generation = ++lifecycleGeneration.current;
    const requestToken = token;
    setStatusUpdatingId(student.id);
    setLifecycleError('');
    setLifecycleNotice('');
    try {
      const result = await updateStudentStatus(student.id, active);
      if (lifecycleGeneration.current !== generation) return;
      setListState((current) => {
        if (current?.token !== requestToken) return current;
        return {
          ...current,
          items: current.items.map((item) => item.id === result.user.id ? result.user : item),
        };
      });
      setLifecycleNotice(
        active
          ? `${result.user.name} has been reactivated and must sign in again.`
          : `${result.user.name} has been deactivated. Existing sessions are no longer valid.`,
      );
      setLifecycleTarget(null);
      if (!active && resetTarget?.id === student.id) setResetTarget(null);
    } catch (cause) {
      if (lifecycleGeneration.current !== generation) return;
      setLifecycleError(cause instanceof Error ? cause.message : 'Unable to update the Student account status.');
    } finally {
      if (lifecycleGeneration.current === generation) setStatusUpdatingId(null);
    }
  };

  if (!session || session.demo || session.user.role !== 'admin') return null;

  const currentList = listState?.token === token ? listState : null;
  const students = currentList?.items ?? [];
  const listLoading = currentList === null || currentList.loading;
  const activeCredential = credential?.owner === token ? credential : null;
  const twoColumns = width >= 900;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.brand}>TRAIL AI Desk</Text>
          <Text style={styles.headerSubtitle}>Administrator Workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to dashboard</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>USER MANAGEMENT</Text>
        <Text accessibilityRole="header" style={styles.title}>Student Account Management</Text>
        <Text style={styles.subtitle}>
          Admin-controlled provisioning for approved Student accounts. Public self-registration remains disabled.
        </Text>

        <View style={[styles.sections, twoColumns && styles.sectionsWide]}>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.cardTitle}>Create Student Account</Text>
            <Text style={styles.cardDescription}>
              Enter the approved Student identity. The backend assigns the Student role and generates a secure initial password.
            </Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              accessibilityLabel="Student full name"
              value={name}
              onChangeText={(value) => { setName(value); setFormError(''); }}
              editable={!creating}
              maxLength={100}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => studentIdInput.current?.focus()}
              placeholder="Approved Student name"
              placeholderTextColor={Brand.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Student ID Number</Text>
            <TextInput
              ref={studentIdInput}
              accessibilityLabel="Student ID Number"
              value={studentIdNumber}
              onChangeText={(value) => { setStudentIdNumber(value); setFormError(''); }}
              editable={!creating}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailInput.current?.focus()}
              placeholder="Enter the approved Student ID Number"
              placeholderTextColor={Brand.muted}
              style={styles.input}
            />

            <Text style={styles.label}>Institutional Email</Text>
            <TextInput
              ref={emailInput}
              accessibilityLabel="Student institutional email"
              value={email}
              onChangeText={(value) => { setEmail(value); setFormError(''); }}
              editable={!creating}
              maxLength={254}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="go"
              onSubmitEditing={() => { void handleCreate(); }}
              placeholder="student@ustp.edu.ph"
              placeholderTextColor={Brand.muted}
              style={styles.input}
            />

            {formError !== '' && <Text accessibilityRole="alert" style={styles.error}>{formError}</Text>}
            {notice !== '' && <Text accessibilityLiveRegion="polite" style={styles.success}>{notice}</Text>}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: creating, disabled: creating }}
              disabled={creating}
              onPress={() => { void handleCreate(); }}
              style={[styles.primaryButton, creating && styles.disabledButton]}
            >
              {creating && <ActivityIndicator color={Brand.surface} />}
              <Text style={styles.primaryButtonText}>{creating ? 'Creating account…' : 'Create Student Account'}</Text>
            </Pressable>

            {activeCredential && (
              <View style={styles.passwordCard} accessibilityLiveRegion="polite">
                <Text style={styles.passwordTitle}>Student credentials — shown once</Text>
                <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Full Name: </Text>{activeCredential.name}</Text>
                <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Student ID Number: </Text>{activeCredential.studentIdNumber}</Text>
                <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Registered Email: </Text>{activeCredential.email}</Text>
                <Text style={styles.credentialLabel}>Temporary Password</Text>
                <Text selectable={passwordRevealed} style={styles.passwordValue}>
                  {passwordRevealed ? activeCredential.password : '•••••••••••••••••••••••••••••••••••••••••••'}
                </Text>
                <Text style={styles.passwordNotice}>
                  Deliver these credentials through an approved private channel. The Student must replace the temporary password at first sign-in.
                </Text>
                {copyStatus !== '' && <Text accessibilityLiveRegion="polite" style={styles.copyStatus}>{copyStatus}</Text>}
                <View style={styles.passwordActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={passwordRevealed ? 'Hide initial password' : 'Reveal initial password'}
                    onPress={() => setPasswordRevealed((value) => !value)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>{passwordRevealed ? 'Hide password' : 'Reveal password'}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Copy temporary password"
                    onPress={() => { void handleCopyPassword(); }}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Copy password</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={clearInitialPassword} style={styles.textButton}>
                    <Text style={styles.textButtonText}>Dismiss and clear</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.listHeading}>
              <View style={styles.listHeadingCopy}>
                <Text accessibilityRole="header" style={styles.cardTitle}>Existing Students</Text>
                <Text style={styles.cardDescription}>Up to 100 Student accounts, ordered deterministically.</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={handleRefresh} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Refresh list</Text>
              </Pressable>
            </View>

            {resetNotice !== '' && (
              <Text accessibilityLiveRegion="polite" style={styles.success}>{resetNotice}</Text>
            )}
            {resetError !== '' && (
              <Text accessibilityRole="alert" style={styles.error}>{resetError}</Text>
            )}
            {lifecycleNotice !== '' && (
              <Text accessibilityLiveRegion="polite" style={styles.success}>{lifecycleNotice}</Text>
            )}
            {lifecycleError !== '' && (
              <Text accessibilityRole="alert" style={styles.error}>{lifecycleError}</Text>
            )}

            {listLoading ? (
              <View style={styles.centerState}><ActivityIndicator color={Brand.blue} /><Text style={styles.stateText}>Loading Student accounts…</Text></View>
            ) : currentList?.error ? (
              <Text accessibilityRole="alert" style={styles.error}>{currentList.error}</Text>
            ) : students.length === 0 ? (
              <Text style={styles.stateText}>No Student accounts are currently available.</Text>
            ) : (
              <View style={styles.studentList}>
                {students.map((student) => (
                  <View key={student.id} style={styles.studentEntry}>
                    <View style={styles.studentRow}>
                      <View style={styles.studentCopy}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentEmail}>Student ID: {student.studentIdNumber || 'Not assigned to this legacy account'}</Text>
                        <Text style={styles.studentEmail}>{student.email}</Text>
                      </View>
                      <View style={styles.studentActions}>
                        <View style={[styles.statusBadge, student.active ? styles.statusActive : styles.statusInactive]}>
                          <Text style={[styles.statusText, student.active ? styles.statusTextActive : styles.statusTextInactive]}>
                            {student.active ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Reset password for ${student.name}`}
                          accessibilityState={{ disabled: !student.active || resettingId !== null || statusUpdatingId !== null }}
                          disabled={!student.active || resettingId !== null || statusUpdatingId !== null}
                          onPress={() => {
                            setResetError('');
                            setResetNotice('');
                            setResetTarget(student);
                          }}
                          style={[styles.resetButton, (!student.active || resettingId !== null || statusUpdatingId !== null) && styles.disabledButton]}
                        >
                          <Text style={styles.resetButtonText}>Reset Password</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${student.active ? 'Deactivate' : 'Reactivate'} ${student.name}`}
                          accessibilityState={{
                            busy: statusUpdatingId === student.id,
                            disabled: statusUpdatingId !== null || resettingId !== null,
                          }}
                          disabled={statusUpdatingId !== null || resettingId !== null}
                          onPress={() => {
                            setLifecycleError('');
                            setLifecycleNotice('');
                            if (student.active) setLifecycleTarget(student);
                            else void handleStatusChange(student, true);
                          }}
                          style={[
                            student.active ? styles.deactivateButton : styles.reactivateButton,
                            (statusUpdatingId !== null || resettingId !== null) && styles.disabledButton,
                          ]}
                        >
                          <Text style={student.active ? styles.deactivateButtonText : styles.reactivateButtonText}>
                            {statusUpdatingId === student.id
                              ? 'Updatingâ€¦'
                              : student.active ? 'Deactivate' : 'Reactivate'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    {resetTarget?.id === student.id && (
                      <View style={styles.confirmation}>
                        <Text style={styles.confirmationText}>
                          Send a single-use reset link to {student.email}? The address cannot be changed here.
                        </Text>
                        <View style={styles.confirmationActions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ busy: resettingId === student.id }}
                            disabled={resettingId !== null}
                            onPress={() => { void handleResetPassword(student); }}
                            style={[styles.primarySmallButton, resettingId !== null && styles.disabledButton]}
                          >
                            <Text style={styles.primarySmallButtonText}>
                              {resettingId === student.id ? 'Sending…' : 'Send reset email'}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            disabled={resettingId !== null}
                            onPress={() => setResetTarget(null)}
                            style={styles.secondaryButton}
                          >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                    {lifecycleTarget?.id === student.id && student.active && (
                      <View style={styles.confirmation}>
                        <Text style={styles.confirmationText}>
                          Deactivate {student.name} ({student.studentIdNumber || student.email})? The account data will be retained, but the Student will be signed out and unable to log in until reactivated.
                        </Text>
                        <View style={styles.confirmationActions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Confirm deactivation for ${student.name}`}
                            accessibilityState={{ busy: statusUpdatingId === student.id }}
                            disabled={statusUpdatingId !== null}
                            onPress={() => { void handleStatusChange(student, false); }}
                            style={[styles.deactivateConfirmButton, statusUpdatingId !== null && styles.disabledButton]}
                          >
                            <Text style={styles.deactivateConfirmButtonText}>
                              {statusUpdatingId === student.id ? 'Deactivatingâ€¦' : 'Confirm Deactivation'}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            disabled={statusUpdatingId !== null}
                            onPress={() => setLifecycleTarget(null)}
                            style={styles.secondaryButton}
                          >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { backgroundColor: Brand.navy, paddingHorizontal: 28, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  headerCopy: { flexShrink: 1 },
  brand: { color: Brand.surface, fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  backButton: { borderWidth: 1, borderColor: Brand.onNavy, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  backButtonText: { color: Brand.surface, fontWeight: '700' },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: 24, paddingBottom: 64 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginTop: 12, marginBottom: 10 },
  title: { color: Brand.navy, fontSize: 32, fontWeight: '800' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 22 },
  sections: { gap: 18 },
  sectionsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  card: { flex: 1, minWidth: 0, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 22 },
  cardTitle: { color: Brand.navy, fontSize: 20, fontWeight: '800' },
  cardDescription: { color: Brand.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 },
  label: { color: Brand.ink, fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { minHeight: 50, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 14, color: Brand.ink, backgroundColor: Brand.surface, fontSize: 15, marginBottom: 16 },
  primaryButton: { minHeight: 50, backgroundColor: Brand.navy, borderRadius: 9, paddingHorizontal: 18, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: Brand.surface, fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.55 },
  secondaryButton: { minHeight: 44, borderWidth: 1, borderColor: Brand.blue, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: Brand.blue, fontSize: 13, fontWeight: '800' },
  textButton: { minHeight: 44, paddingHorizontal: 4, justifyContent: 'center' },
  textButtonText: { color: Brand.error, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  error: { color: Brand.error, backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: '#F0C5CA', borderRadius: 8, padding: 12, lineHeight: 20, marginBottom: 12 },
  success: { color: Brand.success, backgroundColor: '#EDF8F3', borderWidth: 1, borderColor: '#B8DECD', borderRadius: 8, padding: 12, lineHeight: 20, marginBottom: 12 },
  passwordCard: { marginTop: 18, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: Brand.gold, backgroundColor: Brand.goldPale },
  passwordTitle: { color: Brand.navy, fontSize: 15, fontWeight: '800' },
  credentialLine: { color: Brand.ink, fontSize: 14, lineHeight: 21, marginTop: 8 },
  credentialLabel: { color: Brand.navy, fontSize: 14, fontWeight: '800' },
  passwordValue: { color: Brand.ink, fontSize: 16, fontWeight: '700', letterSpacing: 0.5, marginTop: 12 },
  passwordNotice: { color: Brand.muted, fontSize: 13, lineHeight: 20, marginTop: 12 },
  copyStatus: { color: Brand.success, fontSize: 13, lineHeight: 20, marginTop: 10 },
  passwordActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 14 },
  listHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  listHeadingCopy: { flex: 1, minWidth: 0 },
  centerState: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18 },
  stateText: { color: Brand.muted, fontSize: 14, lineHeight: 21 },
  studentList: { gap: 10 },
  studentEntry: { borderWidth: 1, borderColor: Brand.line, borderRadius: 10, overflow: 'hidden' },
  studentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: 14 },
  studentCopy: { flex: 1, minWidth: 0 },
  studentName: { color: Brand.ink, fontSize: 15, fontWeight: '800' },
  studentEmail: { color: Brand.muted, fontSize: 13, marginTop: 4 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusActive: { backgroundColor: '#E3F3EB' },
  statusInactive: { backgroundColor: '#F3E8EA' },
  statusText: { fontSize: 12, fontWeight: '800' },
  statusTextActive: { color: Brand.success },
  statusTextInactive: { color: Brand.error },
  studentActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 8 },
  resetButton: { minHeight: 40, borderWidth: 1, borderColor: Brand.blue, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  resetButtonText: { color: Brand.blue, fontSize: 12, fontWeight: '800' },
  deactivateButton: { minHeight: 40, borderWidth: 1, borderColor: Brand.error, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  deactivateButtonText: { color: Brand.error, fontSize: 12, fontWeight: '800' },
  reactivateButton: { minHeight: 40, borderWidth: 1, borderColor: Brand.success, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  reactivateButtonText: { color: Brand.success, fontSize: 12, fontWeight: '800' },
  deactivateConfirmButton: { minHeight: 44, backgroundColor: Brand.error, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  deactivateConfirmButtonText: { color: Brand.surface, fontSize: 13, fontWeight: '800' },
  confirmation: { borderTopWidth: 1, borderTopColor: Brand.line, backgroundColor: Brand.goldPale, padding: 14 },
  confirmationText: { color: Brand.ink, fontSize: 13, lineHeight: 20 },
  confirmationActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  primarySmallButton: { minHeight: 44, backgroundColor: Brand.navy, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  primarySmallButtonText: { color: Brand.surface, fontSize: 13, fontWeight: '800' },
});
