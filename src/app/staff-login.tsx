
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LoginLayout } from '../components/login-layout';
import { Brand } from '../constants/brand';
import {
  hasConfiguredApi,
  signIn,
  useSession,
  validEmail,
} from '../services/auth';

export default function StaffLoginScreen() {
  const session = useSession();
  const passwordInput = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'knowledge_manager'>('admin');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;

    if (!validEmail(email)) {
      setError('Enter a valid institutional email address.');
      return;
    }

    if (!password) {
      setError('Enter your password to continue.');
      passwordInput.current?.focus();
      return;
    }

    if (!hasConfiguredApi) {
      setError(
        'Staff authentication is unavailable. Check the API configuration.'
      );
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email, password, {
        requiredRole: selectedRole,
      });

      // Remove the password from the form after successful login.
      setPassword('');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Each backend-confirmed staff role enters only its own protected workspace.
  if (session?.user.role === 'admin' && !session.demo) {
    return <Redirect href="/admin-dashboard" />;
  }

  if (session?.user.role === 'knowledge_manager' && !session.demo) {
    return session.user.mustChangePassword
      ? <Redirect href="/change-initial-password" />
      : <Redirect href="/kb-manager-dashboard" />;
  }

  // Existing student sessions remain in the student workspace.
  if (session) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <LoginLayout
      portalLabel="STAFF PORTAL"
      title="Admin & Knowledge-Base Manager Login"
      description="Access for authorized university staff."
      preFormFields={(
        <View style={styles.roleField}>
          <Text nativeID="staff-login-role-label" style={styles.label}>Login as</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Login as"
            accessibilityHint="Choose Admin or Knowledge-Base Manager"
            accessibilityState={{ expanded: roleMenuOpen, disabled: loading }}
            disabled={loading}
            onPress={() => setRoleMenuOpen((open) => !open)}
            style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
          >
            <Text style={styles.selectorText}>
              {selectedRole === 'admin' ? 'Admin' : 'Knowledge-Base Manager'}
            </Text>
            <Text aria-hidden style={styles.chevron}>{roleMenuOpen ? '▲' : '▼'}</Text>
          </Pressable>
          {roleMenuOpen && (
            <View accessibilityRole="radiogroup" style={styles.roleMenu}>
              {([
                ['admin', 'Admin'],
                ['knowledge_manager', 'Knowledge-Base Manager'],
              ] as const).map(([value, label]) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedRole === value }}
                  onPress={() => {
                    setSelectedRole(value);
                    setRoleMenuOpen(false);
                    setError('');
                  }}
                  style={({ pressed }) => [
                    styles.roleOption,
                    selectedRole === value && styles.roleOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.roleOptionText, selectedRole === value && styles.roleOptionTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}
      email={email}
      password={password}
      onEmailChange={(value) => {
        setEmail(value);
        setError('');
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        setError('');
      }}
      onSubmit={handleSignIn}
      submitLabel="Sign in"
      loading={loading}
      error={error}
      statusMessage={
        hasConfiguredApi
          ? undefined
          : 'Staff authentication requires a configured backend connection.'
      }
      onForgotPassword={() => router.push('/forgot-password')}
      alternatePrompt="Are you a student?"
      alternateAction="Sign in here"
      alternateAccessibilityLabel="Are you a student? Sign in here"
      onAlternatePress={() => router.replace('/')}
      passwordInputRef={passwordInput}
      inputIdPrefix="staff-login"
      footerText="Clear information. Confident next steps."
    />
  );
}

const styles = StyleSheet.create({
  roleField: { marginBottom: 16 },
  label: { color: Brand.ink, fontSize: 15, lineHeight: 22, fontWeight: '600', marginBottom: 9 },
  selector: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 15, backgroundColor: Brand.surface },
  selectorText: { color: Brand.ink, fontSize: 16, fontWeight: '600' },
  chevron: { color: Brand.blue, fontSize: 13 },
  roleMenu: { borderWidth: 1, borderColor: Brand.line, borderRadius: 10, marginTop: 6, overflow: 'hidden', backgroundColor: Brand.surface },
  roleOption: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: Brand.line },
  roleOptionSelected: { backgroundColor: Brand.pale },
  roleOptionText: { color: Brand.ink, fontSize: 15 },
  roleOptionTextSelected: { color: Brand.navy, fontWeight: '800' },
  pressed: { opacity: 0.76 },
});
