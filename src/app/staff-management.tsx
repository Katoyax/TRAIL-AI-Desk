import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Brand } from '../constants/brand';
import { ApiError } from '../services/api';
import { useSession, validEmail } from '../services/auth';
import {
  createKnowledgeManager,
  listKnowledgeManagers,
  type KnowledgeManagerAccount,
  updateKnowledgeManagerStatus,
} from '../services/staff';

type ManagerListState = {
  token: string;
  items: KnowledgeManagerAccount[];
  error: string;
  loading: boolean;
};

// Provides Admin-only provisioning and lifecycle management for Knowledge-Base Managers.
export default function StaffManagementScreen() {
  const session = useSession();
  const { width } = useWindowDimensions();
  const token = session?.token;
  const emailInput = useRef<TextInput>(null);
  const generation = useRef(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [listState, setListState] = useState<ManagerListState | null>(null);
  const [credential, setCredential] = useState<{ owner: string; name: string; email: string; password: string } | null>(null);
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [lifecycleTarget, setLifecycleTarget] = useState<KnowledgeManagerAccount | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [lifecycleMessage, setLifecycleMessage] = useState('');

  useEffect(() => {
    const clear = setTimeout(() => {
      setCredential(null);
      setPasswordRevealed(false);
      setCopyStatus('');
      setLifecycleTarget(null);
      setLifecycleMessage('');
    }, 0);
    return () => {
      clearTimeout(clear);
      generation.current += 1;
    };
  }, [token]);

  useEffect(() => {
    if (!token || session?.demo || session?.user.role !== 'admin') return;
    const currentToken = token;
    const controller = new AbortController();
    void listKnowledgeManagers(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setListState({ token: currentToken, items, error: '', loading: false });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setListState({ token: currentToken, items: [], error: cause instanceof Error ? cause.message : 'Unable to load manager accounts.', loading: false });
        }
      });
    return () => controller.abort();
  }, [token, session?.demo, session?.user.role, reload]);

  const clearCredential = () => {
    setCredential(null);
    setPasswordRevealed(false);
    setCopyStatus('');
  };

  const handleCreate = async () => {
    if (!token || creating) return;
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedName || normalizedName.length > 100) {
      setFormError('Enter a full name between 1 and 100 characters.');
      return;
    }
    if (!validEmail(normalizedEmail)) {
      setFormError('Enter a valid institutional email address.');
      emailInput.current?.focus();
      return;
    }
    const requestGeneration = ++generation.current;
    setCreating(true);
    setFormError('');
    setNotice('');
    clearCredential();
    try {
      const result = await createKnowledgeManager(normalizedName, normalizedEmail);
      if (generation.current !== requestGeneration) return;
      setCredential({ owner: token, name: result.user.name, email: result.user.email, password: result.initialPassword });
      setNotice('Knowledge-Base Manager account created. Deliver the initial password through an approved private channel.');
      setName('');
      setEmail('');
      setListState((current) => current?.token === token ? {
        ...current,
        items: [result.user, ...current.items.filter((item) => item.id !== result.user.id && item.email !== result.user.email)],
      } : current);
    } catch (cause) {
      if (generation.current !== requestGeneration) return;
      setFormError(cause instanceof ApiError && cause.status < 500
        ? cause.message
        : 'Account creation could not be confirmed. Refresh the manager list before trying again.');
    } finally {
      if (generation.current === requestGeneration) setCreating(false);
    }
  };

  // Copies only the one-time in-memory credential returned by successful provisioning.
  const handleCopyPassword = async () => {
    const active = credential?.owner === token ? credential : null;
    if (!active) return;
    try {
      const copied = await Clipboard.setStringAsync(active.password);
      setCopyStatus(copied ? 'Temporary password copied.' : 'The password could not be copied on this device.');
    } catch {
      setCopyStatus('The password could not be copied on this device.');
    }
  };

  const handleStatusChange = async (manager: KnowledgeManagerAccount, active: boolean) => {
    if (!token || statusUpdatingId) return;
    setStatusUpdatingId(manager.id);
    setLifecycleMessage('');
    try {
      const result = await updateKnowledgeManagerStatus(manager.id, active);
      setListState((current) => current?.token === token ? {
        ...current,
        items: current.items.map((item) => item.id === result.user.id ? result.user : item),
      } : current);
      setLifecycleMessage(active
        ? `${result.user.name} has been reactivated and must sign in again.`
        : `${result.user.name} has been deactivated. Existing sessions are no longer valid.`);
      setLifecycleTarget(null);
    } catch (cause) {
      setLifecycleMessage(cause instanceof Error ? cause.message : 'Unable to update the manager account.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (!session || session.demo || session.user.role !== 'admin') return null;

  const currentList = listState?.token === token ? listState : null;
  const activeCredential = credential?.owner === token ? credential : null;
  const twoColumns = width >= 900;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TRAIL AI Desk</Text>
          <Text style={styles.headerSubtitle}>Administrator Workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => { clearCredential(); router.replace('/admin-dashboard'); }} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to dashboard</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>STAFF MANAGEMENT</Text>
        <Text accessibilityRole="header" style={styles.title}>Knowledge-Base Manager Accounts</Text>
        <Text style={styles.subtitle}>Provision the independent knowledge-governance role. This workflow cannot create Admin accounts.</Text>

        <View style={[styles.sections, twoColumns && styles.sectionsWide]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Knowledge-Base Manager</Text>
            <Text style={styles.cardDescription}>The backend fixes the role and generates a secure temporary password.</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput accessibilityLabel="Knowledge-Base Manager full name" value={name} onChangeText={(value) => { setName(value); setFormError(''); }} editable={!creating} maxLength={100} autoCapitalize="words" autoComplete="name" returnKeyType="next" onSubmitEditing={() => emailInput.current?.focus()} style={styles.input} />
            <Text style={styles.label}>Registered Email</Text>
            <TextInput ref={emailInput} accessibilityLabel="Knowledge-Base Manager registered email" value={email} onChangeText={(value) => { setEmail(value); setFormError(''); }} editable={!creating} maxLength={254} autoCapitalize="none" autoCorrect={false} autoComplete="email" keyboardType="email-address" returnKeyType="go" onSubmitEditing={() => { void handleCreate(); }} style={styles.input} />
            {formError !== '' && <Text accessibilityRole="alert" style={styles.error}>{formError}</Text>}
            {notice !== '' && <Text accessibilityLiveRegion="polite" style={styles.success}>{notice}</Text>}
            <Pressable accessibilityRole="button" accessibilityState={{ busy: creating, disabled: creating }} disabled={creating} onPress={() => { void handleCreate(); }} style={[styles.primaryButton, creating && styles.disabledButton]}>
              {creating && <ActivityIndicator color={Brand.surface} />}
              <Text style={styles.primaryButtonText}>{creating ? 'Creating account…' : 'Create Manager Account'}</Text>
            </Pressable>

            {activeCredential && (
              <View style={styles.passwordCard} accessibilityLiveRegion="polite">
                <Text style={styles.passwordTitle}>Manager credentials — shown once</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Full Name: </Text>{activeCredential.name}</Text>
                <Text style={styles.detail}><Text style={styles.detailLabel}>Registered Email: </Text>{activeCredential.email}</Text>
                <Text style={styles.detailLabel}>Temporary Password</Text>
                <Text selectable={passwordRevealed} style={styles.passwordValue}>{passwordRevealed ? activeCredential.password : '•••••••••••••••••••••••••••••••••••••••••••'}</Text>
                <Text style={styles.passwordNotice}>Deliver privately. The manager must replace this password before dashboard access.</Text>
                {copyStatus !== '' && <Text accessibilityLiveRegion="polite" style={styles.copyStatus}>{copyStatus}</Text>}
                <View style={styles.actions}>
                  <Pressable accessibilityRole="button" onPress={() => setPasswordRevealed((value) => !value)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{passwordRevealed ? 'Hide password' : 'Reveal password'}</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={() => { void handleCopyPassword(); }} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Copy password</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={clearCredential} style={styles.textButton}><Text style={styles.textButtonText}>Dismiss and clear</Text></Pressable>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.headingRow}>
              <Text style={styles.cardTitle}>Existing Managers</Text>
              <Pressable accessibilityRole="button" onPress={() => setReload((value) => value + 1)}><Text style={styles.link}>Refresh</Text></Pressable>
            </View>
            {lifecycleMessage !== '' && <Text accessibilityLiveRegion="polite" style={styles.statusMessage}>{lifecycleMessage}</Text>}
            {!currentList || currentList.loading ? <ActivityIndicator color={Brand.blue} /> : currentList.error !== '' ? (
              <Text accessibilityRole="alert" style={styles.error}>{currentList.error}</Text>
            ) : currentList.items.length === 0 ? <Text style={styles.empty}>No Knowledge-Base Manager accounts found.</Text> : currentList.items.map((manager) => (
              <View key={manager.id} style={styles.accountRow}>
                <Text style={styles.accountName}>{manager.name}</Text>
                <Text style={styles.accountEmail}>{manager.email}</Text>
                <Text style={[styles.badge, manager.active ? styles.activeBadge : styles.inactiveBadge]}>{manager.active ? 'Active' : 'Inactive'}</Text>
                <Pressable accessibilityRole="button" disabled={statusUpdatingId === manager.id} onPress={() => setLifecycleTarget(manager)} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{statusUpdatingId === manager.id ? 'Updating…' : manager.active ? 'Deactivate' : 'Reactivate'}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {lifecycleTarget && (
          <View style={styles.confirmCard} accessibilityRole="alert">
            <Text style={styles.cardTitle}>{lifecycleTarget.active ? 'Deactivate' : 'Reactivate'} {lifecycleTarget.name}?</Text>
            <Text style={styles.cardDescription}>{lifecycleTarget.active ? 'Existing sessions will become invalid immediately.' : 'Old sessions remain invalid; the manager must sign in again.'}</Text>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => { void handleStatusChange(lifecycleTarget, !lifecycleTarget.active); }} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Confirm</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setLifecycleTarget(null)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { minHeight: 76, paddingHorizontal: 28, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, backgroundColor: Brand.navy },
  brand: { color: Brand.surface, fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  backButton: { borderWidth: 1, borderColor: Brand.onNavy, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  backButtonText: { color: Brand.surface, fontWeight: '700' },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: 24, paddingBottom: 64 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginTop: 12, marginBottom: 10 },
  title: { color: Brand.navy, fontSize: 32, fontWeight: '800' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 22 },
  sections: { gap: 18 },
  sectionsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  card: { flex: 1, minWidth: 0, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 22 },
  cardTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginBottom: 10 },
  cardDescription: { color: Brand.muted, fontSize: 14, lineHeight: 22, marginBottom: 14 },
  label: { color: Brand.ink, fontSize: 14, fontWeight: '700', marginTop: 10, marginBottom: 7 },
  input: { minHeight: 52, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 14, color: Brand.ink, fontSize: 15 },
  primaryButton: { minHeight: 46, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', backgroundColor: Brand.navy, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 11, marginTop: 14 },
  primaryButtonText: { color: Brand.surface, fontWeight: '700' },
  disabledButton: { opacity: 0.6 },
  secondaryButton: { minHeight: 42, justifyContent: 'center', backgroundColor: Brand.pale, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  secondaryButtonText: { color: Brand.navy, fontWeight: '700' },
  textButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 8 },
  textButtonText: { color: Brand.blue, fontWeight: '700', textDecorationLine: 'underline' },
  error: { color: Brand.error, backgroundColor: '#FFF0F1', borderRadius: 8, padding: 12, marginTop: 12 },
  success: { color: Brand.success, backgroundColor: '#E6F6EE', borderRadius: 8, padding: 12, marginTop: 12 },
  passwordCard: { backgroundColor: Brand.goldPale, borderRadius: 10, padding: 16, marginTop: 18 },
  passwordTitle: { color: Brand.navy, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  detail: { color: Brand.ink, fontSize: 14, lineHeight: 22 },
  detailLabel: { color: Brand.ink, fontWeight: '800' },
  passwordValue: { color: Brand.navy, fontFamily: 'monospace', fontSize: 15, marginTop: 8 },
  passwordNotice: { color: Brand.warning, fontSize: 13, lineHeight: 20, marginTop: 10 },
  copyStatus: { color: Brand.success, fontSize: 13, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  link: { color: Brand.blue, fontWeight: '800', padding: 10 },
  statusMessage: { color: Brand.blue, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  empty: { color: Brand.muted, fontSize: 14 },
  accountRow: { borderTopWidth: 1, borderTopColor: Brand.line, paddingVertical: 14, gap: 7 },
  accountName: { color: Brand.navy, fontSize: 15, fontWeight: '800' },
  accountEmail: { color: Brand.muted, fontSize: 13 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: '800' },
  activeBadge: { color: Brand.success, backgroundColor: '#E6F6EE' },
  inactiveBadge: { color: Brand.error, backgroundColor: '#FFF0F1' },
  confirmCard: { backgroundColor: Brand.surface, borderWidth: 2, borderColor: Brand.warning, borderRadius: 14, padding: 20, marginTop: 18 },
});
