import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabaseAdmin } from '../../utils/supabase';
import { useStore } from '../../store';
import { Input } from '../../components/shared/index';

// Colors inline to avoid any import issues
const C = {
  brand: '#1a56db', white: '#fff', gray50: '#f9fafb',
  gray100: '#f3f4f6', gray200: '#e5e7eb', gray400: '#9ca3af',
  gray500: '#6b7280', gray700: '#374151', gray900: '#111827',
  danger: '#fde8e8', dangerText: '#9b1c1c',
};

export default function LoginScreen() {
  const { setUser } = useStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!password.trim()) {
      setError('Enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Direct DB login - bypasses Supabase Auth entirely
      const { data: user, error: userErr } = await supabaseAdmin
        .from('users')
        .select('*, schools(name, id)')
        .eq('phone', cleanPhone)
        .eq('demo_password', password.trim())
        .eq('is_active', true)
        .single();

      if (userErr || !user) {
        setError('Invalid mobile number or password.');
        return;
      }

      // Build role-specific extras
      let classId, className, subjectId, subject, childId, childName, routeId;

      if (user.role === 'student') {
        const { data: en } = await supabaseAdmin
          .from('class_enrollments')
          .select('class_id, classes(name)')
          .eq('student_id', user.id)
          .limit(1).single();
        classId = en?.class_id;
        className = (en as any)?.classes?.name;
      }

      if (user.role === 'parent') {
        const { data: link } = await supabaseAdmin
          .from('parent_student_links')
          .select('student_id, users!student_id(name)')
          .eq('parent_id', user.id)
          .limit(1).single();
        childId = link?.student_id;
        childName = (link as any)?.users?.name;
      }

      if (user.role === 'teacher' || user.role === 'class_teacher') {
        const { data: ta } = await supabaseAdmin
          .from('teacher_assignments')
          .select('class_id, subject_id, classes(name), subjects(name, id)')
          .eq('teacher_id', user.id)
          .limit(1).single();
        classId = ta?.class_id;
        className = (ta as any)?.classes?.name;
        subject = (ta as any)?.subjects?.name;
        subjectId = (ta as any)?.subjects?.id;
      }

      if (user.role === 'driver') {
        const { data: route } = await supabaseAdmin
          .from('bus_routes')
          .select('id')
          .eq('driver_id', user.id)
          .single();
        routeId = route?.id;
      }

      setUser({
        id: user.id,
        name: user.name,
        role: user.role,
        school: (user as any).schools?.name ?? '',
        schoolId: (user as any).schools?.id ?? user.school_id ?? '',
        phone: user.phone,
        email: user.email,
        classId, className, subjectId, subject,
        childId, childName, routeId,
      });
    } catch (e: any) {
      setError('Login failed: ' + (e.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
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
              <Text style={{ fontSize: 32 }}>⚡</Text>
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
                <Ionicons name="alert-circle" size={16} color={C.dangerText} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            {/* Phone */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Mobile Number</Text>
              <View style={s.inputRow}>
                <Text style={s.prefix}>+91</Text>
                <View style={{ flex: 1 }}>
                  <Input
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="10-digit number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Password</Text>
              <View style={s.inputRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPass}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 8 }}>
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20} color={C.gray400}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.loginBtn, loading && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={C.white} size="small" />
                : <Text style={s.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>

            <View style={s.helpRow}>
              <Ionicons name="information-circle-outline" size={14} color={C.gray400} />
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
  safe: { flex: 1, backgroundColor: C.gray50 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, shadowColor: C.brand,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3,
    shadowRadius: 16, elevation: 8,
  },
  appName: { fontSize: 28, fontWeight: '800', color: C.gray900, letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 13, color: C.gray400 },
  card: {
    backgroundColor: C.white, borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: C.gray900, letterSpacing: -0.5, marginBottom: 4 },
  cardSub: { fontSize: 14, color: C.gray500, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: C.danger, borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: C.dangerText, lineHeight: 18 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.gray700, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  prefix: { fontSize: 14, color: C.gray500, fontWeight: '600', marginRight: 8, marginTop: 2 },
  loginBtn: {
    backgroundColor: C.brand, borderRadius: 12, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: C.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  loginBtnText: { color: C.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  helpRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: C.gray50, borderRadius: 8, padding: 10, marginTop: 16,
  },
  helpText: { flex: 1, fontSize: 12, color: C.gray400, lineHeight: 17 },
  footer: { textAlign: 'center', fontSize: 12, color: C.gray400 },
});
