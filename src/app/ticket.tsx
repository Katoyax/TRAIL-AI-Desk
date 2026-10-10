import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const categories = ['Enrollment', 'Documents', 'Campus', 'Other'];

export default function TicketScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');

  const submit = () => {
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError('Please complete your name, campus email, and concern.');
      return;
    }

    setError('');
    setTicketNumber(`TR-${Date.now().toString().slice(-6)}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
          onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Student support</Text>
          <Text style={styles.headerSubtitle}>TRAIL AI Desk</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {ticketNumber ? (
          <View style={styles.successCard}>
            <View style={styles.successMark}><Text style={styles.successMarkText}>✓</Text></View>
            <Text style={styles.eyebrow}>DEMO CONFIRMATION</Text>
            <Text style={styles.title}>Concern received</Text>
            <Text style={styles.description}>
              Your demo reference is below. This prototype has not sent or saved your concern.
            </Text>
            <View style={styles.referenceBox}>
              <Text style={styles.referenceLabel}>REFERENCE</Text>
              <Text style={styles.referenceValue}>{ticketNumber}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/dashboard')}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Back to dashboard</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.eyebrow}>WE’RE HERE TO HELP</Text>
            <Text style={styles.title}>Send a concern</Text>
            <Text style={styles.description}>
              Share a few details and we’ll point you to the right university service.
            </Text>

            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.label}>Campus email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@ustp.edu.ph"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={styles.label}>What is this about?</Text>
            <View style={styles.categories}>
              {categories.map((item) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: category === item }}
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.category, category === item && styles.categorySelected]}
                >
                  <Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Tell us a little more</Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Describe what you need help with..."
              placeholderTextColor={COLORS.placeholder}
              style={[styles.input, styles.detailsInput]}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{details.length}/1000</Text>

            {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

            <Pressable
              accessibilityRole="button"
              onPress={submit}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Submit concern  →</Text>
            </Pressable>
            <Text style={styles.demoNote}>Prototype only · Your details stay on this screen and are not sent.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const COLORS = {
  navy: '#123553',
  blue: '#1E6484',
  ink: '#172B3A',
  muted: '#768795',
  line: '#E4EAF0',
  canvas: '#F4F6F9',
  white: '#FFFFFF',
  placeholder: '#8996A4',
  gold: '#E6B95F',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.canvas },
  header: { minHeight: 70, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.navy },
  backButton: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 13 },
  backArrow: { color: COLORS.white, fontSize: 29, lineHeight: 32, marginTop: -3 },
  headerTitle: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  headerSubtitle: { color: '#C4D2DC', fontSize: 10, marginTop: 3 },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },
  formCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 22 },
  eyebrow: { color: COLORS.blue, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginBottom: 7 },
  title: { color: COLORS.ink, fontSize: 25, fontWeight: '800' },
  description: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 21 },
  label: { color: COLORS.ink, fontSize: 11, fontWeight: '800', marginBottom: 7, marginTop: 12 },
  input: { minHeight: 44, borderWidth: 1, borderColor: COLORS.line, borderRadius: 11, backgroundColor: '#FAFBFD', paddingHorizontal: 12, paddingVertical: 11, color: COLORS.ink, fontSize: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: COLORS.white },
  categorySelected: { backgroundColor: '#EAF2F6', borderColor: '#AFC9D6' },
  categoryText: { color: COLORS.muted, fontSize: 10, fontWeight: '600' },
  categoryTextSelected: { color: COLORS.navy, fontWeight: '800' },
  detailsInput: { minHeight: 115, lineHeight: 18 },
  characterCount: { color: COLORS.muted, textAlign: 'right', fontSize: 9, marginTop: 5 },
  error: { color: '#A72B3A', fontSize: 11, marginTop: 10 },
  primaryButton: { minHeight: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navy, borderRadius: 11, marginTop: 17 },
  primaryButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  demoNote: { color: COLORS.muted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 11 },
  successCard: { alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 19, padding: 25 },
  successMark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F6EE', marginBottom: 16 },
  successMarkText: { color: '#168052', fontSize: 24, fontWeight: '800' },
  referenceBox: { width: '100%', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: COLORS.canvas },
  referenceLabel: { color: COLORS.muted, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  referenceValue: { color: COLORS.navy, fontSize: 18, fontWeight: '900', marginTop: 4 },
  pressed: { opacity: 0.78 },
});
