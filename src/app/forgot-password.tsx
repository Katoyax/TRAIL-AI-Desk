import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { DeskForm, FormButton, formStyles as styles } from '../components/desk-form';
import { forgotPassword, hasConfiguredApi, validEmail } from '../services/auth';

// Lets a Student request Admin assistance without revealing account eligibility.
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (loading) {
      return;
    }

    if (!validEmail(email)) {
      setError('Enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Unable to request password reset. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeskForm
      title="Forgot password?"
      description="Enter your registered email to request password reset assistance. An Admin will review eligible requests."
    >
      {message ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {message}
        </Text>
      ) : (
        <>
          <Text style={styles.label}>Registered email</Text>
          <TextInput
            accessibilityLabel="Registered email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            style={styles.input}
            placeholder="Enter your email"
            editable={!loading}
            onSubmitEditing={submit}
          />
          {!hasConfiguredApi && (
            <Text style={styles.hint}>
              Connect to the TRAIL service to submit a password reset request.
            </Text>
          )}
          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <FormButton
            label={loading ? 'Submitting request...' : 'Request Password Reset'}
            onPress={submit}
            loading={loading}
          />
        </>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/')}
      >
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </DeskForm>
  );
}
