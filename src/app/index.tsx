import { Redirect, router } from 'expo-router';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator, Image, ImageBackground, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '../constants/brand';
import { authenticateDemo, hasConfiguredApi, signIn, useSession, validEmail } from '../services/auth';

const DEMO_EMAIL = 'student@ustp.edu.ph';
const DEMO_PASSWORD = 'student123';
const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

export default function LoginScreen() {
  const session = useSession();
  // Static export and initial browser hydration share the same mobile markup.
  // Apply viewport-dependent styles and content after hydration completes.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = hydrated && width >= 980;
  const passwordInput = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [demoSelected, setDemoSelected] = useState(false);
  const [showAccountHelp, setShowAccountHelp] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const fillDemoAccount = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoSelected(true);
    setError('');
  };

  const handleSignIn = async () => {
    if (loading) return;
    if (!validEmail(email)) { setError('Enter a valid email address to continue.'); return; }
    if (!password) {
      setError('Enter your password to continue.');
      passwordInput.current?.focus();
      return;
    }
    if (!demoSelected && !hasConfiguredApi) {
      setError('Account sign-in is unavailable in this preview. Choose Demo Profile to explore TRAIL.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (demoSelected) {
        if (!await authenticateDemo(email, password)) {
          setError('Demo details have changed. Choose Demo Profile again to restore them.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (session) return <Redirect href="/dashboard" />;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: hydrated ? insets.top : 0, paddingBottom: hydrated ? insets.bottom : 0 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.layout, isDesktop && styles.desktopLayout,
          { minHeight: hydrated ? Math.max(height - insets.top - insets.bottom, 0) : 0 },
        ]}>
          <View style={[styles.identityPanel, isDesktop && styles.identityPanelDesktop]}>
            <ImageBackground
              source={require('../../assets/images/USTP.jpg')}
              resizeMode="cover"
              imageStyle={{ width: '100%', height: '100%' }}
              style={[styles.campusImage, isDesktop && { minHeight: Math.max(380, height * 0.5), flex: 1 }]}
              accessibilityLabel="USTP Cagayan de Oro campus"
              accessibilityRole="image"
            >
              <View style={[styles.brandPlate, isDesktop && styles.brandPlateDesktop]}>
                <Image
                  source={require('../../assets/images/ustp-logo.jpg')}
                  resizeMode="contain"
                  style={styles.logo}
                  accessibilityLabel="University of Science and Technology of Southern Philippines logo"
                />
                <View style={styles.brandPlateCopy}>
                  <Text style={styles.brandName}>TRAIL AI Desk</Text>
                  <Text style={styles.brandDescriptor}>Your university information companion</Text>
                </View>
              </View>
            </ImageBackground>

            <View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
              <View style={styles.goldRule} />
              <Text style={styles.heroEyebrow}>BUILT FOR THE USTP COMMUNITY</Text>
              <Text accessibilityRole="header" style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                Be certain.{"\n"}<Text style={styles.heroTitleAccent}>Choose TRAIL.</Text>
              </Text>
              <Text style={styles.heroDescription}>
                Find university information, explore services, and get guidance for your next step. All in one conversation.
              </Text>
              {isDesktop && <Text style={styles.universityName}>
                University of Science and Technology{"\n"}of Southern Philippines
              </Text>}
            </View>
          </View>

          <View style={[styles.authPanel, isDesktop && styles.authPanelDesktop]}>
            <View style={styles.form}>
              <View style={styles.portalLabel}>
                <View style={styles.portalMark} />
                <Text style={styles.portalLabelText}>STUDENT PORTAL</Text>
              </View>
              <Text accessibilityRole="header" style={styles.formTitle}>Welcome to TRAIL</Text>
              <Text style={styles.formDescription}>A little clarity for your university journey. Sign in to get started.</Text>

              <Text nativeID="login-email-label" style={styles.label}>Email address</Text>
              <View style={[styles.inputShell, focusedField === 'email' && styles.inputFocused]}>
                <TextInput
                  value={email}
                  onChangeText={(value) => { setEmail(value); setError(''); setDemoSelected(false); }}
                  placeholder="you@ustp.edu.ph"
                  placeholderTextColor={Brand.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  style={styles.input}
                  accessibilityLabel="Email address"
                  accessibilityLabelledBy="login-email-label"
                />
              </View>

              <View style={styles.passwordHeading}>
                <Text nativeID="login-password-label" style={styles.passwordLabel}>Password</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/forgot-password')}
                  style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
                >
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>
              </View>
              <View style={[styles.inputShell, focusedField === 'password' && styles.inputFocused]}>
                <TextInput
                  ref={passwordInput}
                  value={password}
                  onChangeText={(value) => { setPassword(value); setError(''); setDemoSelected(false); }}
                  placeholder="Enter your password"
                  placeholderTextColor={Brand.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  style={styles.input}
                  accessibilityLabel="Password"
                  accessibilityLabelledBy="login-password-label"
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={({ pressed }) => [styles.passwordToggle, pressed && styles.pressed]}
                >
                  <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>

              {error !== '' && (
                <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              {demoSelected && <Text accessibilityLiveRegion="polite" style={styles.demoSelectedHint}>
                Demo Profile selected. Continue with the sample student account below.
              </Text>}
              {!hasConfiguredApi && !demoSelected && <Text style={styles.previewHint}>
                Preview mode: use Demo Profile below to explore the student workspace.
              </Text>}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: loading, busy: loading }}
                disabled={loading}
                onPress={handleSignIn}
                style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed, loading && styles.disabledButton]}
              >
                {loading && <ActivityIndicator size="small" color={Brand.surface} />}
                <Text style={styles.signInText}>{loading ? 'Signing in…' : demoSelected ? 'Open demo workspace' : 'Sign in'}</Text>
                {!loading && <Text aria-hidden style={styles.signInArrow}>→</Text>}
              </Pressable>

              <View style={styles.accountRow}>
                <Text style={styles.accountPrompt}>New to TRAIL?</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showAccountHelp }}
                  onPress={() => setShowAccountHelp((visible) => !visible)}
                  style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
                >
                  <Text style={styles.link}>Create account</Text>
                </Pressable>
              </View>
              {showAccountHelp && <View accessibilityLiveRegion="polite" style={styles.accountHelp}>
                <Text style={styles.accountHelpTitle}>Need a student account?</Text>
                <Text style={styles.accountHelpText}>
                  Student accounts are provisioned by a university administrator. Self-registration is not available in this version. Contact your university administrator to request access.
                </Text>
              </View>}

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>TAKE A LOOK AROUND</Text>
                <View style={styles.dividerLine} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Use Demo Profile to fill sample sign-in details"
                accessibilityState={{ selected: demoSelected, disabled: loading }}
                disabled={loading}
                onPress={fillDemoAccount}
                style={({ pressed }) => [styles.demoProfile, demoSelected && styles.demoProfileSelected, pressed && styles.pressed]}
              >
                <View aria-hidden style={styles.demoAvatar}><Text style={styles.demoAvatarText}>T</Text></View>
                <View style={styles.demoCopy}>
                  <Text style={styles.demoTitle}>Demo Profile</Text>
                  <Text style={styles.demoDescription}>Preview the student workspace</Text>
                </View>
                <Text style={styles.demoAction}>{demoSelected ? 'Selected' : 'Try demo'}</Text>
              </Pressable>
              <Text style={styles.footerText}>Clear information. Confident next steps.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.navy },
  scrollContent: { flexGrow: 1 },
  layout: { flex: 1, backgroundColor: Brand.surface },
  desktopLayout: { flexDirection: 'row' },
  identityPanel: { backgroundColor: Brand.navy },
  identityPanelDesktop: { width: '48%' },
  campusImage: { minHeight: 250, padding: 20, justifyContent: 'flex-start' },
  brandPlate: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: 'rgba(255,255,255,0.97)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 12 },
  brandPlateDesktop: { margin: 12 },
  logo: { width: 48, height: 54 },
  brandPlateCopy: { flexShrink: 1 },
  brandName: { color: Brand.navy, fontWeight: '800', fontSize: 19, lineHeight: 26 },
  brandDescriptor: { color: Brand.muted, fontSize: 14, lineHeight: 20, maxWidth: 250 },
  heroCopy: { padding: 26, paddingBottom: 30 },
  heroCopyDesktop: { paddingHorizontal: 44, paddingVertical: 38 },
  goldRule: { width: 42, height: 4, borderRadius: 2, backgroundColor: Brand.gold, marginBottom: 20 },
  heroEyebrow: { color: Brand.onNavy, fontSize: 14, lineHeight: 21, letterSpacing: 1.1, fontWeight: '600', marginBottom: 12 },
  heroTitle: { color: Brand.surface, fontSize: 36, lineHeight: 43, fontWeight: '800', letterSpacing: -0.8 },
  heroTitleDesktop: { fontSize: 48, lineHeight: 56, letterSpacing: -1.4 },
  heroTitleAccent: { color: Brand.gold },
  heroDescription: { color: Brand.onNavy, fontSize: 16, lineHeight: 26, marginTop: 18, maxWidth: 440 },
  universityName: { color: Brand.onNavy, fontSize: 14, lineHeight: 22, marginTop: 30 },
  authPanel: { paddingHorizontal: 24, paddingVertical: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: Brand.surface },
  authPanelDesktop: { width: '52%', paddingHorizontal: 48, paddingVertical: 46 },
  form: { width: '100%', maxWidth: 440 },
  portalLabel: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  portalMark: { width: 7, height: 18, backgroundColor: Brand.gold, borderRadius: 2 },
  portalLabelText: { fontSize: 14, lineHeight: 20, letterSpacing: 1.5, fontWeight: '700', color: Brand.muted },
  formTitle: { color: Brand.navy, fontWeight: '800', fontSize: 32, lineHeight: 40, letterSpacing: -0.7 },
  formDescription: { color: Brand.muted, fontSize: 16, lineHeight: 25, marginTop: 10, marginBottom: 30 },
  label: { color: Brand.ink, fontSize: 15, lineHeight: 22, fontWeight: '600', marginBottom: 9 },
  inputShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, backgroundColor: Brand.surface, marginBottom: 12 },
  inputFocused: { borderColor: Brand.blue, borderWidth: 2 },
  input: { flex: 1, minWidth: 0, minHeight: 52, paddingHorizontal: 15, paddingVertical: 12, color: Brand.ink, fontSize: 16 },
  passwordHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  passwordLabel: { color: Brand.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  textButton: { minHeight: 44, paddingHorizontal: 2, justifyContent: 'center' },
  link: { color: Brand.blue, fontSize: 14, lineHeight: 22, fontWeight: '700', textDecorationLine: 'underline' },
  passwordToggle: { minWidth: 64, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  passwordToggleText: { color: Brand.blue, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  previewHint: { color: Brand.muted, fontSize: 14, lineHeight: 21, marginTop: 2, marginBottom: 16 },
  demoSelectedHint: { color: Brand.blue, fontSize: 14, lineHeight: 21, marginTop: 2, marginBottom: 16 },
  errorBox: { backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: Brand.error, borderRadius: 8, padding: 12, marginBottom: 14 },
  errorText: { color: Brand.error, fontSize: 14, lineHeight: 22 },
  signInButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Brand.navy, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, marginTop: 4 },
  signInText: { color: Brand.surface, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  signInArrow: { color: Brand.surface, fontSize: 22, lineHeight: 26 },
  disabledButton: { backgroundColor: Brand.disabled },
  accountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10 },
  accountPrompt: { color: Brand.muted, fontSize: 14, lineHeight: 22 },
  accountHelp: { backgroundColor: Brand.pale, borderWidth: 1, borderColor: Brand.line, borderRadius: 10, padding: 16, marginTop: 6 },
  accountHelpTitle: { color: Brand.navy, fontSize: 15, lineHeight: 22, fontWeight: '700', marginBottom: 6 },
  accountHelpText: { color: Brand.muted, fontSize: 14, lineHeight: 22 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 20 },
  dividerLine: { height: 1, flex: 1, backgroundColor: Brand.line },
  dividerText: { color: Brand.muted, fontSize: 14, lineHeight: 20, letterSpacing: 0.4, fontWeight: '500' },
  demoProfile: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Brand.canvas, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 12, padding: 14 },
  demoProfileSelected: { backgroundColor: Brand.pale, borderColor: Brand.blue, borderWidth: 2 },
  demoAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: Brand.goldPale, alignItems: 'center', justifyContent: 'center' },
  demoAvatarText: { color: Brand.navy, fontSize: 18, lineHeight: 24, fontWeight: '800' },
  demoCopy: { flex: 1, minWidth: 0 },
  demoTitle: { color: Brand.navy, fontSize: 15, lineHeight: 22, fontWeight: '700' },
  demoDescription: { color: Brand.muted, fontSize: 14, lineHeight: 21, marginTop: 2 },
  demoAction: { color: Brand.blue, fontSize: 14, lineHeight: 21, fontWeight: '700', maxWidth: 70 },
  footerText: { color: Brand.muted, textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 25 },
  pressed: { opacity: 0.76 },
  buttonPressed: { backgroundColor: Brand.blue },
});
