import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';

const C = {
  brand: '#1E3A8A', white: '#fff', gray50: '#f8fafc',
  gray200: '#e2e8f0', gray400: '#94a3b8',
  gray500: '#64748b', gray700: '#334155', gray900: '#0f172a',
  dangerBg: '#fde8e8', dangerText: '#9b1c1c',
};

// All demo users — setUser() format matching User interface in store/index.ts
const DEMO_USERS: Record<string, { passwords: string[]; user: any }> = {
  '9059717476': {
    passwords: ['Admin@123'],
    user: { id: 'sa_001', name: 'Platform Admin', role: 'super_admin', school: 'Zenvik AI', schoolId: '', phone: '9059717476' },
  },
  '9876500001': {
    passwords: ['Admin@1234'],
    user: { id: 'admin_001', name: 'Rajesh Kumar', role: 'admin', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500001' },
  },
  '9876500002': {
    passwords: ['Principal@1234'],
    user: { id: 'prin_001', name: 'Dr. Sunita Sharma', role: 'principal', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500002' },
  },
  '9876500003': {
    passwords: ['Teacher@1234'],
    user: { id: 'tchr_001', name: 'Ms. Kavitha Rao', role: 'teacher', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500003', classId: 'class_8a', className: '8A', subject: 'Science', subjectId: 'sub_sci' },
  },
  '9876500004': {
    passwords: ['Student@1234'],
    user: { id: 'stu_001', name: 'Arjun Patel', role: 'student', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500004', classId: 'class_8a', className: '8A' },
  },
  '9876500005': {
    passwords: ['Parent@1234'],
    user: { id: 'par_001', name: 'Suresh Patel', role: 'parent', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500005', childId: 'stu_001', childName: 'Arjun Patel' },
  },
  '9876500006': {
    passwords: ['Driver@1234'],
    user: { id: 'drv_001', name: 'Ramu Yadav', role: 'driver', school: 'Greenfield Academy', schoolId: 'school_001', phone: '9876500006', routeId: 'route_001' },
  },
};

export default function LoginScreen() {
  const setUser = useStore(s => s.setUser);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.'); return;
    }
    if (!password.trim()) {
      setError('Enter your password.'); return;
    }
    const record = DEMO_USERS[cleanPhone];
    if (!record) {
      setError('Mobile number not registered.'); return;
    }
    if (!record.passwords.includes(password.trim())) {
      setError('Incorrect password.'); return;
    }
    // Directly call setUser — App.tsx watches isLoggedIn and switches immediately
    setUser(record.user);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={s.logoSection}>
            <View style={s.logoBox}>
              <Text style={{ fontSize: 32 }}>⚡</Text>
            </View>
            <Text style={s.appName}>EduSpark</Text>
            <Text style={s.tagline}>by Zenvik AI</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in with your school credentials</Text>

            {!!error && (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle" size={16} color={C.dangerText} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Text style={s.label}>Mobile Number</Text>
            <View style={s.inputBox}>
              <Text style={s.prefix}>+91</Text>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={t => { setError(''); setPhone(t); }}
                placeholder="10-digit number"
                placeholderTextColor={C.gray400}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <Text style={[s.label, { marginTop: 14 }]}>Password</Text>
            <View style={s.inputBox}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={password}
                onChangeText={t => { setError(''); setPassword(t); }}
                placeholder="Enter your password"
                placeholderTextColor={C.gray400}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 8 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.gray400} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.btn} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={s.btnText}>Sign In</Text>
            </TouchableOpacity>

            <View style={s.helpBox}>
              <Ionicons name="information-circle-outline" size={14} color={C.gray400} />
              <Text style={s.helpText}>Credentials provided by your school administrator.</Text>
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
  logoSection: { alignItems: 'center', marginBottom: 36 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: C.brand, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  appName: { fontSize: 30, fontWeight: '800', color: C.gray900, letterSpacing: -0.5, marginBottom: 4 },
  tagline: { fontSize: 13, color: C.gray500 },
  card: { backgroundColor: C.white, borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.gray900, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.gray500, marginBottom: 22 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.dangerBg, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, color: C.dangerText },
  label: { fontSize: 13, fontWeight: '600', color: C.gray700, marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50, borderRadius: 12, borderWidth: 1.5, borderColor: C.gray200, paddingHorizontal: 14, minHeight: 50 },
  prefix: { fontSize: 14, color: C.gray500, fontWeight: '600', marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: C.gray900, paddingVertical: 12 },
  btn: { backgroundColor: C.brand, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowColor: C.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  helpBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: C.gray50, borderRadius: 8, padding: 10, marginTop: 16 },
  helpText: { flex: 1, fontSize: 12, color: C.gray400, lineHeight: 17 },
  footer: { textAlign: 'center', fontSize: 12, color: C.gray400 },
});
