import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '../global.css';
import { signOut, useSession } from '../services/auth';

export default function RootLayout() {
  const session = useSession();
  const pathname = usePathname();
  useEffect(() => {
    if (!session?.expiresAt) return;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    if (remaining <= 0) { signOut(); return; }
    const timer = setTimeout(signOut, remaining);
    return () => clearTimeout(timer);
  }, [session]);
  return (
    <>
      <Head>
        <title>TRAIL AI Desk | USTP</title>
        <meta name="description" content="Your USTP university information companion. Be certain. Choose TRAIL." />
      </Head>
      <StatusBar style={['/dashboard', '/ai-desk'].includes(pathname) ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="ai-desk" />
          <Stack.Screen name="information" />
          <Stack.Screen name="ticket" />
          <Stack.Screen name="explore" />
        </Stack.Protected>
        <Stack.Protected guard={session?.user.role === 'admin' && !session.demo}>
          <Stack.Screen name="admin" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
