import { router } from 'expo-router';
import { signOut, useSession } from '../services/auth';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const shortcuts = [
  { icon: '01', title: 'University info', detail: 'General campus information', section: 'University information' },
  { icon: '02', title: 'Offices', detail: 'Services and locations', section: 'Offices' },
  { icon: '03', title: 'Procedures', detail: 'Requirements and steps', section: 'Procedures' },
  { icon: '04', title: 'Academic calendar', detail: 'General dates and holidays', section: 'Academic calendar' },
];

const commonQuestions = [
  'Where is the Registrar’s Office?',
  'What do I need to enroll?',
  'How do I request my TOR?',
];

export default function DashboardScreen() {
  const session = useSession();
  const openAssistant = (question?: string) => router.push(
    question ? { pathname: '/ai-desk', params: { question } } : '/ai-desk'
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.canvas} />
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>T</Text>
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>TRAIL</Text>
            <Text style={styles.brandCaption}>STUDENT DESK</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() => { signOut(); router.replace('/'); }}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>YOUR CAMPUS, MADE SIMPLER</Text>
          <Text style={styles.greeting}>Good day, {session?.user.name || 'student'}</Text>
          <Text style={styles.welcomeCopy}>
            What can we help you with today?
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => openAssistant()}
          style={({ pressed }) => [styles.assistantCard, pressed && styles.pressed]}
        >
          <View style={styles.assistantTop}>
            <View style={styles.assistantBadge}>
              <Text style={styles.assistantBadgeText}>AI</Text>
            </View>
            <Text style={styles.onlineLabel}><Text style={styles.onlineDot}>●</Text> {session?.demo ? 'DEMO ASSISTANT' : 'UNIVERSITY ASSISTANT'}</Text>
          </View>
          <Text style={styles.assistantTitle}>Ask TRAIL AI Desk</Text>
          <Text style={styles.assistantCopy}>
            Get help with university offices, procedures, requirements, and general campus information.
          </Text>
          <View style={styles.askBar}>
            <Text style={styles.askHint}>Ask a question...</Text>
            <View style={styles.askArrow}><Text style={styles.askArrowText}>→</Text></View>
          </View>
        </Pressable>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Explore services</Text>
          <Text style={styles.sectionNote}>TAP TO ASK</Text>
        </View>
        <View style={styles.shortcutGrid}>
          {shortcuts.map((item, index) => (
            <Pressable
              accessibilityRole="button"
              key={item.title}
              onPress={() => router.push({ pathname: '/information', params: { section: item.section } })}
              style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
            >
              <View style={[styles.shortcutIcon, index % 2 === 0 ? styles.iconBlue : styles.iconGold]}>
                <Text style={[styles.shortcutIconText, index % 2 === 0 ? styles.iconBlueText : styles.iconGoldText]}>{item.icon}</Text>
              </View>
              <Text style={styles.shortcutTitle}>{item.title}</Text>
              <Text style={styles.shortcutDetail}>{item.detail}</Text>
              <Text style={styles.shortcutArrow}>↗</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Popular questions</Text>
          <Pressable onPress={() => openAssistant()} hitSlop={8}>
            <Text style={styles.seeAll}>Ask a question →</Text>
          </Pressable>
        </View>
        <View style={styles.questionsCard}>
          {commonQuestions.map((question, index) => (
            <Pressable
              accessibilityRole="button"
              key={question}
              onPress={() => openAssistant(question)}
              style={({ pressed }) => [styles.questionRow, pressed && styles.pressed]}
            >
              <View style={styles.questionNumber}><Text style={styles.questionNumberText}>0{index + 1}</Text></View>
              <Text style={styles.questionText}>{question}</Text>
              <Text style={styles.questionArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportCopy}>
            <Text style={styles.supportEyebrow}>NEED A PERSON?</Text>
            <Text style={styles.supportTitle}>Send us a concern</Text>
            <Text style={styles.supportDescription}>We’ll help you find the right place to start.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/ticket')}
            style={({ pressed }) => [styles.supportButton, pressed && styles.pressed]}
          >
            <Text style={styles.supportButtonText}>Get help  →</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/information', params: { section: 'About / Help' } })} style={styles.helpLink}>
          <Text style={styles.helpTitle}>About TRAIL AI Desk &amp; help</Text>
          <Text style={styles.helpCopy}>General information only · Personal records remain in PRISMS</Text>
          <Text style={styles.helpArrow}>›</Text>
        </Pressable>

        {session?.user.role === 'admin' && !session.demo && <Pressable accessibilityRole="button" onPress={() => router.push('/admin')} style={styles.helpLink}><Text style={styles.helpTitle}>Manage knowledge sources</Text><Text style={styles.helpCopy}>Add, review, verify, and refresh official information</Text></Pressable>}
        <Text style={styles.footer}>TRAIL AI Desk · USTP student support</Text>
      </ScrollView>
    </View>
  );
}

const COLORS = {
  canvas: '#F4F6F9',
  navy: '#123553',
  blue: '#1E6484',
  gold: '#E6B95F',
  ink: '#172B3A',
  muted: '#768795',
  line: '#E6EBEF',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.canvas },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 34 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: COLORS.gold, fontSize: 22, fontWeight: '900' },
  brandCopy: { marginLeft: 10 },
  brandName: { color: COLORS.navy, fontSize: 15, letterSpacing: 2, fontWeight: '900' },
  brandCaption: { color: COLORS.muted, fontSize: 8, letterSpacing: 1.5, fontWeight: '700', marginTop: 2 },
  signOut: { marginLeft: 'auto', paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: '#DCE4E9', borderRadius: 10, backgroundColor: COLORS.white },
  signOutText: { color: COLORS.navy, fontSize: 12, fontWeight: '700' },
  welcome: { marginBottom: 22 },
  eyebrow: { color: COLORS.blue, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  greeting: { color: COLORS.ink, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  welcomeCopy: { color: COLORS.muted, fontSize: 14, marginTop: 6 },
  assistantCard: { backgroundColor: COLORS.navy, borderRadius: 22, padding: 21, marginBottom: 29, overflow: 'hidden' },
  assistantTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 19 },
  assistantBadge: { width: 39, height: 39, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  assistantBadgeText: { color: COLORS.gold, fontSize: 13, fontWeight: '900' },
  onlineLabel: { color: '#B8CBD7', fontSize: 9, letterSpacing: 1, fontWeight: '800' },
  onlineDot: { color: '#8DD6AA', fontSize: 9 },
  assistantTitle: { color: COLORS.white, fontSize: 23, fontWeight: '800', letterSpacing: -0.3 },
  assistantCopy: { color: '#C1D0DA', fontSize: 13, lineHeight: 20, marginTop: 7, marginBottom: 18, maxWidth: 470 },
  askBar: { minHeight: 49, borderRadius: 13, backgroundColor: COLORS.white, paddingLeft: 15, paddingRight: 6, flexDirection: 'row', alignItems: 'center' },
  askHint: { color: '#8997A1', fontSize: 13, flex: 1 },
  askArrow: { backgroundColor: COLORS.gold, width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  askArrowText: { color: COLORS.navy, fontSize: 20, fontWeight: '700', marginTop: -2 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800' },
  sectionNote: { color: COLORS.muted, fontSize: 9, letterSpacing: 1.1, fontWeight: '800' },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginBottom: 29 },
  shortcut: { width: '48%', flexGrow: 1, minWidth: 140, minHeight: 133, backgroundColor: COLORS.white, borderRadius: 17, padding: 15, borderWidth: 1, borderColor: COLORS.line },
  shortcutIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  iconBlue: { backgroundColor: '#E9F2F6' },
  iconGold: { backgroundColor: '#FBF3E2' },
  shortcutIconText: { fontSize: 11, fontWeight: '900' },
  iconBlueText: { color: COLORS.blue },
  iconGoldText: { color: '#9A7127' },
  shortcutTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  shortcutDetail: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  shortcutArrow: { position: 'absolute', right: 14, top: 15, color: '#A2AFB8', fontSize: 17 },
  seeAll: { color: COLORS.blue, fontSize: 11, fontWeight: '700' },
  questionsCard: { paddingHorizontal: 14, backgroundColor: COLORS.white, borderRadius: 17, borderWidth: 1, borderColor: COLORS.line, marginBottom: 23 },
  questionRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.line },
  questionNumber: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#EFF4F6', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  questionNumberText: { color: COLORS.blue, fontSize: 9, fontWeight: '900' },
  questionText: { color: COLORS.ink, fontSize: 12, flex: 1, fontWeight: '600' },
  questionArrow: { color: COLORS.blue, fontSize: 22, marginLeft: 8 },
  supportCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: '#EAF0F3', borderRadius: 18, padding: 17 },
  supportCopy: { flex: 1 },
  supportEyebrow: { color: COLORS.blue, fontSize: 9, letterSpacing: 1.2, fontWeight: '900', marginBottom: 5 },
  supportTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  supportDescription: { color: COLORS.muted, fontSize: 10, marginTop: 4, lineHeight: 15 },
  supportButton: { backgroundColor: COLORS.navy, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11 },
  supportButtonText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  helpLink: { position: 'relative', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 15, padding: 15, marginTop: 12 },
  helpTitle: { color: COLORS.ink, fontSize: 12, fontWeight: '800' },
  helpCopy: { color: COLORS.muted, fontSize: 10, marginTop: 5, paddingRight: 20 },
  helpArrow: { position: 'absolute', right: 14, top: 17, color: COLORS.blue, fontSize: 20 },
  footer: { color: '#99A6AF', fontSize: 10, textAlign: 'center', marginTop: 22 },
  pressed: { opacity: 0.78 },
});
