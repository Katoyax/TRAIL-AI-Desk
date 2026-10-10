import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ChatSource, CheckVerification } from '../services/chat';
import { apiUrl } from '../services/api';

export function formatSourceDate(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric', ...(value.length > 10 ? { hour: 'numeric', minute: '2-digit' } : {}) });
}

function safeWebUrl(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}

function documentUrl(value?: string) {
  if (!apiUrl || !value || !/^\/api\/documents\/[a-zA-Z0-9_-]+$/.test(value)) return undefined;
  return safeWebUrl(`${apiUrl}${value}`);
}

export function SourceCard({ source }: { source: ChatSource }) {
  const [error, setError] = useState('');
  const [clockSnapshot] = useState(() => Date.now());
  const demo = source.demo || source.dataStatus === 'demo_unverified';
  const verificationTime = source.verifiedAt || source.metadata?.verifiedAt;
  const verifier = source.verifiedBy || source.metadata?.verifiedBy;
  const verified = !demo && source.verificationStatus === 'verified' && source.isActive !== false && Boolean(verificationTime && !Number.isNaN(Date.parse(verificationTime)) && verifier);
  const status = source.dataStatus === 'verified_policy' ? 'TRAIL scope policy' : demo ? 'DEMO / UNVERIFIED' : verified ? 'Verified' : (source.verificationStatus === 'verified' ? 'Unverified' : source.verificationStatus || 'Unverified').replace(/_/g, ' ');
  const officialUrl = safeWebUrl(source.sourceUrl);
  const uploadedUrl = documentUrl(source.viewUrl);
  const checkDue = source.nextCheck && new Date(source.nextCheck).getTime() < clockSnapshot;
  const checkError = source.freshness?.lastCheckError || source.lastCheckError;
  const open = async (url: string) => { setError(''); try { await Linking.openURL(url); } catch { setError('Could not open this source. Please try again.'); } };
  return <View style={styles.card}>
    <Text style={[styles.status, verified && styles.verified]}>{status}</Text>
    {!!source.documentNumber && <Text style={styles.title}>Memorandum No. {source.documentNumber}</Text>}
    <Text style={styles.title}>{source.documentTitle || source.title}</Text>
    {!!(source.issuingOffice || source.office) && <Text style={styles.meta}>Issued by: {source.issuingOffice || source.office}</Text>}
    {!!source.category && <Text style={styles.meta}>Category: {source.category}</Text>}
    {!!(source.dateIssued || source.datePublished) && <Text style={styles.meta}>{source.dateIssued ? 'Date issued' : 'Date published'}: {formatSourceDate(source.dateIssued || source.datePublished)}</Text>}
    {!!source.effectiveFrom && <Text style={styles.meta}>Applies from: {formatSourceDate(source.effectiveFrom)}{source.effectiveTo ? ` through ${formatSourceDate(source.effectiveTo)}` : ''}</Text>}
    {!!source.source && <Text style={styles.meta}>Source: {source.source}</Text>}
    {source.dataStatus !== 'verified_policy' && <Text style={styles.meta}>Last checked: {formatSourceDate(source.lastChecked)}</Text>}
    {!!source.lastUpdated && <Text style={styles.meta}>Last updated: {formatSourceDate(source.lastUpdated)}</Text>}
    {!!source.version && <Text style={styles.meta}>Version: {source.version}</Text>}
    {verified && <Text style={styles.meta}>{source.metadata?.verificationMethod === 'official_url_refresh' ? 'Source approved on' : 'Verified on'}: {formatSourceDate(verificationTime)}</Text>}
    {verified && source.metadata?.verificationMethod === 'official_url_refresh' && <Text style={styles.meta}>Latest content checked automatically from the approved official URL: {formatSourceDate(source.metadata.contentVerifiedAt)}</Text>}
    {!!checkError && <Text style={styles.warning}>Latest check failed. Previous information was retained. {checkError}</Text>}
    {!!checkDue && !checkError && <Text style={styles.warning}>A new source check is due. Confirm time-sensitive information with official university channels.</Text>}
    {(source.freshness?.status === 'stale' || source.freshnessStatus === 'stale' || source.verificationStatus === 'outdated') && !checkDue && !checkError && <Text style={styles.warning}>This source may be out of date. Confirm current information with the issuing office.</Text>}
    {!!officialUrl && <Pressable accessibilityRole="link" onPress={() => open(officialUrl)}><Text style={styles.link}>View official source ↗</Text></Pressable>}
    {!!uploadedUrl && <Pressable accessibilityRole="link" onPress={() => open(uploadedUrl)}><Text style={styles.link}>View uploaded document ↗</Text></Pressable>}
    {!!error && <Text accessibilityRole="alert" style={styles.warning}>{error}</Text>}
  </View>;
}

export function SourceCheckCard({ verification }: { verification: CheckVerification }) {
  const [error, setError] = useState('');
  const [clockSnapshot] = useState(() => Date.now());
  const open = async (value?: string) => { const url = safeWebUrl(value); if (!url) return; setError(''); try { await Linking.openURL(url); } catch { setError('Could not open the checked source. Please try again.'); } };
  return <View style={styles.card}>
    <Text style={styles.status}>{verification.status.replace(/_/g, ' ')}</Text>
    {!!verification.lastChecked && <Text style={styles.meta}>Last checked: {formatSourceDate(verification.lastChecked)}</Text>}
    {!!verification.coverage && <Text style={styles.meta}>{verification.coverage}</Text>}
    {!!verification.sourcesChecked?.length && <Text style={styles.title}>Sources checked</Text>}
    {verification.sourcesChecked?.map((source, index) => <View key={`${source.title}-${index}`}><Text style={styles.meta}>{source.title}{source.lastChecked ? ` · ${formatSourceDate(source.lastChecked)}` : ''}</Text>{source.lastCheckError ? <Text style={styles.warning}>Latest check failed{source.lastAttemptedAt ? ` (${formatSourceDate(source.lastAttemptedAt)})` : ''}: {source.lastCheckError}</Text> : source.nextCheck && new Date(source.nextCheck).getTime() < clockSnapshot ? <Text style={styles.warning}>A new source check is due.</Text> : null}{safeWebUrl(source.sourceUrl) && <Pressable accessibilityRole="link" onPress={() => open(source.sourceUrl)}><Text style={styles.link}>View checked source ↗</Text></Pressable>}</View>)}
    {!!error && <Text accessibilityRole="alert" style={styles.warning}>{error}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  card: { marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E4EAF0' },
  status: { color: '#87631B', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  verified: { color: '#16734C' }, title: { color: '#344E5E', fontSize: 12, fontWeight: '700', marginTop: 5 },
  meta: { color: '#768795', fontSize: 11, lineHeight: 17, marginTop: 4 },
  warning: { color: '#9A6120', fontSize: 11, lineHeight: 17, marginTop: 6 },
  link: { color: '#1E6484', fontSize: 12, fontWeight: '800', paddingVertical: 9 },
});
