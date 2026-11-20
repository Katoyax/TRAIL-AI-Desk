import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '../constants/brand';
import { signOut, useSession } from '../services/auth';
import { listKnowledgeManagerSources, type ManagerKnowledgeSource } from '../services/knowledge';

type SourceState = {
  token: string;
  items: ManagerKnowledgeSource[];
  error: string;
};

// Displays real source-status summaries for an authenticated Knowledge-Base Manager.
export default function KnowledgeManagerDashboardScreen() {
  const session = useSession();
  const token = session?.token;
  const [sourceState, setSourceState] = useState<SourceState | null>(null);

  useEffect(() => {
    if (!token || session?.demo || session?.user.role !== 'knowledge_manager' || session.user.mustChangePassword) return;
    const controller = new AbortController();
    const currentToken = token;
    void listKnowledgeManagerSources(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setSourceState({ token: currentToken, items, error: '' });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setSourceState({
            token: currentToken,
            items: [],
            error: cause instanceof Error ? cause.message : 'Unable to load knowledge sources.',
          });
        }
      });
    return () => controller.abort();
  }, [token, session?.demo, session?.user.role, session?.user.mustChangePassword]);

  if (!session || session.demo || session.user.role !== 'knowledge_manager' || session.user.mustChangePassword) return null;

  const current = sourceState?.token === token ? sourceState : null;
  const items = current?.items ?? [];
  const pending = items.filter((item) => item.draftStatus === 'pending_review' || (!item.draftStatus && item.verificationStatus === 'pending_verification')).length;
  const approved = items.filter((item) => item.verificationStatus === 'verified').length;
  const rejected = items.filter((item) => item.verificationStatus === 'rejected').length;

  const handleLogout = () => {
    signOut();
    router.replace('/staff-login');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>TRAIL AI Desk</Text>
          <Text style={styles.headerSubtitle}>Knowledge-Base Manager Workspace</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>KNOWLEDGE GOVERNANCE</Text>
        <Text accessibilityRole="header" style={styles.title}>Knowledge-Base Manager Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {session.user.name}. Review source status within your protected staff role.</Text>

        {current === null ? <ActivityIndicator color={Brand.blue} /> : current.error !== '' ? (
          <Text accessibilityRole="alert" style={styles.error}>{current.error}</Text>
        ) : (
          <View style={styles.statsRow}>
            {[
              ['Knowledge Sources', items.length],
              ['Pending Knowledge Reviews', pending],
              ['Approved Knowledge Sources', approved],
              ['Rejected Knowledge Sources', rejected],
            ].map(([label, value]) => (
              <View key={String(label)} style={styles.statCard}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manage Knowledge Sources</Text>
          <Text style={styles.cardDescription}>
            Create manual institutional source drafts, preserve version history, and submit completed drafts for independent review.
          </Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/knowledge-source-management')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Manage knowledge sources</Text>
          </Pressable>
          <Text style={styles.planned}>Approval, rejection, publication, and indexing remain unavailable in this checkpoint.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.cardDescription}>{session.user.email}</Text>
          <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign out</Text>
          </Pressable>
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
  logoutButton: { borderWidth: 1, borderColor: Brand.onNavy, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  logoutText: { color: Brand.surface, fontWeight: '700' },
  content: { width: '100%', maxWidth: 1120, alignSelf: 'center', padding: 24, paddingBottom: 64 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginTop: 12, marginBottom: 10 },
  title: { color: Brand.navy, fontSize: 32, fontWeight: '800' },
  subtitle: { color: Brand.muted, fontSize: 15, lineHeight: 24, marginTop: 10, marginBottom: 24 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 22 },
  statCard: { flexGrow: 1, flexBasis: 220, minWidth: 0, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 22 },
  statLabel: { color: Brand.muted, fontSize: 14, fontWeight: '600' },
  statValue: { color: Brand.navy, fontSize: 34, fontWeight: '800', marginTop: 10 },
  card: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 14, padding: 22, marginBottom: 16 },
  cardTitle: { color: Brand.navy, fontSize: 19, fontWeight: '800', marginBottom: 10 },
  cardDescription: { color: Brand.muted, fontSize: 14, lineHeight: 22 },
  planned: { color: Brand.warning, fontSize: 13, fontWeight: '700', marginTop: 16 },
  primaryButton: { alignSelf: 'flex-start', backgroundColor: Brand.navy, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 12, marginTop: 16 },
  primaryButtonText: { color: Brand.surface, fontWeight: '700' },
  error: { color: Brand.error, backgroundColor: '#FFF0F1', borderRadius: 10, padding: 14, marginBottom: 18 },
});
