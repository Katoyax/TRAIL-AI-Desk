import { router } from 'expo-router';
import { useState } from 'react';
import { authenticateDemo, hasConfiguredApi, signIn, validEmail } from '../services/auth';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const DEMO_EMAIL = 'student@ustp.edu.ph';
const DEMO_PASSWORD = 'student123';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(!hasConfiguredApi);
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const fillDemoAccount = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoMode(true);
    setError('');
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (!validEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSigningIn(true);
    setError('');
    try {
      if (demoMode) {
        if (!(await authenticateDemo(email, password))) {
          setError('That demo email or password is incorrect. Tap Demo Profile to fill the sample credentials.');
          return;
        }
      } else {
        await signIn(email, password);
      }
      router.replace('/dashboard');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.dotField, Platform.OS === 'web' && styles.webHidden]}>
        {Array.from({ length: 220 }, (_, index) => (
          <View key={index} style={styles.dot} />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === 'web' && styles.scrollContentWeb,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.loginFrame,
            Platform.OS === 'web' && styles.loginFrameWeb,
          ]}>
            <View style={[styles.frameHeader, Platform.OS === 'web' && styles.webHidden]}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.headerGlyph}><Text style={styles.headerGlyphText}>✦</Text></View>
                <Text style={styles.frameTitle}>Login</Text>
                <Text style={styles.frameDivider}>–</Text>
                <Text style={styles.frameProduct}>Trailblazer AI</Text>
              </View>
              <Text style={styles.headerCampus}>USTP</Text>
            </View>

            <View style={[styles.card, Platform.OS === 'web' && styles.cardWeb]}>
              <ImageBackground
                source={require('../../assets/images/USTP.jpg')}
                resizeMode="cover"
                style={[
                  styles.campusBanner,
                  Platform.OS === 'web' && styles.campusBannerWeb,
                ]}
                imageStyle={styles.bannerImage}
              >
                <View style={styles.bannerShade} />
                <View style={styles.bannerPills}>
                  <View style={styles.bannerPill}>
                    <Text style={styles.pillDot}>●</Text>
                    <Text style={styles.pillText}>USTP Cagayan de Oro</Text>
                  </View>
                  <View style={[styles.bannerPill, styles.portalPill]}>
                    <Text style={styles.pillDot}>●</Text>
                    <Text style={styles.pillText}>Trailblazer Portal</Text>
                  </View>
                </View>
                <View style={styles.campusCaption}>
                  <Text style={styles.campusCaptionText}>UNIVERSITY OF SCIENCE AND TECHNOLOGY OF SOUTHERN PHILIPPINES</Text>
                </View>
              </ImageBackground>

              <View style={[styles.formContent, Platform.OS === 'web' && styles.formContentWeb]}>
                <View style={[styles.identity, Platform.OS === 'web' && styles.identityWeb]}>
                  <View style={styles.logoTile}>
                    <Image
                      source={require('../../assets/images/ustp-logo.jpg')}
                      resizeMode="contain"
                      style={styles.logo}
                      accessibilityLabel="USTP logo"
                    />
                    <View style={styles.aiStatus}><Text style={styles.aiStatusText}>AI 2.4</Text></View>
                  </View>
                  <Text style={styles.appTitle}>Trailblazer AI</Text>
                  <Text style={styles.appSubtitle}>YOPAK NAK OKS SA USTP</Text>
                </View>

                <View style={[styles.formCard, Platform.OS === 'web' && styles.formCardWeb]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={fillDemoAccount}
                  style={({ pressed }) => [styles.demoProfile, pressed && styles.pressed]}
                >
                  <View style={styles.demoSpark}><Text style={styles.demoSparkText}>✦</Text></View>
                  <View style={styles.demoCopy}>
                    <Text style={styles.demoTitle}>Demo Profile</Text>
                    <Text style={styles.demoName}>Demo student · Sample access only</Text>
                  </View>
                  <View style={styles.fillPill}><Text style={styles.fillPillText}>1-Click Fill</Text></View>
                </Pressable>

                <View style={styles.fieldHeading}>
                  <Text style={styles.label}>Account email</Text>
                  <Text style={styles.fieldExample}>{demoMode ? 'DEMO ACCOUNT' : 'REGISTERED ACCOUNT'}</Text>
                </View>
                <View style={styles.inputShell}>
                  <Text style={styles.inputIcon}>▣</Text>
                  <TextInput
                    value={email}
                    onChangeText={(value) => { setEmail(value); setError(''); }}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#8B98A8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    style={styles.input}
                    accessibilityLabel="Account email"
                  />
                </View>

                <View style={styles.fieldHeading}>
                  <Text style={styles.label}>Password</Text>
                  <Pressable accessibilityRole="button" onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                </View>
                <View style={styles.inputShell}>
                  <Text style={styles.inputIcon}>▣</Text>
                  <TextInput
                    value={password}
                    onChangeText={(value) => { setPassword(value); setError(''); }}
                    placeholder="Enter your TRAIL account password"
                    placeholderTextColor="#8B98A8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="go"
                    onSubmitEditing={handleSignIn}
                    style={styles.input}
                    accessibilityLabel="TRAIL account password"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword((visible) => !visible)}
                    hitSlop={8}
                  >
                    <Text style={styles.visibilityIcon}>{showPassword ? '◉' : '◎'}</Text>
                  </Pressable>
                </View>

                <View style={styles.optionsRow}>
                  <Text style={styles.rememberText}>Session lasts until the app closes</Text>
                  <View style={styles.encryptedTag}>
                    <Text style={styles.encryptedIcon}>◆</Text>
                    <Text style={styles.encryptedText}>{demoMode ? 'Demo' : 'Account'}</Text>
                  </View>
                </View>

                {error !== '' && (
                  <View accessibilityRole="alert" style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: signingIn }}
                  disabled={signingIn}
                  onPress={handleSignIn}
                  style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.signInText}>{signingIn ? 'Signing in…' : 'Sign In'}</Text>
                  <Text style={styles.signInArrow}>→</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>
                {hasConfiguredApi && demoMode && <Pressable accessibilityRole="button" onPress={() => { setDemoMode(false); setEmail(''); setPassword(''); setError(''); }}><Text style={styles.forgotText}>Use my registered account</Text></Pressable>}
                <Text style={styles.demoHint}>{demoMode ? 'DEMO / UNVERIFIED · Sample records only' : 'Sign in with an authorized TRAIL account'}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const COLORS = {
  backdrop: '#111820',
  navy: '#1B2E50',
  violet: '#7567F8',
  ink: '#102342',
  muted: '#627187',
  line: '#E1E7F0',
  pale: '#F0F4FC',
  green: '#37C98A',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backdrop },
  dotField: { ...StyleSheet.absoluteFill, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', paddingHorizontal: 1, paddingTop: 2, opacity: 0.42 },
  dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#83909E', marginHorizontal: 8, marginVertical: 7 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 20 },
  loginFrame: { width: '100%', maxWidth: 440, borderWidth: 2, borderColor: COLORS.violet, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F8FAFE', shadowColor: '#000', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.3, shadowRadius: 26, elevation: 12 },
  frameHeader: { minHeight: 43, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#171D27' },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  headerGlyph: { width: 21, height: 21, borderRadius: 6, borderWidth: 1, borderColor: '#C3CBD4', alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  headerGlyphText: { color: '#E2E7ED', fontSize: 13 },
  frameTitle: { color: '#F7F8FA', fontSize: 13, fontWeight: '700' },
  frameDivider: { color: '#7D8996', marginHorizontal: 6, fontSize: 12 },
  frameProduct: { color: '#C9D0D8', fontSize: 12 },
  headerCampus: { color: '#ADB7C4', fontSize: 9, letterSpacing: 1.4, fontWeight: '800' },
  card: { backgroundColor: '#F7F9FD' },
  campusBanner: { height: 139, justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10 },
  bannerImage: { opacity: 0.98 },
  bannerShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 21, 38, 0.28)' },
  bannerPills: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  bannerPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(18, 34, 54, 0.86)', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5 },
  portalPill: { backgroundColor: 'rgba(247, 249, 253, 0.94)' },
  pillDot: { fontSize: 7, color: COLORS.green },
  pillText: { color: '#F7FAFC', fontSize: 9, fontWeight: '700' },
  campusCaption: { alignSelf: 'flex-start', backgroundColor: 'rgba(12, 28, 45, 0.68)', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4 },
  campusCaptionText: { color: '#F2F5F8', fontSize: 6, letterSpacing: 0.5, fontWeight: '700' },
  formContent: { paddingHorizontal: 18, paddingBottom: 18 },
  identity: { alignItems: 'center', marginTop: -32, marginBottom: 14 },
  logoTile: { width: 62, height: 62, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5EAF2', shadowColor: '#102342', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 9, elevation: 4 },
  logo: { width: 43, height: 43, borderRadius: 10 },
  aiStatus: { position: 'absolute', right: -4, bottom: -5, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#BDF4DB' },
  aiStatusText: { fontSize: 7, color: '#08734A', fontWeight: '900' },
  appTitle: { color: COLORS.ink, fontSize: 20, lineHeight: 25, fontWeight: '800', marginTop: 9 },
  appSubtitle: { color: '#526782', fontSize: 9, letterSpacing: 0.4, marginTop: 1 },
  demoProfile: { minHeight: 49, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF3FC', borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E4EAF5' },
  demoSpark: { width: 25, height: 25, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  demoSparkText: { color: '#23A986', fontSize: 14 },
  demoCopy: { flex: 1 },
  demoTitle: { color: COLORS.ink, fontSize: 9, fontWeight: '800' },
  demoName: { color: '#65758B', fontSize: 8, marginTop: 2 },
  fillPill: { backgroundColor: COLORS.white, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  fillPillText: { color: COLORS.navy, fontSize: 8, fontWeight: '800' },
  fieldHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: COLORS.ink, fontSize: 9, fontWeight: '800' },
  fieldExample: { color: '#76849A', fontSize: 8 },
  forgotText: { color: COLORS.navy, fontSize: 8, fontWeight: '700' },
  inputShell: { height: 39, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 10, backgroundColor: COLORS.white, marginBottom: 13 },
  inputIcon: { color: '#526A88', fontSize: 12, marginRight: 8 },
  input: { flex: 1, minWidth: 0, height: '100%', paddingVertical: 0, color: COLORS.ink, fontSize: 10 },
  visibilityIcon: { color: '#687991', fontSize: 16, paddingLeft: 8 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -2, marginBottom: 14 },
  rememberOption: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 12, height: 12, borderRadius: 3, borderWidth: 1, borderColor: '#8795A8', alignItems: 'center', justifyContent: 'center', marginRight: 6, backgroundColor: COLORS.white },
  checkboxChecked: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  checkmark: { color: COLORS.white, fontSize: 9, lineHeight: 11, fontWeight: '900' },
  rememberText: { color: '#54647B', fontSize: 8 },
  encryptedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  encryptedIcon: { color: '#20A879', fontSize: 8 },
  encryptedText: { color: '#28896D', fontSize: 8, fontWeight: '700' },
  errorBox: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#F1CCCC', borderRadius: 9, padding: 8, marginBottom: 10 },
  errorText: { color: '#A72B3A', fontSize: 9, lineHeight: 13 },
  signInButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.navy, borderRadius: 10, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 2 },
  signInText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  signInArrow: { color: COLORS.white, fontSize: 15, marginLeft: 8, marginTop: -1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, marginBottom: 8 },
  dividerLine: { height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: '#DDE3EC' },
  dividerText: { color: '#728096', fontSize: 7, letterSpacing: 0.6, fontWeight: '700' },
  demoHint: { color: '#8290A1', textAlign: 'center', fontSize: 8 },
  pressed: { opacity: 0.82 },
  buttonPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  webHidden: { display: 'none' },
  scrollContentWeb: { justifyContent: 'flex-start', alignItems: 'stretch', paddingHorizontal: 0, paddingVertical: 0, minHeight: '100%' },
  loginFrameWeb: { width: '100%', maxWidth: 1440, alignSelf: 'center', flex: 1, borderWidth: 0, borderRadius: 0, shadowOpacity: 0, elevation: 0, backgroundColor: '#EEF3FB' },
  cardWeb: { flex: 1, backgroundColor: '#EEF3FB' },
  campusBannerWeb: { width: '100%', minWidth: 0, alignSelf: 'stretch', height: 145, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10, backgroundColor: '#E8EEF7' },
  formContentWeb: { paddingHorizontal: 16, paddingBottom: 28, backgroundColor: '#EEF3FB' },
  identityWeb: { marginTop: -30, marginBottom: 19 },
  formCard: {},
  formCardWeb: { width: '100%', maxWidth: 1280, alignSelf: 'center', padding: 16, borderRadius: 12, backgroundColor: COLORS.white },
});
