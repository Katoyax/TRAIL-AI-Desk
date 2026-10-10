import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SourceCard, formatSourceDate } from '../components/source-card';
import { FormButton } from '../components/desk-form';
import { useSession, validateAdminSession } from '../services/auth';
import { addSource, editSource, listAdminSources, sourceAction, sourceVersions, type KnowledgeSource, type SourceInput, type SourceType, type SourceVersion } from '../services/knowledge';

const sourceTypes: { value: SourceType; label: string }[] = [
  { value: 'official_webpage', label: 'Official webpage' }, { value: 'official_pdf', label: 'Official PDF URL' },
  { value: 'uploaded_document', label: 'Upload memo / document' }, { value: 'office_verified_information', label: 'Office-provided information' },
];
const emptyForm = { title: '', documentTitle: '', documentNumber: '', issuingOffice: '', dateIssued: '', datePublished: '', effectiveFrom: '', effectiveTo: '', category: '', sourceUrl: '', content: '' };
type SourceForm = typeof emptyForm;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function AdminScreen() {
  const session = useSession();
  const [authorized, setAuthorized] = useState(false);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState<KnowledgeSource | null>(null);
  const [form, setForm] = useState<SourceForm>(emptyForm);
  const [sourceType, setSourceType] = useState<SourceType>('official_webpage');
  const [upload, setUpload] = useState<SourceInput['upload']>();
  const [versions, setVersions] = useState<SourceVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyAcknowledged, setVerifyAcknowledged] = useState(false);
  const webSource = sourceType === 'official_webpage' || sourceType === 'official_pdf';

  useEffect(() => {
    let active = true;
    validateAdminSession().then(() => { if (active) setAuthorized(true); })
      .catch((cause) => { if (active) { setError(cause instanceof Error ? cause.message : 'Administrator access is unavailable.'); setLoading(false); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    listAdminSources(search).then((items) => { if (active) setSources(items); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load sources.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, search, reload]);

  const reloadSources = () => { setLoading(true); setError(''); setReload((value) => value + 1); };
  const performSearch = () => { const query = searchInput.trim(); setLoading(true); setError(''); if (query === search) setReload((value) => value + 1); else setSearch(query); };

  const resetForm = () => {
    setSelected(null); setForm({ ...emptyForm }); setSourceType('official_webpage'); setUpload(undefined);
    setVersions([]); setShowVersions(false); setVerifying(false); setVerifyAcknowledged(false); setNotice(''); setError('');
  };
  const selectSource = (source: KnowledgeSource) => {
    setSelected(source); setSourceType(source.sourceType || 'office_verified_information');
    setForm({ title: source.title || '', documentTitle: source.documentTitle || '', documentNumber: source.documentNumber || '', issuingOffice: source.issuingOffice || source.office || '', dateIssued: source.dateIssued?.slice(0, 10) || '', datePublished: source.datePublished?.slice(0, 10) || '', effectiveFrom: source.effectiveFrom?.slice(0, 10) || '', effectiveTo: source.effectiveTo?.slice(0, 10) || '', category: source.category || '', sourceUrl: source.sourceUrl || '', content: '' });
    setUpload(undefined); setVersions([]); setShowVersions(false); setVerifying(false); setVerifyAcknowledged(false); setError(''); setNotice('');
  };
  const update = (key: keyof SourceForm, value: string) => { setForm((current) => ({ ...current, [key]: value })); setError(''); };

  const chooseDocument = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'text/plain'], multiple: false, copyToCacheDirectory: true, base64: true });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (!/\.(pdf|txt)$/i.test(asset.name)) throw new Error('Choose a PDF or plain text (.txt) document.');
      const nativeFile = Platform.OS === 'web' ? undefined : new File(asset.uri);
      const size = asset.size ?? nativeFile?.size;
      if (size === undefined || size > MAX_UPLOAD_BYTES || size <= 0) throw new Error('Choose a non-empty document up to 5 MiB.');
      const data = Platform.OS === 'web' ? asset.base64?.replace(/^data:[^,]*,/, '') : await nativeFile!.base64();
      if (!data) throw new Error('Could not read the document. Please choose it again.');
      setUpload({ filename: asset.name, mimeType: /\.pdf$/i.test(asset.name) ? 'application/pdf' : 'text/plain', data });
      if (!form.title.trim()) update('title', asset.name.replace(/\.[^.]+$/, ''));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not select a document.'); }
    finally { setBusy(false); }
  };

  const metadata = () => ({ title: form.title.trim(), documentTitle: form.documentTitle.trim(), documentNumber: form.documentNumber.trim(), issuingOffice: form.issuingOffice.trim(), dateIssued: form.dateIssued.trim(), datePublished: form.datePublished.trim(), effectiveFrom: form.effectiveFrom.trim(), effectiveTo: form.effectiveTo.trim(), category: form.category.trim() });
  const save = async () => {
    if (busy) return;
    if (!form.title.trim()) { setError('Enter a source title.'); return; }
    for (const value of [form.dateIssued, form.datePublished, form.effectiveFrom, form.effectiveTo]) {
      if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) { setError('Use a valid date in YYYY-MM-DD format.'); return; }
    }
    if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom) { setError('The event end date must be on or after its start date.'); return; }
    if (!selected && webSource) {
      try { const url = new URL(form.sourceUrl.trim()); if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error(); }
      catch { setError('Enter an official university HTTPS URL. The server accepts only approved university domains.'); return; }
    }
    if (!selected && sourceType === 'uploaded_document' && !upload) { setError('Choose the official PDF or text document to upload.'); return; }
    if (!selected && sourceType === 'office_verified_information' && (!form.content.trim() || !form.issuingOffice.trim())) { setError('Enter the office-provided information and issuing office.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = selected ? await editSource(selected.id, metadata()) : await addSource({ ...metadata(), sourceType, ...(webSource ? { sourceUrl: form.sourceUrl.trim() } : {}), ...(sourceType === 'office_verified_information' ? { content: form.content.trim() } : {}), ...(sourceType === 'uploaded_document' ? { upload } : {}) });
      selectSource(result.source);
      setNotice('Saved as pending verification. Review the source, then use Verify source to approve it for students.');
      reloadSources();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save the source.'); }
    finally { setBusy(false); }
  };

  const act = async (action: 'verify' | 'unverify' | 'archive' | 'refresh') => {
    if (!selected || busy) return;
    const savedValues: Record<string, string> = { title: selected.title || '', documentTitle: selected.documentTitle || '', documentNumber: selected.documentNumber || '', issuingOffice: selected.issuingOffice || selected.office || '', dateIssued: selected.dateIssued?.slice(0, 10) || '', datePublished: selected.datePublished?.slice(0, 10) || '', effectiveFrom: selected.effectiveFrom?.slice(0, 10) || '', effectiveTo: selected.effectiveTo?.slice(0, 10) || '', category: selected.category || '' };
    if (Object.entries(metadata()).some(([key, value]) => value !== savedValues[key])) { setError('Save your metadata changes before using source actions. Review the saved source before verifying it.'); return; }
    if (action === 'verify' && !verifyAcknowledged) { setVerifying(true); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await sourceAction(selected.id, action, action === 'verify' ? selected.version : undefined, action === 'verify' ? selected.revision : undefined);
      if (result.source) selectSource(result.source);
      reloadSources();
      if (action === 'refresh' && result.status === 'failed') setError(`The latest source check failed. Previous information was retained. ${result.error || ''}`);
      else setNotice(result.message || (action === 'refresh' ? result.status === 'unchanged' ? 'Source checked. Content is unchanged; existing indexing was reused.' : 'Source checked. Updated content was indexed as a new version. Review the source details.' : { verify: 'Source verified.', unverify: 'Verification removed. This source is excluded from student retrieval.', archive: 'Source archived. This source is excluded from student retrieval.' }[action]));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update the source.'); }
    finally { setBusy(false); }
  };
  const loadVersions = async () => {
    if (!selected || busy) return;
    setBusy(true); setError('');
    try { setVersions(await sourceVersions(selected.id)); setShowVersions(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load source versions.'); }
    finally { setBusy(false); }
  };

  const field = (key: keyof SourceForm, label: string, multiline = false, editable = true) => <View key={key}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={form[key]} onChangeText={(value) => update(key, value)} style={[styles.input, multiline && styles.contentInput]} multiline={multiline} editable={editable && !busy} autoCapitalize={key === 'sourceUrl' ? 'none' : 'sentences'} autoCorrect={key !== 'sourceUrl'} maxLength={multiline ? 150000 : key === 'sourceUrl' ? 2000 : 300} placeholder={['dateIssued', 'datePublished', 'effectiveFrom', 'effectiveTo'].includes(key) ? 'YYYY-MM-DD (optional)' : 'Enter value'} /></View>;

  return <View style={styles.screen}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={() => router.replace('/dashboard')} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><View><Text style={styles.headerTitle}>Knowledge management</Text><Text style={styles.headerSubtitle}>Authorized personnel · {session?.user.name}</Text></View></View>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>OFFICIAL INFORMATION</Text><Text style={styles.title}>Manage trusted sources</Text><Text style={styles.description}>Add official material, review its accuracy, and explicitly verify it before students can rely on it.</Text>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice && <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text>}
      {!authorized ? loading ? <ActivityIndicator color="#1E6484" /> : <FormButton label="Return to dashboard" onPress={() => router.replace('/dashboard')} /> : <>
        <View style={styles.card}><View style={styles.headingRow}><Text style={styles.sectionTitle}>Existing sources</Text><Pressable accessibilityRole="button" disabled={busy || loading} onPress={reloadSources}><Text style={styles.link}>Reload</Text></Pressable></View>
          <View style={styles.searchRow}><TextInput accessibilityLabel="Search knowledge sources" value={searchInput} onChangeText={setSearchInput} style={[styles.input, styles.searchInput]} placeholder="Search title, office, or memo number" onSubmitEditing={performSearch} /><Pressable accessibilityRole="button" disabled={loading} onPress={performSearch} style={styles.smallButton}><Text style={styles.smallButtonText}>Search</Text></Pressable></View>
          {loading ? <ActivityIndicator color="#1E6484" style={styles.loader} /> : sources.length ? sources.map((source) => <Pressable accessibilityRole="button" disabled={busy} key={source.id} onPress={() => selectSource(source)} style={[styles.sourceRow, selected?.id === source.id && styles.sourceSelected]}><Text style={styles.sourceTitle}>{source.title}</Text><Text style={styles.meta}>{(source.verificationStatus || 'pending_verification').replace(/_/g, ' ')} · Version {source.version || 1}</Text><Text style={styles.meta}>Last checked: {formatSourceDate(source.lastChecked)}</Text>{!!(source.freshness?.lastCheckError || source.lastCheckError) && <Text style={styles.checkError}>Latest source check failed</Text>}</Pressable>) : <Text style={styles.meta}>No sources match this search. Add official material below.</Text>}
        </View>
        <View style={styles.card}><View style={styles.headingRow}><Text style={styles.sectionTitle}>{selected ? 'Review and edit metadata' : 'Add a source'}</Text>{selected && <Pressable accessibilityRole="button" disabled={busy} onPress={resetForm}><Text style={styles.link}>Add another</Text></Pressable>}</View>
          {!selected && <View style={styles.options}>{sourceTypes.map((type) => <Pressable accessibilityRole="radio" accessibilityState={{ selected: sourceType === type.value }} key={type.value} disabled={busy} onPress={() => { setSourceType(type.value); setUpload(undefined); setError(''); }} style={[styles.option, sourceType === type.value && styles.optionSelected]}><Text style={[styles.optionText, sourceType === type.value && styles.optionTextSelected]}>{type.label}</Text></Pressable>)}</View>}
          {selected && <><SourceCard source={selected} />{!!selected.content && <View style={styles.preview}><Text style={styles.label}>Extracted text preview</Text><Text selectable style={styles.previewText}>{selected.content.slice(0, 12000)}{selected.content.length > 12000 ? '\n… Preview truncated' : ''}</Text></View>}</>}
          {field('title', 'Source title')}{field('documentTitle', 'Document title (optional)')}{field('documentNumber', 'Memorandum / document number (optional)')}{field('issuingOffice', 'Issuing office')}{field('category', 'Category (e.g. Procedures, Offices, Academic calendar)')}{field('dateIssued', 'Date issued (optional)')}{field('datePublished', 'Date published (optional)')}{field('effectiveFrom', 'Event / advisory start date (optional)')}{field('effectiveTo', 'Event / advisory end date (optional)')}
          {webSource && field('sourceUrl', 'Official university URL', false, !selected)}
          {!selected && sourceType === 'uploaded_document' && <><FormButton label={upload ? 'Choose a different document' : 'Choose PDF or text document'} onPress={chooseDocument} disabled={busy} />{!!upload && <Text style={styles.meta}>Selected: {upload.filename}</Text>}<Text style={styles.meta}>Up to 5 MiB. Only official material without personal student information. Scanned PDFs need readable text before ingestion.</Text></>}
          {!selected && sourceType === 'office_verified_information' && field('content', 'Information provided by the issuing office', true)}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <FormButton label={busy ? 'Working…' : selected ? 'Save metadata for review' : 'Save pending source'} onPress={save} loading={busy} />
          {selected && <><Text style={styles.label}>Source actions</Text><View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={busy || selected.verificationStatus === 'verified' || selected.verificationStatus === 'archived'} onPress={() => act('verify')} style={styles.smallButton}><Text style={styles.smallButtonText}>Verify source</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={busy || selected.verificationStatus === 'archived'} onPress={() => act('unverify')} style={styles.secondaryButton}><Text style={styles.secondaryText}>Unverify</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={busy || selected.verificationStatus === 'archived'} onPress={() => act('archive')} style={styles.secondaryButton}><Text style={styles.secondaryText}>Archive</Text></Pressable>
            {webSource && <Pressable accessibilityRole="button" disabled={busy || selected.verificationStatus === 'archived'} onPress={() => act('refresh')} style={styles.secondaryButton}><Text style={styles.secondaryText}>Check source now</Text></Pressable>}
            <Pressable accessibilityRole="button" disabled={busy} onPress={loadVersions} style={styles.secondaryButton}><Text style={styles.secondaryText}>View versions</Text></Pressable>
          </View>
          {verifying && <View style={styles.preview}><Text style={styles.previewText}>Verify only after reviewing the original document or official page and confirming its accuracy, office, and dates. Your administrator account will be recorded as the verifier.</Text><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: verifyAcknowledged }} onPress={() => setVerifyAcknowledged((value) => !value)}><Text style={styles.link}>{verifyAcknowledged ? '☑' : '☐'} I reviewed the source and confirm the information.</Text></Pressable><FormButton label="Confirm verification" onPress={() => act('verify')} disabled={!verifyAcknowledged || busy} /></View>}
          {showVersions && <View style={styles.preview}><Text style={styles.label}>Version history</Text>{versions.length ? versions.map((version) => <View key={version.id}><Text style={styles.sourceTitle}>Version {version.version || 1} · {version.verificationStatus || 'unverified'}{version.isActive ? ' · Active' : ''}</Text><Text style={styles.meta}>Created: {formatSourceDate(version.createdAt)}</Text></View>) : <Text style={styles.meta}>No version history was returned.</Text>}</View>}
          </>}
        </View>
      </>}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' }, header: { minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#123553' },
  back: { width: 38, height: 38, marginRight: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  backText: { color: '#FFF', fontSize: 27 }, headerTitle: { color: '#FFF', fontSize: 15, fontWeight: '800' }, headerSubtitle: { color: '#C4D2DC', fontSize: 10, marginTop: 3 },
  page: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 20, paddingBottom: 40 }, eyebrow: { color: '#1E6484', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 8 },
  title: { color: '#172B3A', fontSize: 26, fontWeight: '800', marginTop: 8 }, description: { color: '#768795', fontSize: 12, lineHeight: 19, marginTop: 8, marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EAF0', borderRadius: 17, padding: 18, marginBottom: 18 }, headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, sectionTitle: { color: '#172B3A', fontSize: 17, fontWeight: '800', flex: 1 },
  label: { color: '#172B3A', fontSize: 12, fontWeight: '800', marginTop: 15, marginBottom: 8 }, input: { minHeight: 45, borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 10, padding: 12, color: '#172B3A', fontSize: 12, backgroundColor: '#FAFBFD' }, contentInput: { minHeight: 180, textAlignVertical: 'top', lineHeight: 18 },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 13, marginBottom: 12 }, searchInput: { flex: 1, minWidth: 0 },
  smallButton: { borderRadius: 9, backgroundColor: '#123553', paddingHorizontal: 13, paddingVertical: 12 }, smallButtonText: { color: '#FFF', fontSize: 11, fontWeight: '800' }, secondaryButton: { borderRadius: 9, backgroundColor: '#EAF2F6', paddingHorizontal: 13, paddingVertical: 12 }, secondaryText: { color: '#123553', fontSize: 11, fontWeight: '800' },
  sourceRow: { borderWidth: 1, borderColor: '#E4EAF0', borderRadius: 11, padding: 12, marginBottom: 8 }, sourceSelected: { borderColor: '#1E6484', backgroundColor: '#F0F6F9' }, sourceTitle: { color: '#172B3A', fontSize: 13, fontWeight: '800' },
  meta: { color: '#768795', fontSize: 11, lineHeight: 17, marginTop: 5 }, checkError: { color: '#9A6120', fontSize: 10, marginTop: 5 }, link: { color: '#1E6484', fontSize: 12, fontWeight: '800', paddingVertical: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 }, option: { borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 11, padding: 10 }, optionSelected: { backgroundColor: '#123553', borderColor: '#123553' }, optionText: { color: '#526675', fontSize: 11, fontWeight: '700' }, optionTextSelected: { color: '#FFF' },
  error: { color: '#A72B3A', fontSize: 12, lineHeight: 19, padding: 14, backgroundColor: '#FFF0F1', borderRadius: 11, marginBottom: 14 }, notice: { color: '#16734C', fontSize: 12, lineHeight: 19, padding: 14, backgroundColor: '#E6F6EE', borderRadius: 11, marginBottom: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, preview: { backgroundColor: '#F4F6F9', padding: 14, borderRadius: 11, marginTop: 15 }, previewText: { color: '#536775', fontSize: 12, lineHeight: 19 }, loader: { padding: 15 },
});
