import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { askTrail } from '../services/chat';
import type { ChatSource, CheckVerification } from '../services/chat';
import { SourceCard, SourceCheckCard } from '../components/source-card';
import { useSession } from '../services/auth';

type Message = { id: string; text: string; sender: 'user' | 'ai'; sources?: ChatSource[]; verification?: CheckVerification; error?: boolean; retryQuestion?: string };
const welcome: Message = {
  id: 'welcome', sender: 'ai',
  text: 'Hi! I can help with general university information, offices, procedures, requirements, and the academic calendar. Each answer shows the source and its verification status.',
};
const suggestions = [
  'What are the requirements for requesting a Certificate of Enrollment?',
  'Are there any university holidays this month?',
  'Where is the Registrar’s Office?',
  'What is my grade?',
];

export default function AIDeskScreen() {
  const session = useSession();
  const { question: routeQuestion } = useLocalSearchParams<{ question?: string }>();
  const [input, setInput] = useState(() => (Array.isArray(routeQuestion) ? routeQuestion[0] : routeQuestion)?.trim() || '');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const scrollRef = useRef<ScrollView>(null);
  const busyRef = useRef(false);
  const messageId = useRef(0);

  const clearConversation = () => {
    if (busyRef.current) return;
    setMessages([welcome]);
    setInput('');
  };

  const sendMessage = async (value = input) => {
    const question = value.trim();
    if (!question || busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setInput('');
    const userId = `user-${++messageId.current}`;
    setMessages((current) => [...current, { id: userId, sender: 'user', text: question }]);

    try {
      const result = await askTrail(question, messages.filter((message) => !message.error).map((message) => ({ role: message.sender === 'user' ? 'user' as const : 'assistant' as const, content: message.text })));
      const answer: Message = {
        id: `ai-${++messageId.current}`, sender: 'ai', text: result.answer, sources: result.sources, verification: result.verification,
      };
      setMessages((current) => [...current, answer]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : '';
      const message = detail.includes('temporarily unavailable')
        ? detail
        : 'I could not reach the TRAIL service. Check your connection and try again.';
      const errorId = `error-${++messageId.current}`;
      setMessages((current) => [...current, { id: errorId, sender: 'ai', text: message, error: true, retryQuestion: question }]);
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')} style={styles.backButton}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={styles.headerBrand}><View style={styles.brandIcon}><Text style={styles.brandIconText}>T</Text></View><View><Text style={styles.headerTitle}>TRAIL AI Desk</Text><Text style={styles.status}>SOURCE STATUS SHOWN WITH ANSWERS</Text></View></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Clear conversation" onPress={clearConversation} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable>
      </View>

      <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        <View style={styles.intro}><Text style={styles.eyebrow}>GENERAL STUDENT INFORMATION</Text><Text style={styles.pageTitle}>How can we help?</Text><Text style={styles.pageSubtitle}>Answers are limited to the available knowledge base and show their source.</Text></View>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.sender === 'user' ? styles.userRow : styles.aiRow]}>
            {message.sender === 'ai' && <View style={styles.messageAvatar}><Text style={styles.avatarText}>T</Text></View>}
            <View style={[styles.messageBubble, message.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              {message.sender === 'ai' && <Text style={styles.senderLabel}>TRAIL AI DESK</Text>}
              <Text style={[styles.messageText, message.sender === 'user' ? styles.userText : styles.aiText]}>{message.text}</Text>
              {message.error && message.retryQuestion && <Pressable accessibilityRole="button" onPress={() => sendMessage(message.retryQuestion)} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable>}
              {message.sources?.map((source, index) => <SourceCard key={`${source.title}-${index}`} source={source} />)}
              {message.verification && <SourceCheckCard verification={message.verification} />}
            </View>
          </View>
        ))}
        {loading && <View style={styles.loadingRow}><ActivityIndicator size="small" color="#1E6484" /><Text style={styles.loadingText}>Searching the knowledge base…</Text></View>}
        {messages.length === 1 && <View style={styles.suggestionBlock}><Text style={styles.suggestionTitle}>{session?.demo ? 'TRY A DEMO QUESTION' : 'ASK A QUESTION'}</Text>{suggestions.map((suggestion) => <Pressable key={suggestion} disabled={loading} onPress={() => sendMessage(suggestion)} style={styles.suggestion}><Text style={styles.suggestionText}>{suggestion}</Text><Text style={styles.suggestionArrow}>↗</Text></Pressable>)}</View>}
      </ScrollView>

      <View style={styles.composerWrap}><View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Ask about general student services…" placeholderTextColor="#8996A4" style={styles.input} multiline maxLength={1000} accessibilityLabel="Your question" editable={!loading} onSubmitEditing={() => sendMessage()} /><Pressable accessibilityRole="button" accessibilityLabel="Send question" disabled={!input.trim() || loading} onPress={() => sendMessage()} style={[styles.sendButton, (!input.trim() || loading) && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable></View><Text style={styles.disclaimer}>Personal student information is outside scope. Check the source status; demo records are not verified USTP guidance.</Text></View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  header: { minHeight: 72, paddingHorizontal: 18, backgroundColor: '#123553', flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
  backText: { color: '#FFF', fontSize: 27, marginTop: -3 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  brandIconText: { color: '#E6B95F', fontWeight: '900', fontSize: 17 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  status: { color: '#D5B86D', fontSize: 8, letterSpacing: 0.6, marginTop: 3 },
  clearButton: { marginLeft: 'auto', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9 },
  clearText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  chat: { flex: 1 },
  chatContent: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 26, flexGrow: 1 },
  intro: { marginBottom: 22 },
  eyebrow: { color: '#1E6484', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  pageTitle: { color: '#172B3A', fontSize: 25, fontWeight: '800' },
  pageSubtitle: { color: '#768795', fontSize: 11, marginTop: 5, lineHeight: 17 },
  messageRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', marginBottom: 13, gap: 8 },
  userRow: { justifyContent: 'flex-end' }, aiRow: { justifyContent: 'flex-start' },
  messageAvatar: { width: 27, height: 27, borderRadius: 9, backgroundColor: '#123553', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  avatarText: { color: '#E6B95F', fontSize: 12, fontWeight: '900' },
  messageBubble: { maxWidth: '84%', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 15 },
  aiBubble: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EAF0', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#123553', borderBottomRightRadius: 5 },
  senderLabel: { color: '#1E6484', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 5 },
  messageText: { fontSize: 12, lineHeight: 19 }, aiText: { color: '#172B3A' }, userText: { color: '#FFF' },
  sourceBox: { marginTop: 11, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#E4EAF0' },
  sourceLabel: { color: '#1E6484', fontSize: 8, fontWeight: '900', letterSpacing: 0.7 },
  sourceTitle: { color: '#344E5E', fontSize: 10, fontWeight: '700', marginTop: 4 },
  sourceText: { color: '#768795', fontSize: 9, lineHeight: 14, marginTop: 3 },
  retryButton: { alignSelf: 'flex-start', marginTop: 9, borderRadius: 8, backgroundColor: '#EAF2F6', paddingVertical: 7, paddingHorizontal: 10 },
  retryText: { color: '#123553', fontSize: 10, fontWeight: '800' },
  loadingRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginLeft: 35, marginBottom: 12 },
  loadingText: { color: '#768795', fontSize: 10 },
  suggestionBlock: { marginTop: 5, marginLeft: 35, gap: 7 },
  suggestionTitle: { color: '#768795', fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  suggestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EAF0', borderRadius: 11, paddingVertical: 10, paddingHorizontal: 12 },
  suggestionText: { color: '#123553', fontSize: 10, fontWeight: '600', flex: 1 }, suggestionArrow: { color: '#1E6484', fontSize: 12 },
  composerWrap: { width: '100%', paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === 'web' ? 11 : 8, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E4EAF0' },
  composer: { width: '100%', maxWidth: 850, alignSelf: 'center', minHeight: 50, borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 13, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'flex-end', padding: 5, gap: 7 },
  input: { flex: 1, minWidth: 0, minHeight: 39, maxHeight: 100, color: '#172B3A', fontSize: 12, paddingHorizontal: 10, paddingVertical: 9 },
  sendButton: { width: 39, height: 39, borderRadius: 10, backgroundColor: '#123553', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#A9B5BF' }, sendText: { color: '#FFF', fontSize: 21, fontWeight: '700' },
  disclaimer: { maxWidth: 850, width: '100%', alignSelf: 'center', color: '#8996A4', fontSize: 8, textAlign: 'center', marginTop: 7 },
});
