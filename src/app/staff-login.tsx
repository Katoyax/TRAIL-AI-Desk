
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { LoginLayout } from '../components/login-layout';
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
        requiredRole: 'admin',
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

  // Admins enter the protected Admin workspace.
  if (session?.user.role === 'admin' && !session.demo) {
    return <Redirect href="/admin-dashboard" />;
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
