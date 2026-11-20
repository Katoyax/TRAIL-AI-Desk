import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Brand } from '../constants/brand';
import { useSession } from '../services/auth';
import {
  createKnowledgeManagerSource,
  getKnowledgeManagerSource,
  listKnowledgeManagerSources,
  listKnowledgeManagerSourceVersions,
  submitKnowledgeManagerSource,
  updateKnowledgeManagerSource,
  type ManagerKnowledgeSource,
  type ManagerSourceInput,
  type ManagerSourceVersion,
} from '../services/knowledge';

const emptyForm: ManagerSourceInput = {
  sourceType: 'office_verified_information',
  title: '',
  documentNumber: '',
  issuingOffice: '',
  category: 'University information',
  supportingReferenceUrl: '',
  content: '',
};

// Manages non-public institutional source drafts and submission for independent review.
export default function KnowledgeSourceManagementScreen() {
  const session = useSession();
  const mounted = useRef(true);
  const [items, setItems] = useState<ManagerKnowledgeSource[]>([]);
  const [selected, setSelected] = useState<ManagerKnowledgeSource | null>(null);
  const [versions, setVersions] = useState<ManagerSourceVersion[]>([]);
  const [form, setForm] = useState<ManagerSourceInput>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => () => { mounted.current = false; }, []);

  const loadSources = useCallback(async (signal?: AbortSignal) => {
    try {
      const result = await listKnowledgeManagerSources(signal);
      if (mounted.current && !signal?.aborted) setItems(result);
    } catch (cause) {
      if (mounted.current && !signal?.aborted) {
        setError(cause instanceof Error ? cause.message : 'Unable to load knowledge sources.');
      }
    } finally {
      if (mounted.current && !signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => void loadSources(controller.signal), 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [loadSources, session?.token]);

  if (!session || session.demo || session.user.role !== 'knowledge_manager' || session.user.mustChangePassword) return null;

  const patchForm = (field: keyof ManagerSourceInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const beginCreate = () => {
    setSelected(null);
    setVersions([]);
    setForm(emptyForm);
    setError('');
    setMessage('');
  };

  const openSource = async (id: string) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const [source, history] = await Promise.all([
        getKnowledgeManagerSource(id),
        listKnowledgeManagerSourceVersions(id),
      ]);
      if (!mounted.current) return;
      setSelected(source);
      setVersions(history);
      setForm({
        sourceType: 'office_verified_information',
        title: source.title,
        documentNumber: source.documentNumber,
        issuingOffice: source.issuingOffice,
        category: source.category || 'University information',
        supportingReferenceUrl: source.supportingReferenceUrl,
        content: source.content || '',
      });
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Unable to open the source.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuingOffice.trim() || !form.supportingReferenceUrl.trim() || form.content.trim().length < 20) {
      setError('Title, issuing office, official supporting reference, and at least 20 characters of content are required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const source = selected
        ? await updateKnowledgeManagerSource(selected.id, form, selected.revision)
        : await createKnowledgeManagerSource(form);
      if (!mounted.current) return;
      setSelected(source);
      setVersions(await listKnowledgeManagerSourceVersions(source.id));
      setMessage(selected ? 'A new draft version was saved.' : 'The source was saved as a private draft.');
      await loadSources();
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Unable to save the source.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const submitSelected = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const source = await submitKnowledgeManagerSource(selected.id, selected.revision);
      if (!mounted.current) return;
      setSelected(source);
      setVersions(await listKnowledgeManagerSourceVersions(source.id));
      setMessage('Submitted for independent review. The source is not approved or published.');
      await loadSources();
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'Unable to submit the source.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  const confirmSubmit = () => {
    Alert.alert(
      'Submit for independent review?',
      'Submission locks this draft. It does not approve, publish, or index the content for Student retrieval.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit', onPress: () => void submitSelected() }],
    );
  };

  const editable = !selected || (
    selected.createdBy === session.user.id && selected.draftStatus !== 'pending_review'
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TRAIL AI Desk</Text>
          <Text style={styles.headerSubtitle}>Knowledge Source Management</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/kb-manager-dashboard')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back to dashboard</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>GOVERNED SOURCE PREPARATION</Text>
        <Text accessibilityRole="header" style={styles.title}>Knowledge Source Management</Text>
        <Text style={styles.subtitle}>
          Prepare office-verified information as a private draft. Submission starts independent review; it never approves or publishes content.
        </Text>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}

        <View style={styles.columns}>
          <View style={styles.listPanel}>
            <View style={styles.panelHeading}>
              <Text style={styles.panelTitle}>Sources</Text>
              <Pressable accessibilityRole="button" onPress={beginCreate} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>New draft</Text>
              </Pressable>
            </View>
            {loading ? <ActivityIndicator color={Brand.blue} /> : items.length === 0 ? (
              <Text style={styles.empty}>No knowledge sources are stored yet.</Text>
            ) : items.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => void openSource(item.id)}
                style={[styles.sourceCard, selected?.id === item.id && styles.sourceCardSelected]}
              >
                <Text style={styles.sourceTitle}>{item.title || 'Untitled source'}</Text>
                <Text style={styles.sourceMeta}>{item.issuingOffice || 'Issuing office not recorded'}</Text>
                <Text style={styles.status}>{item.draftStatus || item.verificationStatus}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.formPanel}>
            <Text style={styles.panelTitle}>{selected ? 'Source details' : 'Create source draft'}</Text>
            {selected?.draftStatus === 'pending_review' ? (
              <Text style={styles.notice}>This version is pending independent review and cannot be edited.</Text>
            ) : selected && selected.createdBy !== session.user.id ? (
              <Text style={styles.notice}>This source is visible for coordination, but only its creator may prepare a new draft version.</Text>
            ) : null}
            <Text style={styles.label}>Source format</Text>
            <Text style={styles.readOnly}>Office-verified information</Text>
            <Text style={styles.label}>Document title</Text>
            <TextInput accessibilityLabel="Document title" editable={editable} onChangeText={(value) => patchForm('title', value)} style={styles.input} value={form.title} />
            <Text style={styles.label}>Issuing office</Text>
            <TextInput accessibilityLabel="Issuing office" editable={editable} onChangeText={(value) => patchForm('issuingOffice', value)} style={styles.input} value={form.issuingOffice} />
            <Text style={styles.label}>Official supporting reference URL</Text>
            <TextInput accessibilityLabel="Official supporting reference URL" autoCapitalize="none" editable={editable} keyboardType="url" onChangeText={(value) => patchForm('supportingReferenceUrl', value)} style={styles.input} value={form.supportingReferenceUrl} />
            <Text style={styles.helper}>Use an approved official USTP reference. The URL is validated but not fetched by this draft workflow.</Text>
            <Text style={styles.label}>Document number (optional)</Text>
            <TextInput accessibilityLabel="Document number" editable={editable} onChangeText={(value) => patchForm('documentNumber', value)} style={styles.input} value={form.documentNumber} />
            <Text style={styles.label}>Category</Text>
            <TextInput accessibilityLabel="Category" editable={editable} onChangeText={(value) => patchForm('category', value)} style={styles.input} value={form.category} />
            <Text style={styles.label}>Institutional content</Text>
            <TextInput accessibilityLabel="Institutional content" editable={editable} multiline onChangeText={(value) => patchForm('content', value)} style={[styles.input, styles.textArea]} textAlignVertical="top" value={form.content} />

            <View style={styles.actions}>
              <Pressable accessibilityRole="button" disabled={!editable || saving} onPress={() => void handleSave()} style={[styles.primaryButton, (!editable || saving) && styles.disabled]}>
                <Text style={styles.primaryButtonText}>{saving ? 'Working…' : selected ? 'Save new version' : 'Save draft'}</Text>
              </Pressable>
              {selected && selected.draftStatus === 'draft' ? (
                <Pressable accessibilityRole="button" disabled={saving} onPress={confirmSubmit} style={[styles.submitButton, saving && styles.disabled]}>
                  <Text style={styles.submitButtonText}>Submit for review</Text>
                </Pressable>
              ) : null}
            </View>

            {selected ? (
              <View style={styles.history}>
                <Text style={styles.historyTitle}>Version history</Text>
                {versions.map((version) => (
                  <View key={version.id} style={styles.versionRow}>
                    <Text style={styles.versionText}>Version {version.version}</Text>
                    <Text style={styles.versionStatus}>{version.verificationStatus}{version.isDraft ? ' · current draft' : ''}{version.isActive ? ' · published version' : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { minHeight: 76, paddingHorizontal: 28, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, backgroundColor: Brand.navy },
  brand: { color: Brand.surface, fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  headerButton: { borderWidth: 1, borderColor: Brand.onNavy, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  headerButtonText: { color: Brand.surface, fontWeight: '700' },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24, paddingBottom: 64 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginTop: 12, marginBottom: 10 },
  title: { color: Brand.navy, fontSize: 32, fontWeight: '800' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 22, maxWidth: 820 },
  error: { color: Brand.error, backgroundColor: '#FFF0F1', borderRadius: 10, padding: 14, marginBottom: 16 },
  success: { color: '#176239', backgroundColor: '#EAF8EF', borderRadius: 10, padding: 14, marginBottom: 16 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' },
  listPanel: { flexGrow: 1, flexBasis: 300, minWidth: 280, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 18 },
  formPanel: { flexGrow: 2, flexBasis: 560, minWidth: 280, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 22 },
  panelHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 },
  panelTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginBottom: 12 },
  sourceCard: { borderWidth: 1, borderColor: Brand.line, borderRadius: 10, padding: 14, marginBottom: 10 },
  sourceCardSelected: { borderColor: Brand.blue, backgroundColor: '#F1F6FF' },
  sourceTitle: { color: Brand.navy, fontWeight: '800', fontSize: 15 },
  sourceMeta: { color: Brand.muted, fontSize: 13, marginTop: 5 },
  status: { color: Brand.blue, fontSize: 12, fontWeight: '700', marginTop: 8, textTransform: 'uppercase' },
  empty: { color: Brand.muted, lineHeight: 22 },
  notice: { color: Brand.warning, backgroundColor: '#FFF8E5', padding: 12, borderRadius: 8, marginBottom: 14 },
  label: { color: Brand.navy, fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { minHeight: 46, borderWidth: 1, borderColor: Brand.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: Brand.ink, backgroundColor: '#FFFFFF' },
  readOnly: { minHeight: 46, borderWidth: 1, borderColor: Brand.line, borderRadius: 8, padding: 12, color: Brand.muted, backgroundColor: Brand.canvas },
  textArea: { minHeight: 180 },
  helper: { color: Brand.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  primaryButton: { backgroundColor: Brand.navy, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 13 },
  primaryButtonText: { color: Brand.surface, fontWeight: '800' },
  submitButton: { backgroundColor: Brand.blue, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 13 },
  submitButtonText: { color: Brand.surface, fontWeight: '800' },
  secondaryButton: { borderWidth: 1, borderColor: Brand.blue, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9 },
  secondaryButtonText: { color: Brand.blue, fontWeight: '700' },
  disabled: { opacity: 0.5 },
  history: { borderTopWidth: 1, borderTopColor: Brand.line, marginTop: 24, paddingTop: 18 },
  historyTitle: { color: Brand.navy, fontWeight: '800', fontSize: 16, marginBottom: 10 },
  versionRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Brand.line },
  versionText: { color: Brand.ink, fontWeight: '700' },
  versionStatus: { color: Brand.muted, fontSize: 13 },
});
