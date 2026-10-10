import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { demoKnowledge, KnowledgeCategory } from '../data/demo-knowledge';
import { SourceCard } from '../components/source-card';
import { useSession } from '../services/auth';
import { listKnowledge, KnowledgeSource } from '../services/knowledge';

const sections: { title: string; category?: KnowledgeCategory; description: string }[] = [
  { title: 'University information', category: 'University information', description: 'General campus information and announcements.' },
  { title: 'Offices', category: 'Offices', description: 'Office services, locations, and verified contact details.' },
  { title: 'Procedures & requirements', category: 'Procedures', description: 'Steps and requirements for university services.' },
  { title: 'Academic calendar', category: 'Academic calendar', description: 'General university dates and holidays.' },
  { title: 'About / Help', description: 'What TRAIL can answer and where to get help with personal information.' },
];

export default function InformationScreen() {
  const session = useSession();
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
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View><Text style={styles.headerTitle}>University information</Text><Text style={styles.headerCaption}>Browse the TRAIL knowledge desk</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.categoryList}>
          {sections.map((item) => (
            <Pressable key={item.title} onPress={() => router.setParams({ section: item.category ?? item.title })} style={[styles.category, item.title === selected.title && styles.categoryActive]}>
              <Text style={[styles.categoryText, item.title === selected.title && styles.categoryTextActive]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.title}>{selected.title}</Text>
        <Text style={styles.description}>{selected.description}</Text>
        {selected.title === 'About / Help' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What TRAIL AI Desk can answer</Text>
            <Text style={styles.body}>TRAIL AI Desk is a student-facing guide to general university and campus information, such as office procedures, service requirements, office details, policies, academic calendar dates, and official announcements. Answers should be grounded in reviewed sources.</Text>
            <Text style={styles.cardTitle}>What it cannot answer</Text>
            <Text style={styles.body}>TRAIL does not access personal grades, class schedules, student records, account details, or financial information. Use PRISMS or contact the appropriate university office for personal student information.</Text>
            <Text style={styles.cardTitle}>{session?.demo ? 'About this demonstration' : 'Source transparency'}</Text>
            <Text style={styles.body}>{session?.demo ? 'The records included in demo mode are sample data only. They are marked unverified and must not be treated as official USTP instructions.' : 'Official information includes its verification status, issuing office, and source check date. Follow official university announcements for time-sensitive updates. A missing announcement does not prove an event will not happen.'}</Text>
          </View>
        ) : loading ? <ActivityIndicator accessibilityLabel="Loading knowledge sources" color="#1E6484" /> : error ? <View style={styles.card}><Text accessibilityRole="alert" style={styles.body}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setRetry((value) => value + 1)}><Text style={styles.meta}>Try again</Text></Pressable></View> : entries.length === 0 ? (
          <View style={styles.card}><Text style={styles.emptyTitle}>No verified entries yet</Text><Text style={styles.body}>This section has no reviewed information available. Check official USTP channels or contact the relevant university office.</Text></View>
        ) : entries.map((entry) => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.cardTitle}>{entry.title}</Text>
            <Text style={styles.body}>{entry.content}</Text>
            <SourceCard source={entry} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  header: { minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#123553' },
  back: { width: 38, height: 38, borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  backText: { color: '#FFF', fontSize: 27, marginTop: -3 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  headerCaption: { color: '#C4D2DC', fontSize: 10, marginTop: 3 },
  page: { width: '100%', maxWidth: 850, alignSelf: 'center', padding: 20, paddingBottom: 40 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  category: { borderWidth: 1, borderColor: '#E4EAF0', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FFF' },
  categoryActive: { backgroundColor: '#123553', borderColor: '#123553' },
  categoryText: { color: '#526675', fontSize: 10, fontWeight: '700' },
  categoryTextActive: { color: '#FFF' },
  title: { color: '#172B3A', fontSize: 25, fontWeight: '800' },
  description: { color: '#768795', fontSize: 12, marginTop: 6, marginBottom: 18 },
  card: { backgroundColor: '#FFF', borderColor: '#E4EAF0', borderWidth: 1, borderRadius: 16, padding: 17, marginBottom: 12 },
  demoTag: { alignSelf: 'flex-start', backgroundColor: '#FFF4DB', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, marginBottom: 10 },
  demoTagText: { color: '#87631B', fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  cardTitle: { color: '#172B3A', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  emptyTitle: { color: '#172B3A', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  body: { color: '#536775', fontSize: 12, lineHeight: 19 },
  meta: { color: '#768795', fontSize: 10, marginTop: 9 },
});
