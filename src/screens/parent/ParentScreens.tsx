import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Modal, Image, Linking, Share,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Radius, Shadow } from '../../constants/theme';

// ─── School UPI details (admin sets this) ────────────────────────
const SCHOOL_UPI = {
  upiId: 'greenfield.school@okaxis',
  name: 'Greenfield Academy',
  qrHint: 'Scan to pay school fees via any UPI app',
};

// ─── HELPER COMPONENTS ───────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

const Card = ({ children, style }: any) => (
  <View style={[s.card, style]}>{children}</View>
);

const ProgressBar = ({ value, color, height = 6 }: { value: number; color: string; height?: number }) => (
  <View style={{ height, backgroundColor: Colors.slate100, borderRadius: height / 2, overflow: 'hidden' }}>
    <View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height, backgroundColor: color, borderRadius: height / 2 }} />
  </View>
);

// ─── PROGRESS SCREEN ─────────────────────────────────────────────
export const ParentProgressScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: '#7C2D12' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.headerLabel}>PROGRESS REPORT</Text>
            <Text style={s.headerTitle}>Aarav's Performance</Text>
            <Text style={s.headerSub}>Term 1 · Greenfield Academy</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <View style={s.gradeCard}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Overall Grade — Term 1</Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 4 }}>
            B+ <Text style={{ fontSize: 18, opacity: 0.8 }}>82%</Text>
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Class rank: 12 of 34 · Trend: ↑ Improving</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Subject Performance" />
        <Card>
          {[
            ['🌿', 'Science',        'A',  91, Colors.success],
            ['📖', 'English',        'B+', 88, Colors.primary],
            ['📐', 'Mathematics',    'B',  79, '#3b82f6'],
            ['🗺️', 'Social Studies', 'B-', 74, Colors.warning],
            ['📝', 'Hindi',          'C+', 68, Colors.danger],
          ].map(([ic, sub, grade, pct, color]) => (
            <View key={sub as string} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, color: Colors.slate700 }}>{ic} {sub}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: color as string }}>{grade} — {pct}%</Text>
              </View>
              <ProgressBar value={pct as number} color={color as string} />
            </View>
          ))}
        </Card>

        <SectionHeader title="Attendance Summary" />
        <Card>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[['87%', 'This Month', Colors.success], ['92%', 'This Term', Colors.primary], ['18', 'Days Absent', Colors.danger]].map(([v, l, c]) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', backgroundColor: Colors.slate50, borderRadius: 12, padding: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: c as string }}>{v}</Text>
                <Text style={{ fontSize: 10, color: Colors.slate500, fontWeight: '600', marginTop: 2 }}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionHeader title="Homework Completion" />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 13, color: Colors.slate700 }}>Completion Rate</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.success }}>78%</Text>
          </View>
          <ProgressBar value={78} color={Colors.success} height={8} />
          <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 8 }}>Aarav completed 18 of 23 assignments this term</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

