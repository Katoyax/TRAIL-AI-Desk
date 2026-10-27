import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '../constants/brand';

export function DeskForm({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={formStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[formStyles.header, { paddingTop: insets.top + 14 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to sign in" onPress={() => router.replace('/')} style={({ pressed }) => [formStyles.back, pressed && formStyles.pressed]}>
          <Text style={formStyles.backText}>‹</Text>
        </Pressable>
        <View><Text style={formStyles.headerText}>TRAIL AI Desk</Text><Text style={formStyles.headerCaption}>USTP · Student information assistant</Text></View>
      </View>
      <ScrollView contentContainerStyle={[formStyles.page, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={formStyles.card}>
          <View style={formStyles.accent} />
          <Text style={formStyles.eyebrow}>ACCOUNT ACCESS</Text>
          <Text style={formStyles.title}>{title}</Text>
          <Text style={formStyles.description}>{description}</Text>
          {children}
        </View>
        <Text style={formStyles.footer}>Be certain. Choose TRAIL.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function FormButton({ label, onPress, loading, disabled }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  const unavailable = Boolean(disabled || loading);
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: unavailable, busy: Boolean(loading) }} disabled={unavailable} onPress={onPress} style={({ pressed }) => [formStyles.button, unavailable && formStyles.buttonDisabled, pressed && formStyles.pressed]}>
      {loading && <ActivityIndicator color={Brand.surface} size="small" />}
      <Text style={formStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export const formStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Brand.navy },
  back: { width: 44, height: 44, borderRadius: 12, marginRight: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  backText: { color: Brand.surface, fontSize: 30, lineHeight: 34 },
  headerText: { color: Brand.surface, fontSize: 17, fontWeight: '800' },
  headerCaption: { color: Brand.onNavy, fontSize: 12, marginTop: 4 },
  page: { width: '100%', maxWidth: 580, alignSelf: 'center', padding: 20, paddingTop: 36 },
  card: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, borderRadius: 22, padding: 24 },
  accent: { width: 36, height: 4, borderRadius: 2, backgroundColor: Brand.gold, marginBottom: 22 },
  eyebrow: { color: Brand.blue, fontSize: 12, fontWeight: '800', letterSpacing: 1.3, marginBottom: 10 },
  title: { color: Brand.ink, fontSize: 28, lineHeight: 35, fontWeight: '800' },
  description: { color: Brand.muted, fontSize: 15, lineHeight: 23, marginTop: 10, marginBottom: 20 },
  label: { color: Brand.ink, fontSize: 14, fontWeight: '700', marginTop: 14, marginBottom: 9 },
  input: { minHeight: 52, borderWidth: 1, borderColor: Brand.inputBorder, borderRadius: 12, padding: 14, fontSize: 15, color: Brand.ink, backgroundColor: Brand.surface },
  hint: { color: Brand.muted, fontSize: 12, lineHeight: 19, marginTop: 12 },
  error: { color: Brand.error, fontSize: 14, lineHeight: 21, marginTop: 14 },
  success: { color: Brand.success, fontSize: 14, lineHeight: 22, padding: 16, backgroundColor: '#E6F6EE', borderRadius: 12, marginBottom: 12 },
  button: { minHeight: 52, backgroundColor: Brand.navy, borderRadius: 12, marginTop: 22, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: Brand.surface, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  buttonDisabled: { backgroundColor: Brand.disabled },
  pressed: { opacity: 0.85 },
  dim: { opacity: 0.7 },
  link: { minHeight: 48, color: Brand.blue, fontSize: 14, lineHeight: 22, fontWeight: '700', paddingVertical: 15, textAlign: 'center' },
  footer: { color: Brand.muted, fontSize: 12, textAlign: 'center', paddingTop: 24 },
});
