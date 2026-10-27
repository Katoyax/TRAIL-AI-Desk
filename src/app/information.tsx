import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { demoKnowledge } from '../data/demo-knowledge';
import { SourceCard } from '../components/source-card';
import { Brand } from '../constants/brand';
import { useSession } from '../services/auth';
import { listKnowledge, KnowledgeSource } from '../services/knowledge';

const sections: { title: string; category?: string; description: string }[] = [
  { title: 'University information', category: 'University information', description: 'Explore general campus information from the TRAIL knowledge desk.' },
  { title: 'Offices', category: 'Offices', description: 'Find office services, locations, and reviewed contact details.' },
  { title: 'Procedures & requirements', category: 'Procedures', description: 'Find the steps and requirements for university services.' },
  { title: 'Academic calendar', category: 'Academic calendar', description: 'Check reviewed university dates and holidays. Confirm time-sensitive changes with official channels.' },
  { title: 'Official announcements', category: 'Announcements', description: 'Read announcements available in the reviewed knowledge collection. This list may not include every university update.' },
  { title: 'About / Help', description: 'Understand what TRAIL can help with and where to go for personal student information.' },
];

export default function InformationScreen() {
  const session = useSession();
  const insets = useSafeAreaInsets();
  const [response, setResponse] = useState({ key: '', entries: [] as KnowledgeSource[], error: '' });
  const [retry, setRetry] = useState(0);
  const params = useLocalSearchParams<{ section?: string }>();
  const section = Array.isArray(params.section) ? params.section[0] : params.section;
  const selected = sections.find((item) => item.category === section || item.title === section) ?? sections[0];
  const requestKey = `${selected.category || ''}:${retry}`;
  const loading = !session?.demo && Boolean(selected.category) && response.key !== requestKey;
  const error = response.key === requestKey ? response.error : '';
  const entries = session?.demo ? demoKnowledge.filter((item) => item.category === selected.category) : response.key === requestKey ? response.entries : [];

  useEffect(() => {
    if (session?.demo || !selected.category) return;
    const controller = new AbortController();
    listKnowledge(selected.category, controller.signal)
      .then((items) => { if (!controller.signal.aborted) setResponse({ key: requestKey, entries: items, error: '' }); })
      .catch((cause) => { if (!controller.signal.aborted) setResponse({ key: requestKey, entries: [], error: cause instanceof Error ? cause.message : 'Could not load knowledge sources.' }); });
    return () => controller.abort();
  }, [selected.category, session?.demo, requestKey]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>Information desk</Text><Text style={styles.headerCaption}>TRAIL AI Desk · USTP</Text></View>
      </View>
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.intro}>
          <View style={styles.accent} />
          <Text style={styles.eyebrow}>YOUR CAMPUS, CONNECTED</Text>
          <Text style={styles.pageTitle}>A clearer path to university information.</Text>
        </View>
        <View style={styles.categoryList}>
          {sections.map((item) => {
            const active = item.title === selected.title;
            return (
              <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} key={item.title} onPress={() => router.setParams({ section: item.title })} style={({ pressed }) => [styles.category, active && styles.categoryActive, pressed && styles.pressed]}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item.title}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.sectionHeading}>
          <Text style={styles.title}>{selected.title}</Text>
          <Text style={styles.description}>{selected.description}</Text>
        </View>
        {session?.demo && <View style={styles.notice}><Text style={styles.noticeTitle}>Demo mode · Sample information</Text><Text style={styles.noticeBody}>Sample records are unverified. Confirm requirements and updates with the appropriate USTP office.</Text></View>}
        {selected.title === 'About / Help' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What TRAIL can help with</Text>
            <Text style={styles.body}>TRAIL AI Desk guides students through general university information, office procedures, service requirements, policies, academic calendar dates, and official announcements. Supported answers include their sources for you to review.</Text>
            <View style={styles.divider} />
            <Text style={styles.cardTitle}>For your personal student information</Text>
            <Text style={styles.body}>TRAIL does not access personal grades, class schedules, student records, account details, or financial information. Use PRISMS or contact the appropriate university office for personal student information.</Text>
            <View style={styles.divider} />
            <Text style={styles.cardTitle}>{session?.demo ? 'About this demonstration' : 'Check the source'}</Text>
            <Text style={styles.body}>{session?.demo ? 'Demo records are sample data only. They are marked unverified and must not be treated as official USTP instructions.' : 'Source details show their review status, issuing office, and check dates when available. Confirm time-sensitive updates through official university channels. A missing announcement does not prove an event will not happen.'}</Text>
          </View>
        ) : loading ? (
          <View style={[styles.card, styles.loading]} accessibilityLiveRegion="polite"><ActivityIndicator accessibilityLabel="Loading knowledge sources" color={Brand.blue} /><Text style={[styles.body, styles.loadingText]}>Loading reviewed information…</Text></View>
        ) : error ? (
          <View style={styles.card}><Text style={styles.cardTitle}>Information is unavailable</Text><Text accessibilityRole="alert" style={styles.body}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setRetry((value) => value + 1)} style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}><Text style={styles.retryText}>Try again</Text></Pressable></View>
        ) : entries.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{session?.demo ? 'No sample entries in this section' : selected.category === 'Announcements' ? 'No reviewed announcements available' : 'No reviewed entries available'}</Text>
            <Text style={styles.body}>{session?.demo ? 'This demonstration does not include sample records for every section. Use official USTP channels for current information.' : 'This section has no reviewed information available. Check official USTP channels or contact the relevant university office for current information.'}</Text>
            {selected.category === 'Announcements' && !session?.demo && <Text style={styles.footnote}>An empty list does not confirm that no university announcement exists.</Text>}
          </View>
        ) : entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.cardTitle}>{entry.title}</Text>
            {!!entry.content && <Text style={styles.body}>{entry.content}</Text>}
            <SourceCard source={entry} />
          </View>
        ))}
        <Text style={styles.footer}>Be certain. Choose TRAIL.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.navy },
  back: { width: 44, height: 44, borderRadius: 12, marginRight: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  backText: { color: Brand.surface, fontSize: 30, lineHeight: 34 },
  headerCopy: { flex: 1 },
  headerTitle: { color: Brand.surface, fontSize: 17, fontWeight: '800' },
  headerCaption: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  page: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 20, paddingTop: 30 },
  intro: { marginBottom: 24 },
  accent: { width: 36, height: 4, borderRadius: 2, backgroundColor: Brand.gold, marginBottom: 16 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  pageTitle: { color: Brand.ink, fontSize: 28, lineHeight: 36, fontWeight: '800', maxWidth: 600 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  category: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: Brand.surface },
  categoryActive: { backgroundColor: Brand.navy, borderColor: Brand.navy },
  categoryText: { color: Brand.muted, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  categoryTextActive: { color: Brand.surface },
  sectionHeading: { marginBottom: 18 },
  title: { color: Brand.ink, fontSize: 23, lineHeight: 30, fontWeight: '800' },
  description: { color: Brand.muted, fontSize: 15, lineHeight: 23, marginTop: 8, maxWidth: 700 },
  card: { backgroundColor: Brand.surface, borderColor: Brand.line, borderWidth: 1, borderRadius: 18, padding: 22, marginBottom: 14 },
  cardTitle: { color: Brand.ink, fontSize: 17, lineHeight: 25, fontWeight: '800', marginBottom: 9 },
  body: { color: Brand.muted, fontSize: 15, lineHeight: 24 },
  footnote: { color: Brand.muted, fontSize: 12, lineHeight: 19, marginTop: 12 },
  notice: { padding: 16, backgroundColor: Brand.goldPale, borderRadius: 12, marginBottom: 18, borderLeftWidth: 3, borderLeftColor: Brand.gold },
  noticeTitle: { color: Brand.warning, fontSize: 13, lineHeight: 20, fontWeight: '800' },
  noticeBody: { color: Brand.warning, fontSize: 12, lineHeight: 19, marginTop: 4 },
  divider: { height: 1, backgroundColor: Brand.line, marginVertical: 22 },
  loading: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  loadingText: { flex: 1 },
  retryButton: { alignSelf: 'flex-start', minHeight: 44, paddingVertical: 12, paddingHorizontal: 18, marginTop: 16, borderRadius: 10, backgroundColor: Brand.navy },
  retryText: { color: Brand.surface, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  footer: { color: Brand.muted, fontSize: 12, textAlign: 'center', marginTop: 16 },
  pressed: { opacity: 0.85 },
});