// ─── FEE PAYMENT SCREEN ──────────────────────────────────────────
export const ParentFeeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const [showQR, setShowQR] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  const fees = [
    { id: '1', term: 'Term 2 — 2024-25', amount: 18500, due: '2026-04-15', status: 'pending', late: false },
    { id: '2', term: 'Term 1 — 2024-25', amount: 18500, due: '2025-11-15', status: 'paid',    paid: '2025-11-10' },
    { id: '3', term: 'Annual Fee',       amount: 5000,  due: '2025-06-01', status: 'paid',    paid: '2025-06-01' },
  ];

  const totalPending = fees.filter(f => f.status === 'pending').reduce((a, f) => a + f.amount, 0);

  const openQR = (fee: any) => { setSelectedFee(fee); setShowQR(true); };

  const openUPI = (amount: number) => {
    const upiUrl = `upi://pay?pa=${SCHOOL_UPI.upiId}&pn=${encodeURIComponent(SCHOOL_UPI.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('School Fee Payment')}`;
    Linking.openURL(upiUrl).catch(() => {
      // Fallback if UPI app not installed
      Linking.openURL(`https://pay.google.com`);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: '#1e3a5f' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.headerLabel}>FEE PAYMENT</Text>
            <Text style={s.headerTitle}>School Fees</Text>
            <Text style={s.headerSub}>Greenfield Academy</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        {totalPending > 0 && (
          <View style={s.pendingAlert}>
            <Text style={{ fontSize: 11, color: '#fef2f2', fontWeight: '600' }}>⚠️ Outstanding Amount</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>₹{totalPending.toLocaleString()}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Tap "Pay Now" on any pending fee below</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* UPI Info */}
        <View style={s.upiInfo}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.slate700, marginBottom: 2 }}>School UPI ID</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary, letterSpacing: 0.3 }}>{SCHOOL_UPI.upiId}</Text>
          <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 2 }}>Use any UPI app — GPay, PhonePe, Paytm, BHIM</Text>
        </View>

        <SectionHeader title="Fee Records" />
        {fees.map(fee => (
          <Card key={fee.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.slate800 }}>{fee.term}</Text>
                <Text style={{ fontSize: 11, color: Colors.slate400, marginTop: 2 }}>
                  {fee.status === 'paid' ? `✅ Paid on ${new Date((fee as any).paid).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : `Due by ${new Date(fee.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: fee.status === 'paid' ? Colors.success : Colors.danger }}>₹{fee.amount.toLocaleString()}</Text>
                <View style={[s.statusBadge, { backgroundColor: fee.status === 'paid' ? '#dcfce7' : '#fde8e8' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: fee.status === 'paid' ? Colors.success : Colors.danger }}>
                    {fee.status === 'paid' ? 'PAID' : 'PENDING'}
                  </Text>
                </View>
              </View>
            </View>
            {fee.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={s.payBtn} onPress={() => openQR(fee)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>📱</Text>
                  <Text style={s.payBtnText}>Scan QR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.payBtn, { backgroundColor: '#dcfce7', flex: 1 }]} onPress={() => openUPI(fee.amount)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 16, marginRight: 6 }}>⚡</Text>
                  <Text style={[s.payBtnText, { color: Colors.success }]}>Open UPI App</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        ))}

        {/* Payment instructions */}
        <Card style={{ backgroundColor: '#f0f9ff' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0369a1', marginBottom: 8 }}>📋 Payment Instructions</Text>
          {[
            'Scan the QR code or tap "Open UPI App" to pay',
            `UPI ID: ${SCHOOL_UPI.upiId}`,
            'Add student name + roll number in remarks',
            'Screenshot the payment confirmation',
            'WhatsApp the screenshot to school office: 9876543210',
          ].map((step, i) => (
            <Text key={i} style={{ fontSize: 12, color: '#0369a1', marginBottom: 4 }}>• {step}</Text>
          ))}
        </Card>
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={showQR} transparent animationType="slide" onRequestClose={() => setShowQR(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: Colors.slate800, marginBottom: 4 }}>📱 Scan to Pay</Text>
            <Text style={{ fontSize: 13, color: Colors.slate500, marginBottom: 20 }}>{selectedFee?.term}</Text>
            
            {/* QR Placeholder - would use actual QR library in production */}
            <View style={s.qrPlaceholder}>
              <View style={s.qrInner}>
                <Text style={{ fontSize: 48 }}>▦</Text>
                <Text style={{ fontSize: 11, color: Colors.slate500, marginTop: 8, textAlign: 'center' }}>
                  QR Code{'\n'}(Add react-native-qrcode-svg for production)
                </Text>
              </View>
            </View>

            <View style={s.qrDetails}>
              <Text style={{ fontSize: 11, color: Colors.slate500 }}>Pay to</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.primary }}>{SCHOOL_UPI.name}</Text>
              <Text style={{ fontSize: 13, color: Colors.slate600, marginTop: 2 }}>{SCHOOL_UPI.upiId}</Text>
              <Text style={{ fontSize: 24, fontWeight: '900', color: Colors.success, marginTop: 8 }}>
                ₹{selectedFee?.amount?.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity style={[s.payBtn, { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, marginBottom: 12, justifyContent: 'center' }]} onPress={() => { setShowQR(false); openUPI(selectedFee?.amount); }}>
              <Text style={[s.payBtnText, { color: '#fff', fontSize: 15 }]}>⚡ Open UPI App Instead</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQR(false)}>
              <Text style={{ textAlign: 'center', color: Colors.slate400, fontSize: 13, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── ATTENDANCE SCREEN ───────────────────────────────────────────
export const ParentAttendanceScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const attendanceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000),
    status: i % 7 === 0 ? 'holiday' : i % 9 === 8 ? 'absent' : 'present',
  }));
  const presentCount = attendanceData.filter(d => d.status === 'present').length;
  const absentCount = attendanceData.filter(d => d.status === 'absent').length;
  const rate = Math.round((presentCount / (presentCount + absentCount)) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.slate50 }}>
      <StatusBar barStyle="light-content" />
      <View style={[s.header, { backgroundColor: '#14532d' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={s.headerLabel}>ATTENDANCE</Text>
            <Text style={s.headerTitle}>Aarav's Attendance</Text>
            <Text style={s.headerSub}>Last 30 days</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          {[
            [rate + '%', 'Rate',    '#fff'],
            [presentCount, 'Present', '#4ade80'],
            [absentCount,  'Absent',  '#f87171'],
          ].map(([v, l, c]) => (
            <View key={l} style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingVertical: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: c as string }}>{v}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{l}</Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {rate < 75 && (
          <View style={s.alertBanner}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.danger }}>⚠️ Attendance Warning</Text>
            <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 2 }}>Aarav's attendance is below 75%. Please ensure regular attendance to avoid academic consequences.</Text>
          </View>
        )}
        <SectionHeader title="Calendar — Last 30 Days" />
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {attendanceData.map((day, i) => (
              <View key={i} style={[s.calDay, {
                backgroundColor: day.status === 'present' ? '#dcfce7' : day.status === 'absent' ? '#fde8e8' : Colors.slate100,
              }]}>
                <Text style={{ fontSize: 9, fontWeight: '800', color: day.status === 'present' ? Colors.success : day.status === 'absent' ? Colors.danger : Colors.slate400 }}>
                  {day.date.getDate()}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
            {[['Present', Colors.success, '#dcfce7'], ['Absent', Colors.danger, '#fde8e8'], ['Holiday', Colors.slate400, Colors.slate100]].map(([l, c, bg]) => (
              <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bg as string }} />
                <Text style={{ fontSize: 11, color: Colors.slate500, fontWeight: '600' }}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>
        <SectionHeader title="Recent Records" />
        <Card>
          {attendanceData.slice(-10).reverse().map((day, i) => (
            <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }, i < 9 && { borderBottomWidth: 0.5, borderColor: Colors.slate100 }]}>
              <Text style={{ flex: 1, fontSize: 13, color: Colors.slate700, fontWeight: '600' }}>
                {day.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              </Text>
              <View style={[s.statusBadge, { backgroundColor: day.status === 'present' ? '#dcfce7' : day.status === 'absent' ? '#fde8e8' : Colors.slate100 }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: day.status === 'present' ? Colors.success : day.status === 'absent' ? Colors.danger : Colors.slate400 }}>
                  {day.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  gradeCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14, marginTop: 14 },
  pendingAlert: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14, marginTop: 14 },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.slate700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, ...Shadow.sm as any },
  upiInfo: { backgroundColor: '#eff6ff', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  payBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 12 },
  payBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, alignItems: 'center' },
  qrPlaceholder: { width: 200, height: 200, borderRadius: 16, backgroundColor: Colors.slate50, borderWidth: 2, borderColor: Colors.slate200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  qrInner: { alignItems: 'center' },
  qrDetails: { alignItems: 'center', backgroundColor: Colors.slate50, borderRadius: 16, padding: 16, width: '100%', marginBottom: 20 },
  calDay: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertBanner: { backgroundColor: '#fde8e8', borderRadius: 12, padding: 14, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: Colors.danger },
});
