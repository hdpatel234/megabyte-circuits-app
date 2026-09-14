import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { LogoLockup, PrimaryButton } from '@/components/AppUI';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hydrated, isAuthenticated, login } = useApp();
  const [username, setUsername] = useState('jignesh');
  const [password, setPassword] = useState('pcb2026');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (hydrated && isAuthenticated) router.replace('/(tabs)');
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || isAuthenticated) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const submit = async () => {
    setError('');
    if (!username.trim() || password.length < 4) {
      setError('Enter your username and a password with at least 4 characters.');
      return;
    }
    setLoading(true);
    const accepted = await login(username, password);
    setLoading(false);
    if (!accepted) setError('We could not sign you in. Check your details and try again.');
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.page, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 28 }]} keyboardShouldPersistTaps="handled">
      <View style={styles.brandArea}><View style={[styles.mark, { backgroundColor: colors.primary }]}><Image source={require('@/assets/images/operations-icon.png')} style={styles.markImage} /></View><LogoLockup /></View>
      <View style={styles.intro}><Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text><Text style={styles.subtitle}>Sign in to manage today’s manufacturing operations.</Text></View>
      <View style={styles.form}>
        <Text style={styles.label}>Username or email</Text>
        <View style={[styles.inputWrap, { borderColor: colors.input }]}><Feather name="user" size={18} color={colors.mutedForeground} /><TextInput value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} style={styles.input} placeholder="e.g. jignesh" placeholderTextColor={colors.mutedForeground} /></View>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputWrap, { borderColor: colors.input }]}><Feather name="lock" size={18} color={colors.mutedForeground} /><TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPassword} style={styles.input} placeholder="Enter password" placeholderTextColor={colors.mutedForeground} /><Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={12}><Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} /></Pressable></View>
        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
        <View style={styles.formRow}><Pressable onPress={() => setRemember((value) => !value)} style={styles.remember}><View style={[styles.checkbox, { borderColor: remember ? colors.primary : colors.input, backgroundColor: remember ? colors.primary : 'transparent' }]}>{remember && <Feather name="check" size={13} color={colors.primaryForeground} />}</View><Text style={styles.rememberText}>Remember me</Text></Pressable><Pressable><Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text></Pressable></View>
        <PrimaryButton title={loading ? 'Signing in…' : 'Sign in'} icon={loading ? undefined : 'arrow-right'} onPress={submit} disabled={loading} />
      </View>
      <View style={styles.footer}><Text style={styles.footerText}>Employee operations · v1.0.0</Text><Text style={styles.footerHint}>Use any username and a 4+ character password for the demo.</Text></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandArea: { alignItems: 'center', gap: 12 },
  mark: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  markImage: { width: 49, height: 49, borderRadius: 14 },
  intro: { marginTop: 42 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2 },
  subtitle: { color: '#6b7a6e', fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 300 },
  form: { marginTop: 30, gap: 10 },
  label: { color: '#314138', fontSize: 13, fontWeight: '700', marginTop: 8 },
  inputWrap: { backgroundColor: '#ffffff', height: 54, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15 },
  input: { flex: 1, color: '#173524', fontSize: 15 },
  error: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 19, height: 19, borderWidth: 1.5, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rememberText: { color: '#6b7a6e', fontSize: 12 },
  forgot: { fontSize: 12, fontWeight: '700' },
  footer: { alignItems: 'center', marginTop: 'auto', paddingTop: 46 },
  footerText: { color: '#6b7a6e', fontSize: 12, fontWeight: '700' },
  footerHint: { color: '#8b978d', fontSize: 11, textAlign: 'center', marginTop: 6 },
});