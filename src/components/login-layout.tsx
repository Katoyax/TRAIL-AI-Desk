import type { ReactNode, RefObject } from 'react';
import { useRef, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator, Image, ImageBackground, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '../constants/brand';

const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

type LoginLayoutProps = {
  portalLabel: string;
  title: string;
  description: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit?: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  loading?: boolean;
  error?: string;
  statusMessage?: string;
  statusTone?: 'accent' | 'muted';
  disabledMessage?: string;
  onForgotPassword?: () => void;
  alternatePrompt: string;
  alternateAction: string;
  alternateAccessibilityLabel: string;
  onAlternatePress: () => void;
  passwordInputRef?: RefObject<TextInput | null>;
  inputIdPrefix: string;
  footerText?: string;
  children?: ReactNode;
};

export function LoginLayout({
  portalLabel,
  title,
  description,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitLabel,
  submitDisabled = false,
  loading = false,
  error = '',
  statusMessage,
  statusTone = 'muted',
  disabledMessage,
  onForgotPassword,
  alternatePrompt,
  alternateAction,
  alternateAccessibilityLabel,
  onAlternatePress,
  passwordInputRef,
  inputIdPrefix,
  footerText,
  children,
}: LoginLayoutProps) {
  const hydrated = useSyncExternalStore(subscribeToHydration, clientHydrationSnapshot, serverHydrationSnapshot);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = hydrated && width >= 980;
  const fallbackPasswordInput = useRef<TextInput>(null);
  const resolvedPasswordInput = passwordInputRef ?? fallbackPasswordInput;
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const buttonDisabled = loading || submitDisabled;
  const emailLabelId = `${inputIdPrefix}-email-label`;
  const passwordLabelId = `${inputIdPrefix}-password-label`;

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
          styles.layout,
          isDesktop && styles.desktopLayout,
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
                <Text style={styles.portalLabelText}>{portalLabel}</Text>
              </View>
              <Text accessibilityRole="header" style={styles.formTitle}>{title}</Text>
              <Text style={styles.formDescription}>{description}</Text>

              <Text nativeID={emailLabelId} style={styles.label}>Email address</Text>
              <View style={[styles.inputShell, focusedField === 'email' && styles.inputFocused]}>
                <TextInput
                  value={email}
                  onChangeText={onEmailChange}
                  placeholder="you@ustp.edu.ph"
                  placeholderTextColor={Brand.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => resolvedPasswordInput.current?.focus()}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  style={styles.input}
                  accessibilityLabel="Email address"
                  accessibilityLabelledBy={emailLabelId}
                />
              </View>

              <View style={styles.passwordHeading}>
                <Text nativeID={passwordLabelId} style={styles.passwordLabel}>Password</Text>
                {onForgotPassword && <Pressable
                  accessibilityRole="button"
                  onPress={onForgotPassword}
                  style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
                >
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>}
              </View>
              <View style={[styles.inputShell, focusedField === 'password' && styles.inputFocused]}>
                <TextInput
                  ref={resolvedPasswordInput}
                  value={password}
                  onChangeText={onPasswordChange}
                  placeholder="Enter your password"
                  placeholderTextColor={Brand.muted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  returnKeyType={submitDisabled ? 'done' : 'go'}
                  onSubmitEditing={submitDisabled ? undefined : onSubmit}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  editable={!loading}
                  style={styles.input}
                  accessibilityLabel="Password"
                  accessibilityLabelledBy={passwordLabelId}
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
              {statusMessage && <Text accessibilityLiveRegion="polite" style={statusTone === 'accent' ? styles.statusAccent : styles.statusMuted}>
                {statusMessage}
              </Text>}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: buttonDisabled, busy: loading }}
                disabled={buttonDisabled}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && !buttonDisabled && styles.buttonPressed,
                  buttonDisabled && styles.disabledButton,
                ]}
              >
                {loading && <ActivityIndicator size="small" color={Brand.surface} />}
                <Text style={styles.signInText}>{loading ? 'Signing in…' : submitLabel}</Text>
                {!buttonDisabled && <Text aria-hidden style={styles.signInArrow}>→</Text>}
              </Pressable>

              {disabledMessage && <Text style={styles.integrationNotice}>{disabledMessage}</Text>}

              <Pressable
                accessibilityRole="link"
                accessibilityLabel={alternateAccessibilityLabel}
                onPress={onAlternatePress}
                style={({ pressed }) => [styles.alternateLink, pressed && styles.pressed]}
              >
                <Text style={styles.alternateText}>
                  {alternatePrompt}{' '}<Text style={styles.link}>{alternateAction}</Text>
                </Text>
              </Pressable>

              {children}
              {footerText && <Text style={styles.footerText}>{footerText}</Text>}
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
  statusMuted: { color: Brand.muted, fontSize: 14, lineHeight: 21, marginTop: 2, marginBottom: 16 },
  statusAccent: { color: Brand.blue, fontSize: 14, lineHeight: 21, marginTop: 2, marginBottom: 16 },
  errorBox: { backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: Brand.error, borderRadius: 8, padding: 12, marginBottom: 14 },
  errorText: { color: Brand.error, fontSize: 14, lineHeight: 22 },
  signInButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Brand.navy, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13, marginTop: 4 },
  signInText: { color: Brand.surface, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  signInArrow: { color: Brand.surface, fontSize: 22, lineHeight: 26 },
  disabledButton: { backgroundColor: Brand.disabled },
  integrationNotice: { color: Brand.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  alternateLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, marginTop: 8 },
  alternateText: { color: Brand.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  footerText: { color: Brand.muted, textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 25 },
  pressed: { opacity: 0.76 },
  buttonPressed: { backgroundColor: Brand.blue },
});
