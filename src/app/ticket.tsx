import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '../constants/brand';
import { useSession, validEmail } from '../services/auth';

const categories = ['Enrollment', 'Documents', 'Campus', 'Other'];

export default function TicketScreen() {
  const session = useSession();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [name, setName] = useState(session?.user.name ?? '');
  const [email, setEmail] = useState(session?.user.email ?? '');
  const [category, setCategory] = useState(categories[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);

  const previewConcern = () => {
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please complete your name, email, and concern before previewing.');
      return;
    }
    if (!validEmail(email)) {
      setError('Enter a valid email address, such as you@ustp.edu.ph.');
      return;
    }
    setError('');
    setPreview(true);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const editConcern = () => {
    setPreview(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}><Text style={styles.headerTitle}>My concerns</Text><Text style={styles.headerSubtitle}>TRAIL AI Desk · Student support</Text></View>
      </View>
      <ScrollView ref={scroll} contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.formCard}>
          <View style={styles.accent} />
          <Text style={styles.eyebrow}>{preview ? 'CONCERN PREVIEW' : 'A LITTLE GUIDANCE GOES A LONG WAY'}</Text>
          <Text accessibilityRole="header" style={styles.title}>{preview ? 'Review your concern' : 'Prepare a concern'}</Text>
          <Text style={styles.description}>{preview ? 'Here is the information you entered. You can go back and make changes.' : 'Organize your question so you can explain what you need help with.'}</Text>
          <View style={styles.prototypeNotice}>
            <Text style={styles.prototypeTitle}>Prototype only · Nothing is submitted</Text>
            <Text style={styles.prototypeText}>This form previews your concern on this screen. It does not send, save, or create a support ticket. For assistance, contact the relevant university office directly.</Text>
          </View>
          {preview ? (
            <View>
              <Text style={styles.summaryLabel}>Your name</Text><Text style={styles.summaryValue}>{name.trim()}</Text>
              <Text style={styles.summaryLabel}>Email</Text><Text style={styles.summaryValue}>{email.trim()}</Text>
              <Text style={styles.summaryLabel}>Category</Text><Text style={styles.summaryValue}>{category}</Text>
              <Text style={styles.summaryLabel}>Your concern</Text><Text style={[styles.summaryValue, styles.summaryDetails]}>{details.trim()}</Text>
              <Pressable accessibilityRole="button" onPress={editConcern} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>Edit concern</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => router.replace('/dashboard')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Back to dashboard</Text></Pressable>
              <Text style={styles.privacyNote}>Your preview is temporary and will be cleared when you leave this screen.</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Your name</Text>
              <TextInput accessibilityLabel="Your name" value={name} onChangeText={(value) => { setName(value); setError(''); }} placeholder="Full name" placeholderTextColor={Brand.muted} style={styles.input} autoCapitalize="words" autoComplete="name" maxLength={120} returnKeyType="next" />
              <Text style={styles.label}>Email address</Text>
              <TextInput accessibilityLabel="Email address" value={email} onChangeText={(value) => { setEmail(value); setError(''); }} placeholder="you@ustp.edu.ph" placeholderTextColor={Brand.muted} style={styles.input} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} returnKeyType="next" />
              <Text style={styles.label}>What is this about?</Text>
              <View style={styles.categories}>
                {categories.map((item) => (
                  <Pressable accessibilityRole="radio" accessibilityState={{ checked: category === item }} key={item} onPress={() => setCategory(item)} style={({ pressed }) => [styles.category, category === item && styles.categorySelected, pressed && styles.pressed]}>
                    <Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{category === item ? '✓ ' : ''}{item}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>Tell us a little more</Text>
              <TextInput accessibilityLabel="Concern details" value={details} onChangeText={(value) => { setDetails(value); setError(''); }} placeholder="Describe what you need help with…" placeholderTextColor={Brand.muted} style={[styles.input, styles.detailsInput]} multiline maxLength={1000} textAlignVertical="top" />
              <View style={styles.fieldFooter}><Text style={styles.fieldHint}>Avoid including passwords or sensitive student records.</Text><Text style={styles.characterCount}>{details.length}/1000</Text></View>
              {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              <Pressable accessibilityRole="button" onPress={previewConcern} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>Preview concern →</Text></Pressable>
              <Text style={styles.privacyNote}>Preview only. Your details are not sent to a university office.</Text>
            </View>
          )}
        </View>
        <Text style={styles.footer}>Be certain. Choose TRAIL.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.navy },
  backButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', marginRight: 14 },
  backArrow: { color: Brand.surface, fontSize: 30, lineHeight: 34 },
  headerCopy: { flex: 1 },
  headerTitle: { color: Brand.surface, fontSize: 17, fontWeight: '800' },
  headerSubtitle: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 30 },
  formCard: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 22, padding: 24 },
  accent: { width: 36, height: 4, borderRadius: 2, backgroundColor: Brand.gold, marginBottom: 20 },
  eyebrow: { color: Brand.blue, fontSize: 12, lineHeight: 18, fontWeight: '800', letterSpacing: 1.1, marginBottom: 10 },
  title: { color: Brand.ink, fontSize: 28, lineHeight: 35, fontWeight: '800' },
  description: { color: Brand.muted, fontSize: 15, lineHeight: 23, marginTop: 9, marginBottom: 20 },
  prototypeNotice: { backgroundColor: Brand.goldPale, borderLeftColor: Brand.gold, borderLeftWidth: 3, borderRadius: 11, padding: 15, marginBottom: 10 },
  prototypeTitle: { color: Brand.warning, fontSize: 13, lineHeight: 20, fontWeight: '800', marginBottom: 5 },
  prototypeText: { color: Brand.warning, fontSize: 12, lineHeight: 19 },
  label: { color: Brand.ink, fontSize: 14, fontWeight: '700', marginBottom: 9, marginTop: 18 },
  input: { minHeight: 52, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 12, backgroundColor: Brand.surface, paddingHorizontal: 14, paddingVertical: 13, color: Brand.ink, fontSize: 15 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: Brand.surface },
  categorySelected: { backgroundColor: Brand.navy, borderColor: Brand.navy },
  categoryText: { color: Brand.muted, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  categoryTextSelected: { color: Brand.surface, fontWeight: '800' },
  detailsInput: { minHeight: 150, lineHeight: 23 },
  fieldFooter: { flexDirection: 'row', gap: 12, marginTop: 8 },
  fieldHint: { flex: 1, color: Brand.muted, fontSize: 12, lineHeight: 19 },
  characterCount: { color: Brand.muted, textAlign: 'right', fontSize: 12, lineHeight: 19 },
  error: { color: Brand.error, fontSize: 14, lineHeight: 21, marginTop: 14 },
  primaryButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.navy, borderRadius: 12, marginTop: 24, padding: 14 },
  primaryButtonText: { color: Brand.surface, fontSize: 15, lineHeight: 22, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 12, marginTop: 10, padding: 12 },
  secondaryButtonText: { color: Brand.blue, fontSize: 14, lineHeight: 22, fontWeight: '700' },
  privacyNote: { color: Brand.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 14 },
  summaryLabel: { color: Brand.muted, fontSize: 12, lineHeight: 19, fontWeight: '700', marginTop: 20, marginBottom: 5 },
  summaryValue: { color: Brand.ink, fontSize: 15, lineHeight: 24 },
  summaryDetails: { borderWidth: 1, borderColor: Brand.line, borderRadius: 12, backgroundColor: Brand.canvas, padding: 16 },
  footer: { color: Brand.muted, fontSize: 12, textAlign: 'center', marginTop: 24 },
  pressed: { opacity: 0.85 },
});
