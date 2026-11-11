import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LoginLayout } from '../components/login-layout';
import { Brand } from '../constants/brand';
import { authenticateDemo, hasConfiguredApi, signIn, useSession, validEmail } from '../services/auth';

const DEMO_EMAIL = 'student@ustp.edu.ph';
const DEMO_PASSWORD = 'student123';

export default function LoginScreen() {
  const session = useSession();
  const passwordInput = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoSelected, setDemoSelected] = useState(false);
  const [showAccountHelp, setShowAccountHelp] = useState(false);

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

  if (session) {
  return (
    <Redirect
      href={
        session.user.role === 'admin' && !session.demo
          ? '/admin-dashboard'
          : '/dashboard'
      }
    />
  );
}

  const statusMessage = demoSelected
    ? 'Demo Profile selected. Continue with the sample student account below.'
    : !hasConfiguredApi
      ? 'Preview mode: use Demo Profile below to explore the student workspace.'
      : undefined;

  return (
    <LoginLayout
      portalLabel="STUDENT PORTAL"
      title="Welcome to TRAIL"
      description="A little clarity for your university journey. Sign in to get started."
      email={email}
      password={password}
      onEmailChange={(value) => { setEmail(value); setError(''); setDemoSelected(false); }}
      onPasswordChange={(value) => { setPassword(value); setError(''); setDemoSelected(false); }}
      onSubmit={handleSignIn}
      submitLabel={demoSelected ? 'Open demo workspace' : 'Sign in'}
      loading={loading}
      error={error}
      statusMessage={statusMessage}
      statusTone={demoSelected ? 'accent' : 'muted'}
      onForgotPassword={() => router.push('/forgot-password')}
      alternatePrompt="Admin or Knowledge Manager?"
      alternateAction="Sign in here"
      alternateAccessibilityLabel="Admin or Knowledge Manager? Sign in here"
      onAlternatePress={() => router.replace('/staff-login')}
      passwordInputRef={passwordInput}
      inputIdPrefix="student-login"
      footerText="Clear information. Confident next steps."
    >
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
    </LoginLayout>
  );
}

const styles = StyleSheet.create({
  accountRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 2 },
  accountPrompt: { color: Brand.muted, fontSize: 14, lineHeight: 22 },
  textButton: { minHeight: 44, paddingHorizontal: 2, justifyContent: 'center' },
  link: { color: Brand.blue, fontSize: 14, lineHeight: 22, fontWeight: '700', textDecorationLine: 'underline' },
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
  pressed: { opacity: 0.76 },
});
