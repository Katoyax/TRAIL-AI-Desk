import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Brand } from '../constants/brand';
import {
  approvePasswordResetRequest,
  listPasswordResetRequests,
  updatePasswordResetRequest,
  type ApprovedPasswordReset,
  type PasswordResetRequest,
  type PasswordResetRequestList,
} from '../services/password-requests';
import { useSession } from '../services/auth';

type RequestState = PasswordResetRequestList & {
  token: string;
  loading: boolean;
  error: string;
};

type OneTimeCredential = ApprovedPasswordReset['credential'] & {
  owner: string;
};

// Formats a persisted request timestamp for the current device locale.
function readableDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : 'Invalid date';
}

// Lets an authenticated Admin review, approve, or dismiss Student recovery requests.
export default function PasswordRequestsScreen() {
  const session = useSession();
  const token = session?.token;
  const role = session?.user.role;
  const isDemo = session?.demo;
  const actionGeneration = useRef(0);
  const [state, setState] = useState<RequestState | null>(null);
  const [reload, setReload] = useState(0);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [approvalTarget, setApprovalTarget] = useState<PasswordResetRequest | null>(null);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [credential, setCredential] = useState<OneTimeCredential | null>(null);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const clear = setTimeout(() => {
      setApprovalTarget(null);
      setIdentityVerified(false);
      setCredential(null);
      setPasswordRevealed(false);
      setCopyStatus('');
    }, 0);
    return () => {
      clearTimeout(clear);
      actionGeneration.current += 1;
    };
  }, [token]);

  useEffect(() => {
    if (!token || isDemo || role !== 'admin') return;
    const currentToken = token;
    const controller = new AbortController();

    // Loads only the safe request fields exposed by the Admin API.
    async function load() {
      try {
        const result = await listPasswordResetRequests(controller.signal);
        if (!controller.signal.aborted) {
          setState({ token: currentToken, ...result, loading: false, error: '' });
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setState({
            token: currentToken,
            items: [],
            pendingCount: 0,
            loading: false,
            error: cause instanceof Error ? cause.message : 'Unable to load password reset requests.',
          });
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [token, role, isDemo, reload]);

  if (!session || session.demo || session.user.role !== 'admin') return null;

  const current = state?.token === token ? state : null;
  const loading = current === null || current.loading;
  const activeCredential = credential?.owner === token ? credential : null;

  const clearTemporaryCredential = () => {
    setCredential(null);
    setPasswordRevealed(false);
    setCopyStatus('');
  };

  const handleBack = () => {
    clearTemporaryCredential();
    router.replace('/admin-dashboard');
  };

  const refresh = () => {
    clearTemporaryCredential();
    setApprovalTarget(null);
    setIdentityVerified(false);
    setMessage('');
    setActionError('');
    setReload((value) => value + 1);
  };

  const beginApproval = (request: PasswordResetRequest) => {
    clearTemporaryCredential();
    setApprovalTarget(request);
    setIdentityVerified(false);
    setMessage('');
    setActionError('');
  };

  // Performs the one-time reset only after the Admin confirms identity verification.
  const approveReset = async (request: PasswordResetRequest) => {
    if (actionId || !identityVerified || !token) return;
    const generation = ++actionGeneration.current;
    setActionId(request.id);
    setMessage('');
    setActionError('');

    try {
      const result = await approvePasswordResetRequest(request.id);
      if (actionGeneration.current !== generation) return;
      setState((existing) => {
        if (!existing || existing.token !== token) return existing;
        return {
          ...existing,
          items: existing.items.map((item) => item.id === result.request.id ? result.request : item),
          pendingCount: Math.max(0, existing.pendingCount - 1),
        };
      });
      setCredential({ owner: token, ...result.credential });
      setPasswordRevealed(false);
      setCopyStatus('');
      setApprovalTarget(null);
      setIdentityVerified(false);
      setMessage('Student password reset completed. Deliver the temporary password through an approved private channel.');
    } catch (cause) {
      if (actionGeneration.current === generation) {
        const detail = cause instanceof Error ? cause.message : 'The reset could not be confirmed.';
        setActionError(`${detail} Refresh before trying again because the password may have changed.`);
      }
    } finally {
      if (actionGeneration.current === generation) setActionId(null);
    }
  };

  // Dismisses a pending request without changing the Student credential.
  const dismissRequest = async (request: PasswordResetRequest) => {
    if (actionId) return;
    const generation = ++actionGeneration.current;
    setActionId(request.id);
    setMessage('');
    setActionError('');

    try {
      const result = await updatePasswordResetRequest(request.id, 'dismissed');
      if (actionGeneration.current !== generation) return;
      setState((existing) => {
        if (!existing || existing.token !== token) return existing;
        return {
          ...existing,
          items: existing.items.map((item) => item.id === result.request.id ? result.request : item),
          pendingCount: Math.max(0, existing.pendingCount - 1),
        };
      });
      setApprovalTarget(null);
      setIdentityVerified(false);
      setMessage('Request dismissed without changing the Student password.');
    } catch (cause) {
      if (actionGeneration.current === generation) {
        setActionError(cause instanceof Error ? cause.message : 'Unable to dismiss the request.');
      }
    } finally {
      if (actionGeneration.current === generation) setActionId(null);
    }
  };

  const copyTemporaryPassword = async () => {
    if (!activeCredential) return;
    setCopyStatus('');
    try {
      const copied = await Clipboard.setStringAsync(activeCredential.temporaryPassword);
      setCopyStatus(copied
        ? 'Temporary password copied.'
        : 'The password could not be copied on this device.');
    } catch {
      setCopyStatus('The password could not be copied on this device.');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TRAIL AI Desk</Text>
          <Text style={styles.headerSubtitle}>Administrator Workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={handleBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back to dashboard</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>
        <Text accessibilityRole="header" style={styles.title}>Password Reset Requests</Text>
        <Text style={styles.subtitle}>
          Review Student recovery-assistance requests, verify identity, and issue a one-time temporary password.
        </Text>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            A Forgot Password submission does not verify the requester&apos;s identity. Complete the approved identity-assistance procedure before approving a reset.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Pending requests</Text>
            <Text style={styles.summaryValue}>{current?.pendingCount ?? '—'}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={refresh} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </Pressable>
        </View>

        {message !== '' && <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text>}
        {actionError !== '' && <Text accessibilityRole="alert" style={styles.error}>{actionError}</Text>}

        {activeCredential && (
          <View style={styles.passwordCard} accessibilityLiveRegion="polite">
            <Text style={styles.passwordTitle}>Recovery credentials — shown once</Text>
            <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Student Name: </Text>{activeCredential.studentName}</Text>
            {activeCredential.studentIdNumber && (
              <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Student ID Number: </Text>{activeCredential.studentIdNumber}</Text>
            )}
            <Text style={styles.credentialLine}><Text style={styles.credentialLabel}>Registered Email: </Text>{activeCredential.registeredEmail}</Text>
            <Text style={styles.credentialLabel}>Temporary Password</Text>
            <Text selectable={passwordRevealed} style={styles.passwordValue}>
              {passwordRevealed ? activeCredential.temporaryPassword : '•••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
            <Text style={styles.passwordNotice}>
              This password cannot be retrieved again. Deliver it through an approved private channel. The Student must replace it at the next login.
            </Text>
            {copyStatus !== '' && <Text accessibilityLiveRegion="polite" style={styles.copyStatus}>{copyStatus}</Text>}
            <View style={styles.passwordActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={passwordRevealed ? 'Hide temporary password' : 'Reveal temporary password'}
                onPress={() => setPasswordRevealed((value) => !value)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>{passwordRevealed ? 'Hide password' : 'Reveal password'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => { void copyTemporaryPassword(); }} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Copy password</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={clearTemporaryCredential} style={styles.dismissButton}>
                <Text style={styles.dismissText}>Dismiss and clear</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.state}><ActivityIndicator color={Brand.blue} /><Text style={styles.stateText}>Loading requests…</Text></View>
        ) : current?.error ? (
          <Text accessibilityRole="alert" style={styles.error}>{current.error}</Text>
        ) : current?.items.length === 0 ? (
          <Text style={styles.empty}>No password reset requests are currently available.</Text>
        ) : (
          <View style={styles.list}>
            {current?.items.map((request) => (
              <View key={request.id} style={styles.card}>
                <View style={styles.cardHeading}>
                  <View style={styles.studentCopy}>
                    <Text style={styles.studentName}>{request.studentName}</Text>
                    <Text style={styles.studentEmail}>{request.studentEmail}</Text>
                  </View>
                  <View style={[styles.badge, request.status === 'pending' ? styles.pendingBadge : styles.closedBadge]}>
                    <Text style={request.status === 'pending' ? styles.pendingText : styles.closedText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>Requested: {readableDate(request.requestedAt)}</Text>
                {request.resolutionAt && <Text style={styles.meta}>Updated: {readableDate(request.resolutionAt)}</Text>}
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/student-management', params: { studentId: request.studentId } })}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>View Student</Text>
                  </Pressable>
                  {request.status === 'pending' && (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: actionId !== null }}
                        disabled={actionId !== null}
                        onPress={() => beginApproval(request)}
                        style={[styles.primaryButton, actionId !== null && styles.disabled]}
                      >
                        <Text style={styles.primaryButtonText}>Approve &amp; Reset</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={actionId !== null}
                        onPress={() => { void dismissRequest(request); }}
                        style={[styles.dismissButton, actionId !== null && styles.disabled]}
                      >
                        <Text style={styles.dismissText}>Dismiss</Text>
                      </Pressable>
                    </>
                  )}
                </View>

                {approvalTarget?.id === request.id && request.status === 'pending' && (
                  <View style={styles.confirmation}>
                    <Text style={styles.confirmationText}>
                      Reset {request.studentName}&apos;s password only after verifying the Student through the approved identity-assistance procedure. This will revoke existing sessions.
                    </Text>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: identityVerified }}
                      onPress={() => setIdentityVerified((value) => !value)}
                      style={styles.checkboxRow}
                    >
                      <View style={[styles.checkbox, identityVerified && styles.checkboxChecked]}>
                        <Text style={styles.checkboxMark}>{identityVerified ? '✓' : ''}</Text>
                      </View>
                      <Text style={styles.checkboxLabel}>I confirm that the Student&apos;s identity was verified through an approved procedure.</Text>
                    </Pressable>
                    <View style={styles.confirmationActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ busy: actionId === request.id, disabled: !identityVerified || actionId !== null }}
                        disabled={!identityVerified || actionId !== null}
                        onPress={() => { void approveReset(request); }}
                        style={[styles.primaryButton, (!identityVerified || actionId !== null) && styles.disabled]}
                      >
                        <Text style={styles.primaryButtonText}>{actionId === request.id ? 'Resetting…' : 'Confirm Approve & Reset'}</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        disabled={actionId !== null}
                        onPress={() => { setApprovalTarget(null); setIdentityVerified(false); }}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { backgroundColor: Brand.navy, paddingHorizontal: 28, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  brand: { color: Brand.surface, fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  headerButton: { borderWidth: 1, borderColor: Brand.onNavy, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
  headerButtonText: { color: Brand.surface, fontWeight: '700' },
  content: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 24, paddingBottom: 64 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginTop: 12, marginBottom: 10 },
  title: { color: Brand.navy, fontSize: 32, fontWeight: '800' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 18 },
  warning: { backgroundColor: Brand.goldPale, borderColor: Brand.gold, borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 18 },
  warningText: { color: Brand.ink, fontSize: 13, lineHeight: 21 },
  summaryRow: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 12, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 16 },
  summaryLabel: { color: Brand.muted, fontSize: 13, fontWeight: '700' },
  summaryValue: { color: Brand.navy, fontSize: 28, fontWeight: '800', marginTop: 4 },
  state: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 22 },
  stateText: { color: Brand.muted },
  empty: { color: Brand.muted, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 12, padding: 22 },
  list: { gap: 12 },
  card: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 12, padding: 18 },
  cardHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  studentCopy: { flex: 1, minWidth: 0 },
  studentName: { color: Brand.ink, fontSize: 16, fontWeight: '800' },
  studentEmail: { color: Brand.muted, fontSize: 13, marginTop: 4 },
  meta: { color: Brand.muted, fontSize: 12, marginTop: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pendingBadge: { backgroundColor: Brand.goldPale },
  closedBadge: { backgroundColor: Brand.pale },
  pendingText: { color: Brand.warning, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  closedText: { color: Brand.muted, fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  primaryButton: { minHeight: 44, backgroundColor: Brand.navy, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: Brand.surface, fontSize: 13, fontWeight: '800' },
  secondaryButton: { minHeight: 44, borderWidth: 1, borderColor: Brand.blue, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: Brand.blue, fontSize: 13, fontWeight: '800' },
  dismissButton: { minHeight: 44, paddingHorizontal: 10, justifyContent: 'center' },
  dismissText: { color: Brand.error, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
  disabled: { opacity: 0.55 },
  success: { color: Brand.success, backgroundColor: '#EDF8F3', borderWidth: 1, borderColor: '#B8DECD', borderRadius: 8, padding: 12, lineHeight: 20, marginBottom: 12 },
  error: { color: Brand.error, backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: '#F0C5CA', borderRadius: 8, padding: 12, lineHeight: 20, marginBottom: 12 },
  confirmation: { borderTopWidth: 1, borderTopColor: Brand.line, backgroundColor: Brand.goldPale, padding: 14, marginTop: 16, borderRadius: 8 },
  confirmationText: { color: Brand.ink, fontSize: 13, lineHeight: 20 },
  confirmationActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 14, minHeight: 44 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: Brand.blue, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: Brand.blue },
  checkboxMark: { color: Brand.surface, fontSize: 16, fontWeight: '900' },
  checkboxLabel: { flex: 1, color: Brand.ink, fontSize: 13, lineHeight: 20 },
  passwordCard: { backgroundColor: '#EDF8F3', borderWidth: 1, borderColor: '#B8DECD', borderRadius: 12, padding: 18, marginBottom: 16 },
  passwordTitle: { color: Brand.navy, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  credentialLine: { color: Brand.ink, fontSize: 14, lineHeight: 22 },
  credentialLabel: { color: Brand.navy, fontWeight: '800' },
  passwordValue: { color: Brand.ink, fontFamily: 'monospace', fontSize: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 8, padding: 12, marginTop: 6 },
  passwordNotice: { color: Brand.warning, fontSize: 13, lineHeight: 20, marginTop: 12 },
  passwordActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  copyStatus: { color: Brand.success, fontSize: 13, fontWeight: '700', marginTop: 10 },
});
