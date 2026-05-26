import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { HOMEWORK } from '../../data/demoData';

const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', warningBg:'#FEF3C7', danger:'#DC2626', dangerBg:'#FEE2E2', purple:'#7C3AED', slate900:'#0F172A', slate700:'#334155', slate500:'#64748B', slate100:'#F1F5F9', white:'#FFFFFF' };

export const StudentHomeworkScreen: React.FC = () => {
  const [homework, setHomework] = useState(HOMEWORK);
  const [filter, setFilter] = useState<'all'|'pending'|'submitted'|'verified'>('all');

  const submit = (id: string) => {
    Alert.alert('Submit Homework', 'Mark this homework as done?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit ✓', onPress: () => {
        setHomework(prev => prev.map(h => h.id === id ? { ...h, status: 'submitted' } : h));
      }},
    ]);
  };

  const filtered = homework.filter(h => filter === 'all' || h.status === filter);
  const pending = homework.filter(h => h.status === 'pending').length;

  const statusColor = (s: string) => s === 'verified' ? C.success : s === 'submitted' ? C.brand : C.warning;
  const statusBg = (s: string) => s === 'verified' ? C.successBg : s === 'submitted' ? C.brandLight : C.warningBg;
  const statusLabel = (s: string) => s === 'verified' ? '✓ Verified' : s === 'submitted' ? '⏳ Submitted' : '⚠ Pending';

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.headerLabel}>HOMEWORK</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text style={s.headerTitle}>My Assignments</Text>
          {pending > 0 && (
            <View style={s.pendingBadge}>
              <Text style={{ color: C.white, fontSize: 12, fontWeight: '800' }}>{pending} pending</Text>
            </View>
          )}
        </View>
        <View style={s.filterRow}>
          {(['all','pending','submitted','verified'] as const).map(f => (
            <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((hw, i) => {
          const daysLeft = Math.max(0, Math.round((new Date(hw.dueDate).getTime() - Date.now()) / 86400000));
          const isOverdue = daysLeft === 0 && hw.status === 'pending';
          return (
            <View key={hw.id} style={[s.card, isOverdue && { borderLeftWidth: 4, borderLeftColor: C.danger }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={s.subjectTag}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: C.brand }}>{hw.subject}</Text>
                </View>
                <View style={[s.statusTag, { backgroundColor: statusBg(hw.status) }]}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: statusColor(hw.status) }}>{statusLabel(hw.status)}</Text>
                </View>
              </View>

              <Text style={s.hwTitle}>{hw.title}</Text>

              <View style={{ flexDirection: 'row', gap: 14, marginTop: 10, marginBottom: hw.status === 'pending' ? 12 : 0 }}>
                <Text style={{ fontSize: 12, color: isOverdue ? C.danger : C.slate500, fontWeight: isOverdue ? '700' : '400' }}>
                  📅 {isOverdue ? 'OVERDUE!' : `Due ${new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                </Text>
                <Text style={{ fontSize: 12, color: C.brand, fontWeight: '700' }}>⭐ +{hw.xpReward} XP</Text>
                <Text style={{ fontSize: 12, color: C.slate500 }}>👥 {hw.submissions}/{hw.total}</Text>
              </View>

              {hw.status === 'pending' && (
                <TouchableOpacity style={s.submitBtn} onPress={() => submit(hw.id)} activeOpacity={0.85}>
                  <Text style={s.submitBtnText}>✓ Mark as Done · +{hw.xpReward} XP</Text>
                </TouchableOpacity>
              )}
              {hw.status === 'submitted' && (
                <Text style={{ fontSize: 12, color: C.brand, fontStyle: 'italic' }}>Awaiting teacher verification...</Text>
              )}
              {hw.status === 'verified' && (
                <Text style={{ fontSize: 12, color: C.success, fontWeight: '700' }}>✓ Teacher verified · XP credited!</Text>
              )}
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  header: { backgroundColor: C.brand, paddingTop: 52, paddingBottom: 0, paddingHorizontal: 18 },
  headerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2, marginBottom: 14 },
  pendingBadge: { backgroundColor: C.danger, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 14, borderTopWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', paddingTop: 12 },
  filterChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: '#F59E0B' },
  filterText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  filterTextActive: { color: '#fff' },
  scroll: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  subjectTag: { backgroundColor: C.brandLight, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  hwTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', lineHeight: 21 },
  submitBtn: { backgroundColor: C.brand, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
