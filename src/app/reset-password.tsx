import { router, useLocalSearchParams } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { DeskForm, FormButton, formStyles as styles } from '../components/desk-form';
import { resetPassword } from '../services/auth';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function ResetPasswordScreen() {
  // Static exports have no query token. Keep hydration markup identical before
  // choosing the form from the actual reset link on the client.
  const hasHydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const params = useLocalSearchParams<{ token?: string }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const usableToken = Boolean(token && token.length <= 512);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (loading || !token || !usableToken) return;
    if (password.length < 12 || password.length > 128) { setError('Use a password between 12 and 128 characters.'); return; }
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    setLoading(true); setError('');
    try { const result = await resetPassword(token, password, confirmation); setPassword(''); setConfirmation(''); setMessage(result.message); router.setParams({ token: '' }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to reset password. Request a fresh link and try again.'); }
    finally { setLoading(false); }
  };
  return <DeskForm title="Reset password" description="Choose a new password for your TRAIL account. Each reset link expires and can be used once.">
    {!hasHydrated ? <Text style={styles.hint}>Loading reset link…</Text> : message ? <><Text accessibilityRole="alert" style={styles.success}>{message}</Text><FormButton label="Return to sign in" onPress={() => router.replace('/')} /></> : !usableToken ? <><Text accessibilityRole="alert" style={styles.error}>This reset link is missing or invalid. Request a new link.</Text><FormButton label="Request a new reset link" onPress={() => router.replace('/forgot-password')} /></> : <>
      <Text style={styles.label}>New password</Text><TextInput accessibilityLabel="New password" value={password} onChangeText={(value) => { setPassword(value); setError(''); }} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" maxLength={128} editable={!loading} style={styles.input} />
      <Text style={styles.hint}>Use 12–128 characters. A long, unique passphrase is a good choice.</Text>
      <Text style={styles.label}>Confirm password</Text><TextInput accessibilityLabel="Confirm password" value={confirmation} onChangeText={(value) => { setConfirmation(value); setError(''); }} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="new-password" maxLength={128} editable={!loading} style={styles.input} onSubmitEditing={submit} />
      {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<FormButton label={loading ? 'Resetting password…' : 'Reset password'} onPress={submit} loading={loading} />
      <Pressable accessibilityRole="button" onPress={() => router.replace('/forgot-password')}><Text style={styles.link}>Request a new reset link</Text></Pressable>
    </>}
  </DeskForm>;
}
