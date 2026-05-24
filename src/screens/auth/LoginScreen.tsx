import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../utils/design';
import { Input } from '../../components/shared/index';
import { useStore } from '../../store';
import { supabase } from '../../utils/supabase';
import { fetchUserProfile } from '../../store';

export default function LoginScreen() {
  const { setUser } = useStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || phone.replace(/\s/g, '').length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const email = `${phone.replace(/\s/g, '')}@eduspark.in`;
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);
      if (!data.user) throw new Error('Login failed. Please try again.');
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) throw new Error('Account not found. Contact your school administrator.');
      setUser(profile);
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoSection}>
            <View style={s.logoBox}>
              <Text style={s.logoIcon}>⚡</Text>
            </View>
            <Text style={s.appName}>EduSpark</Text>
            <Text style={s.tagline}>by Zenvik AI</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to your account</Text>

            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.dangerText} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              prefix="+91"
              editable={!loading}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              editable={!loading}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              suffix={
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.gray400}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={[s.loginBtn, loading && s.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={s.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>

            <View style={s.helpRow}>
              <Ionicons name="information-circle-outline" size={14} color={colors.gray400} />
              <Text style={s.helpText}>
                Your credentials are provided by your school administrator.
              </Text>
            </View>
          </View>

          <Text style={s.footer}>© 2025 Zenvik AI Pvt. Ltd.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['2xl'],
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: { fontSize: 32 },
  appName: {
    fontSize: typography['3xl'],
    fontWeight: typography.extrabold,
    color: colors.gray900,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: typography.sm,
    color: colors.gray400,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.extrabold,
    color: colors.gray900,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: typography.sm,
    color: colors.gray500,
    marginBottom: spacing['2xl'],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.dangerText,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.65 },
  loginBtnText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.bold,
    letterSpacing: 0.2,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.gray50,
    borderRadius: radius.sm,
    padding: 10,
  },
  helpText: {
    flex: 1,
    fontSize: typography.xs,
    color: colors.gray400,
    lineHeight: 17,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.xs,
    color: colors.gray300,
  },
});
