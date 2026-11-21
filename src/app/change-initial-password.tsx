import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LoginLayout } from '../components/login-layout';
import { Brand } from '../constants/brand';
import { changeInitialPassword, signOut, useSession } from '../services/auth';

// Requires a newly provisioned Student or manager to replace the temporary password before protected use.
export default function ChangeInitialPasswordScreen() {
  const session = useSession();
  const temporaryPasswordInput = useRef<TextInput>(null);
  const newPasswordInput = useRef<TextInput>(null);
  const confirmPasswordInput = useRef<TextInput>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPasswords, setShowNewPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const signInPath = session?.user.role === 'knowledge_manager' ? '/staff-login' : '/';

  const handleChangePassword = async () => {
    if (loading) return;
    if (!currentPassword) { setError('Enter the temporary password used to sign in.'); return; }
    if (password.length < 12 || password.length > 128) { setError('Use a new password between 12 and 128 characters.'); return; }
    if (password === currentPassword) { setError('Choose a new password that differs from the temporary password.'); return; }
    if (confirmPassword !== password) { setError('The new passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await changeInitialPassword(currentPassword, password, confirmPassword);
      router.replace(signInPath);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The password could not be changed.');
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.demo ||
      !['student', 'knowledge_manager'].includes(session.user.role) ||
      !session.user.mustChangePassword) return null;

  const handleReturnToSignIn = () => {
    signOut();
    router.replace(signInPath);
  };

  return (
    <LoginLayout
      portalLabel={session.user.role === 'knowledge_manager' ? 'STAFF ACCOUNT SECURITY' : 'STUDENT ACCOUNT SECURITY'}
      title="Change your temporary password"
      description="Create a private password before opening the Student workspace. Completing this step invalidates every session created with the temporary credential."
      email={session.user.email}
      password={currentPassword}
      emailEditable={false}
      emailLabel="Registered email"
      passwordLabel="Temporary password"
      onEmailChange={() => {}}
      onPasswordChange={(value) => { setCurrentPassword(value); setError(''); }}
      onSubmit={handleChangePassword}
      onPasswordSubmitEditing={() => newPasswordInput.current?.focus()}
      submitLabel="Change password and sign in again"
      loading={loading}
      error={error}
      alternatePrompt="Need to stop?"
      alternateAction="Return to sign in"
      alternateAccessibilityLabel={`Sign out and return to ${session.user.role === 'knowledge_manager' ? 'Staff' : 'Student'} Login`}
      onAlternatePress={handleReturnToSignIn}
      passwordInputRef={temporaryPasswordInput}
      inputIdPrefix="initial-password-change"
      footerText="Your new password is stored only as a secure hash."
      formFields={(
        <View>
          <Text style={styles.label}>New password</Text>
          <TextInput
            ref={newPasswordInput}
            accessibilityLabel="New password"
            value={password}
            onChangeText={(value) => { setPassword(value); setError(''); }}
            editable={!loading}
            secureTextEntry={!showNewPasswords}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            maxLength={128}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInput.current?.focus()}
            style={styles.input}
          />

          <Text style={styles.label}>Confirm new password</Text>
          <TextInput
            ref={confirmPasswordInput}
            accessibilityLabel="Confirm new password"
            value={confirmPassword}
            onChangeText={(value) => { setConfirmPassword(value); setError(''); }}
            editable={!loading}
            secureTextEntry={!showNewPasswords}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            maxLength={128}
            returnKeyType="go"
            onSubmitEditing={() => { void handleChangePassword(); }}
            style={styles.input}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showNewPasswords ? 'Hide new passwords' : 'Reveal new passwords'}
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            onPress={() => setShowNewPasswords((visible) => !visible)}
            style={styles.revealButton}
          >
            <Text style={styles.revealText}>{showNewPasswords ? 'Hide new passwords' : 'Reveal new passwords'}</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: { color: Brand.ink, fontSize: 15, lineHeight: 22, fontWeight: '600', marginBottom: 9 },
  input: { minHeight: 54, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, color: Brand.ink, backgroundColor: Brand.surface, fontSize: 16, marginBottom: 12 },
  revealButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginBottom: 4 },
  revealText: { color: Brand.blue, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
