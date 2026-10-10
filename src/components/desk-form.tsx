import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function DeskForm({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <KeyboardAvoidingView style={formStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={formStyles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to login" onPress={() => router.replace('/')} style={formStyles.back}><Text style={formStyles.backText}>‹</Text></Pressable><Text style={formStyles.headerText}>TRAIL AI Desk</Text></View>
    <ScrollView contentContainerStyle={formStyles.page} keyboardShouldPersistTaps="handled"><View style={formStyles.card}><Text style={formStyles.eyebrow}>ACCOUNT ACCESS</Text><Text style={formStyles.title}>{title}</Text><Text style={formStyles.description}>{description}</Text>{children}</View></ScrollView>
  </KeyboardAvoidingView>;
}

export function FormButton({ label, onPress, loading, disabled }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [formStyles.button, (pressed || disabled || loading) && formStyles.dim]}>{loading && <ActivityIndicator color="#FFF" size="small" />}<Text style={formStyles.buttonText}>{label}</Text></Pressable>;
}

export const formStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6F9' },
  header: { minHeight: 72, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', backgroundColor: '#123553' },
  back: { width: 38, height: 38, borderRadius: 12, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  backText: { color: '#FFF', fontSize: 27 }, headerText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  page: { width: '100%', maxWidth: 580, alignSelf: 'center', padding: 22, paddingTop: 36 },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E4EAF0', borderRadius: 19, padding: 22 },
  eyebrow: { color: '#1E6484', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 9 },
  title: { color: '#172B3A', fontSize: 25, fontWeight: '800' }, description: { color: '#768795', fontSize: 12, lineHeight: 19, marginTop: 8, marginBottom: 20 },
  label: { color: '#172B3A', fontSize: 12, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  input: { minHeight: 46, borderWidth: 1, borderColor: '#DCE4EA', borderRadius: 11, padding: 12, fontSize: 13, color: '#172B3A', backgroundColor: '#FAFBFD' },
  hint: { color: '#768795', fontSize: 11, lineHeight: 17, marginTop: 10 },
  error: { color: '#A72B3A', fontSize: 12, lineHeight: 18, marginTop: 14 },
  success: { color: '#16734C', fontSize: 13, lineHeight: 20, padding: 14, backgroundColor: '#E6F6EE', borderRadius: 11, marginBottom: 12 },
  button: { minHeight: 46, backgroundColor: '#123553', borderRadius: 11, marginTop: 20, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '800' }, dim: { opacity: 0.6 },
  link: { color: '#1E6484', fontSize: 12, fontWeight: '700', paddingVertical: 15, textAlign: 'center' },
});
