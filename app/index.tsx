import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { LogoLockup, PrimaryButton } from '@/components/AppUI';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hydrated, isAuthenticated, login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || isAuthenticated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const submit = async () => {
    setError('');
    if (!username.trim() || password.length < 4) {
      setError('Enter your email, username, or mobile number and password.');
      return;
    }
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'We could not sign you in. Check your details and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={[styles.page, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.centerContainer}>
          <View style={styles.brandArea}>
            <LogoLockup />
          </View>

          <View style={styles.intro}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email, Username, or Mobile</Text>
            <View style={[styles.inputWrap, { borderColor: colors.input }]}>
              <Feather name="user" size={18} color={colors.mutedForeground} />
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                placeholder="Email, username, or mobile number"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, { borderColor: colors.input }]}>
              <Feather name="lock" size={18} color={colors.mutedForeground} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.mutedForeground}
              />
              <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={12}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

            <PrimaryButton title={loading ? 'Signing in…' : 'Sign in'} icon={loading ? undefined : 'arrow-right'} onPress={submit} disabled={loading} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', minHeight: '100%' },
  centerContainer: { width: '100%', maxWidth: 400, alignSelf: 'center', paddingVertical: 20 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandArea: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  intro: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8, textAlign: 'center' },
  form: { width: '100%', gap: 10 },
  label: { color: '#314138', fontSize: 13, fontWeight: '700', marginTop: 8 },
  inputWrap: { backgroundColor: '#ffffff', height: 54, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15 },
  input: { flex: 1, color: '#173524', fontSize: 15 },
  error: { fontSize: 12, lineHeight: 18, marginTop: 3, textAlign: 'center' },
  formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 19, height: 19, borderWidth: 1.5, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rememberText: { color: '#6b7a6e', fontSize: 12 },
  forgot: { fontSize: 12, fontWeight: '700' },
  footer: { alignItems: 'center', marginTop: 32, paddingBottom: 8 },
  footerText: { color: '#6b7a6e', fontSize: 12, fontWeight: '700', textAlign: 'center' },
});