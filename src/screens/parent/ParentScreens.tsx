import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Modal, Linking, Alert } from 'react-native';
import { useStore } from '../../store';
import { FEE_RECORDS, ATTENDANCE_HISTORY, BUS_ROUTE, SCHOOL, SUBJECT_SCORES, NOTIFICATIONS_LIST } from '../../data/demoData';

const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2', slate900:'#0F172A', slate700:'#334155', slate500:'#64748B', slate200:'#E2E8F0', slate100:'#F1F5F9', white:'#FFFFFF' };
const Hdr = ({ color, title, sub }: any) => (
  <View style={{ backgroundColor: color, paddingTop: 52, paddingBottom: 18, paddingHorizontal: 18 }}>
    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>PARENT PORTAL</Text>
    <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>{title}</Text>
    {sub && <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{sub}</Text>}
  </View>
);

export const ParentAttendanceScreen: React.FC = () => {
  const present = ATTENDANCE_HISTORY.filter(d => d.status === 'present').length;
  const absent = ATTENDANCE_HISTORY.filter(d => d.status === 'absent').length;
  const rate = Math.round((present / (present + absent)) * 100);
  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#14532D" title="Attendance Calendar" sub="Arjun Patel · Class 8A" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[{ val: `${rate}%`, l: 'Rate', c: rate>=75?C.success:C.danger }, { val: present, l: 'Present', c: C.success }, { val: absent, l: 'Absent', c: C.danger }, { val: 4, l: 'Holidays', c: C.slate500 }].map((st,i)=>(
            <View key={i} style={{ flex:1, backgroundColor:C.white, borderRadius:14, padding:12, alignItems:'center', shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:4, elevation:1 }}>
              <Text style={{ fontSize:20, fontWeight:'900', color:st.c }}>{st.val}</Text>
              <Text style={{ fontSize:10, color:C.slate500, fontWeight:'600', marginTop:2 }}>{st.l}</Text>
            </View>
          ))}
        </View>
        {rate < 75 && <View style={{ backgroundColor:C.dangerBg, borderRadius:12, padding:14, marginBottom:14, borderLeftWidth:4, borderLeftColor:C.danger }}><Text style={{ color:C.danger, fontWeight:'800', fontSize:13 }}>⚠️ Attendance below 75% — may affect exam eligibility</Text></View>}
        <View style={{ backgroundColor:C.white, borderRadius:16, padding:16, marginBottom:14, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 }}>
          <Text style={{ fontSize:14, fontWeight:'800', color:C.slate900, marginBottom:14 }}>Last 30 Days</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
            {ATTENDANCE_HISTORY.map((d,i)=>(
              <View key={i} style={{ width:36, height:36, borderRadius:8, alignItems:'center', justifyContent:'center', backgroundColor: d.status==='present'?C.successBg:d.status==='absent'?C.dangerBg:C.slate100 }}>
                <Text style={{ fontSize:11, fontWeight:'800', color: d.status==='present'?C.success:d.status==='absent'?C.danger:C.slate500 }}>{d.date.getDate()}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection:'row', gap:16, marginTop:14 }}>
            {[['Present',C.success,C.successBg],['Absent',C.danger,C.dangerBg],['Holiday',C.slate500,C.slate100]].map(([l,c,bg])=>(
              <View key={l} style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
                <View style={{ width:12, height:12, borderRadius:3, backgroundColor:bg as string }} />
                <Text style={{ fontSize:11, color:C.slate500 }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ backgroundColor:C.white, borderRadius:16, padding:16, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:8, elevation:2 }}>
          <Text style={{ fontSize:14, fontWeight:'800', color:C.slate900, marginBottom:12 }}>Recent Records</Text>
          {ATTENDANCE_HISTORY.slice(-10).reverse().map((d,i)=>(
            <View key={i} style={[{ flexDirection:'row', alignItems:'center', paddingVertical:10 }, i<9&&{borderBottomWidth:0.5,borderColor:C.slate100}]}>
              <Text style={{ flex:1, fontSize:13, color:C.slate700, fontWeight:'600' }}>{d.date.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</Text>
              <View style={{ borderRadius:6, paddingHorizontal:10, paddingVertical:4, backgroundColor: d.status==='present'?C.successBg:d.status==='absent'?C.dangerBg:C.slate100 }}>
                <Text style={{ fontSize:11, fontWeight:'800', color: d.status==='present'?C.success:d.status==='absent'?C.danger:C.slate500 }}>{d.status.charAt(0).toUpperCase()+d.status.slice(1)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export const ParentFeeScreen: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [fees, setFees] = useState(FEE_RECORDS);
  const totalPending = fees.filter(f=>f.status==='pending').reduce((a,f)=>a+f.amount,0);

  const openUPI = (amount: number) => {
    Linking.openURL(`upi://pay?pa=${SCHOOL.upiId}&pn=${encodeURIComponent(SCHOOL.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('School Fee')}`).catch(()=> Alert.alert('UPI', 'No UPI app found. Please pay via: ' + SCHOOL.upiId));
  };

  const markPaid = (id: string) => {
    Alert.alert('Payment Confirmation', 'Have you completed the payment?', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, Paid', onPress: () => setFees(prev => prev.map(f => f.id === id ? { ...f, status: 'paid', paidOn: new Date().toISOString().split('T')[0] } : f)) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#1E3A8A" title="Fee Payment" sub={totalPending > 0 ? `₹${totalPending.toLocaleString()} outstanding` : '✅ All fees paid'} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {totalPending > 0 && (
          <View style={{ backgroundColor: C.dangerBg, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' }}>
            <Text style={{ fontSize: 12, color: C.danger, fontWeight: '700' }}>Outstanding Balance</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: C.danger, marginTop: 2 }}>₹{totalPending.toLocaleString()}</Text>
            <Text style={{ fontSize: 11, color: C.danger + 'cc', marginTop: 4 }}>Pay via UPI to: {SCHOOL.upiId}</Text>
          </View>
        )}

        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
          <Text style={{ fontSize: 12, color: C.brand, fontWeight: '700', marginBottom: 2 }}>School UPI ID</Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.brand, letterSpacing: 0.5 }}>{SCHOOL.upiId}</Text>
          <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>Works with GPay, PhonePe, Paytm, BHIM, any UPI app</Text>
        </View>

        {fees.map((fee, i) => (
          <View key={fee.id} style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900 }}>{fee.term}</Text>
                <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>
                  {fee.status === 'paid' ? `✅ Paid on ${new Date((fee as any).paidOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : `Due ${new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: fee.status === 'paid' ? C.success : C.danger }}>₹{fee.amount.toLocaleString()}</Text>
                <View style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4, backgroundColor: fee.status === 'paid' ? C.successBg : C.dangerBg }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: fee.status === 'paid' ? C.success : C.danger }}>{fee.status === 'paid' ? '✓ PAID' : 'PENDING'}</Text>
                </View>
              </View>
            </View>
            {fee.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.brandLight, borderRadius: 12, paddingVertical: 12 }} onPress={() => setShowQR(true)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 18 }}>📱</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: C.brand }}>Scan QR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.successBg, borderRadius: 12, paddingVertical: 12 }} onPress={() => openUPI(fee.amount)} activeOpacity={0.85}>
                  <Text style={{ fontSize: 18 }}>⚡</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: C.success }}>Pay via UPI</Text>
                </TouchableOpacity>
              </View>
            )}
            {fee.status === 'pending' && (
              <TouchableOpacity style={{ marginTop: 8, alignItems: 'center', paddingVertical: 8 }} onPress={() => markPaid(fee.id)} activeOpacity={0.7}>
                <Text style={{ fontSize: 12, color: C.slate500, fontWeight: '600' }}>I've already paid — confirm payment →</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={{ backgroundColor: '#F0F9FF', borderRadius: 14, padding: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0369A1', marginBottom: 8 }}>📋 Payment Instructions</Text>
          {['Scan QR or tap "Pay via UPI" to initiate payment', `UPI ID: ${SCHOOL.upiId}`, 'Add child\'s name + class in payment remarks', 'Screenshot the payment confirmation', 'Share screenshot to school: 080-41234567'].map((step, i) => (
            <Text key={i} style={{ fontSize: 12, color: '#0369A1', marginBottom: 4 }}>• {step}</Text>
          ))}
        </View>
      </ScrollView>

      <Modal visible={showQR} transparent animationType="slide" onRequestClose={() => setShowQR(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: C.slate900, marginBottom: 4 }}>📱 Scan to Pay</Text>
            <Text style={{ fontSize: 13, color: C.slate500, marginBottom: 20 }}>Use any UPI app to scan</Text>
            <View style={{ width: 180, height: 180, borderRadius: 16, backgroundColor: C.slate100, borderWidth: 2, borderColor: C.slate200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 60 }}>▦</Text>
              <Text style={{ fontSize: 11, color: C.slate500, marginTop: 8, textAlign: 'center' }}>QR Code{'\n'}{SCHOOL.upiId}</Text>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '900', color: C.brand, marginBottom: 4 }}>{SCHOOL.name}</Text>
            <Text style={{ fontSize: 13, color: C.slate500, marginBottom: 4 }}>{SCHOOL.upiId}</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: C.success, marginBottom: 20 }}>₹18,500</Text>
            <TouchableOpacity style={{ backgroundColor: C.brand, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12, width: '100%', alignItems: 'center' }}
              onPress={() => { setShowQR(false); openUPI(18500); }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>⚡ Open UPI App Instead</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowQR(false)}>
              <Text style={{ color: C.slate500, fontSize: 13, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const ParentBusScreen: React.FC = () => {
  const route = BUS_ROUTE;
  const completed = route.stops.filter(s => s.completed).length;
  const currentStop = route.stops.find(s => !s.completed);

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#D97706" title="Bus Tracking" sub={`${route.routeName} · ${route.vehicle}`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {currentStop && (
          <View style={{ backgroundColor: C.warningBg, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' }}>
            <Text style={{ fontSize: 12, color: C.warning, fontWeight: '700' }}>🚌 BUS IS CURRENTLY AT</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: C.slate900, marginTop: 4 }}>{currentStop.name}</Text>
            <Text style={{ fontSize: 13, color: C.slate700, marginTop: 2 }}>ETA to School Gate: 8:00 AM</Text>
          </View>
        )}

        <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {[{ val: completed, l: 'Completed', c: C.success }, { val: route.stops.length - completed, l: 'Remaining', c: C.warning }, { val: route.stops.length, l: 'Total', c: C.brand }].map((st, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', backgroundColor: C.slate100, borderRadius: 12, paddingVertical: 10 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: st.c }}>{st.val}</Text>
                <Text style={{ fontSize: 10, color: C.slate500, fontWeight: '600', marginTop: 2 }}>{st.l}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 6, backgroundColor: C.slate100, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${(completed / route.stops.length) * 100}%`, height: 6, backgroundColor: C.success, borderRadius: 3 }} />
          </View>
        </View>

        <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900, marginBottom: 10 }}>📍 Route Stops</Text>
        <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          {route.stops.map((stop, i) => {
            const isCurrent = !stop.completed && route.stops.slice(0, i).every(s => s.completed);
            return (
              <View key={stop.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }, i < route.stops.length - 1 && { borderBottomWidth: 0.5, borderColor: C.slate100 }]}>
                <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: stop.completed ? C.successBg : isCurrent ? C.warningBg : C.slate100 }}>
                  {stop.completed ? <Text style={{ color: C.success, fontWeight: '900', fontSize: 14 }}>✓</Text> : isCurrent ? <Text style={{ fontSize: 14 }}>🚌</Text> : <Text style={{ fontSize: 13, color: C.slate500, fontWeight: '700' }}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: isCurrent ? '900' : stop.completed ? '500' : '700', color: isCurrent ? C.warning : stop.completed ? C.slate500 : C.slate900 }}>{stop.name}</Text>
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>{stop.time}</Text>
                </View>
                {isCurrent && <View style={{ backgroundColor: C.warningBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}><Text style={{ fontSize: 11, fontWeight: '800', color: C.warning }}>NEXT</Text></View>}
                {stop.completed && <Text style={{ fontSize: 20 }}>✅</Text>}
              </View>
            );
          })}
        </View>

        <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900, marginBottom: 12 }}>👤 Driver Details</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.slate100, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24 }}>🚌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.slate900 }}>{route.driver}</Text>
              <Text style={{ fontSize: 12, color: C.slate500 }}>Vehicle: {route.vehicle}</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: C.successBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }} onPress={() => Linking.openURL(`tel:${route.driverPhone}`)} activeOpacity={0.85}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: C.success }}>📞 Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export const ParentProgressScreen: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: C.slate100 }}>
    <StatusBar barStyle="light-content" />
    <Hdr color="#7C2D12" title="Arjun's Performance" sub="Term 2 · Class 8A · Overall: B+ (82%)" />
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View>
            <Text style={{ fontSize: 12, color: C.slate500 }}>Overall Grade</Text>
            <Text style={{ fontSize: 48, fontWeight: '900', color: C.brand }}>B+</Text>
            <Text style={{ fontSize: 13, color: C.slate500 }}>82% average · Rank #3 in class</Text>
          </View>
          <View style={{ backgroundColor: C.successBg, borderRadius: 14, padding: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>📈</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: C.success }}>+5%</Text>
            <Text style={{ fontSize: 11, color: C.slate500 }}>vs last term</Text>
          </View>
        </View>
        <View style={{ height: 7, backgroundColor: C.slate100, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ width: '82%', height: 7, backgroundColor: C.brand, borderRadius: 4 }} />
        </View>
      </View>
      {SUBJECT_SCORES.map((sub, i) => (
        <View key={i} style={{ backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 22 }}>{sub.icon}</Text>
              <View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: C.slate900 }}>{sub.subject}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>Grade: {sub.grade}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger }}>{sub.score}%</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: sub.trend > 0 ? C.success : C.danger }}>{sub.trend > 0 ? `▲ +${sub.trend}%` : `▼ ${sub.trend}%`}</Text>
            </View>
          </View>
          <View style={{ height: 5, backgroundColor: C.slate100, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ width: `${sub.score}%`, height: 5, backgroundColor: sub.score >= 85 ? C.success : sub.score >= 70 ? C.warning : C.danger, borderRadius: 3 }} />
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

export const ParentNotificationsScreen: React.FC = () => {
  const [notifs, setNotifs] = useState(NOTIFICATIONS_LIST);
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <Hdr color="#1E3A8A" title="Notifications" sub={`${notifs.filter(n => !n.read).length} unread`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {notifs.map((n, i) => (
          <TouchableOpacity key={n.id} style={{ backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, opacity: n.read ? 0.75 : 1 }}
            onPress={() => markRead(n.id)} activeOpacity={0.85}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: n.color + '20', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 22 }}>{n.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, fontWeight: n.read ? '600' : '800', color: C.slate900, flex: 1 }}>{n.title}</Text>
                {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger, marginTop: 3, marginLeft: 6 }} />}
              </View>
              <Text style={{ fontSize: 12, color: C.slate500, marginTop: 4, lineHeight: 18 }}>{n.msg}</Text>
              <Text style={{ fontSize: 10, color: C.slate500, marginTop: 6 }}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
