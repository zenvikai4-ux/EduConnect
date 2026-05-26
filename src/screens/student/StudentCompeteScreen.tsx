import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { COMPETITIONS } from '../../data/demoData';

const C = { brand:'#1E3A8A', brandLight:'#EEF2FF', success:'#059669', successBg:'#D1FAE5', warning:'#D97706', danger:'#DC2626', dangerBg:'#FEE2E2', purple:'#7C3AED', purpleBg:'#EDE9FE', slate900:'#0F172A', slate500:'#64748B', slate100:'#F1F5F9', white:'#FFFFFF' };

export const StudentCompeteScreen: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const comp = COMPETITIONS.find(c => c.id === selected);

  const startComp = (id: string) => {
    setSelected(id); setCurrentQ(0); setAnswers({}); setDone(false); setScore(0);
  };

  const answer = (idx: number) => {
    const q = comp!.questions[currentQ];
    const isCorrect = idx === q.answer;
    const newAnswers = { ...answers, [currentQ]: idx };
    setAnswers(newAnswers);

    if (isCorrect) {
      Alert.alert('✅ Correct!', q.explanation, [{ text: 'Next', onPress: () => next(newAnswers) }]);
    } else {
      Alert.alert('❌ Wrong', `Correct: ${q.options[q.answer]}\n\n${q.explanation}`, [{ text: 'Next', onPress: () => next(newAnswers) }]);
    }
  };

  const next = (ans: Record<number, number>) => {
    if (currentQ + 1 >= comp!.questions.length) {
      const correct = comp!.questions.filter((q, i) => ans[i] === q.answer).length;
      setScore(correct);
      setDone(true);
    } else {
      setCurrentQ(q => q + 1);
    }
  };

  if (selected && comp && !done) {
    const q = comp.questions[currentQ];
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <StatusBar barStyle="light-content" />
        <View style={{ paddingTop: 52, paddingHorizontal: 18, paddingBottom: 20, backgroundColor: '#1E293B' }}>
          <TouchableOpacity onPress={() => setSelected(null)} style={{ marginBottom: 12 }}>
            <Text style={{ color: '#94A3B8', fontSize: 13 }}>← Exit</Text>
          </TouchableOpacity>
          <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700' }}>{comp.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Question {currentQ + 1} of {comp.questions.length}</Text>
            <Text style={{ color: '#F59E0B', fontWeight: '800' }}>+{(currentQ + 1) * 20} XP</Text>
          </View>
          <View style={{ height: 4, backgroundColor: '#334155', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ width: `${((currentQ + 1) / comp.questions.length) * 100}%`, height: 4, backgroundColor: '#7C3AED', borderRadius: 2 }} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <View style={{ backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Text style={{ color: '#E2E8F0', fontSize: 17, fontWeight: '700', lineHeight: 26 }}>{q.q}</Text>
          </View>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} style={{ backgroundColor: '#1E293B', borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: '#334155' }} onPress={() => answer(i)} activeOpacity={0.85}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#2D1B69', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#7C3AED', fontWeight: '900', fontSize: 13 }}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={{ color: '#E2E8F0', fontSize: 14, flex: 1 }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (done && comp) {
    const pct = Math.round((score / comp.questions.length) * 100);
    const xpEarned = score * 20;
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <StatusBar barStyle="light-content" />
        <Text style={{ fontSize: 72, marginBottom: 16 }}>{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📚'}</Text>
        <Text style={{ fontSize: 48, fontWeight: '900', color: '#fff' }}>{pct}%</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: pct >= 80 ? '#4ade80' : pct >= 60 ? '#F59E0B' : '#f87171', marginTop: 8, marginBottom: 4 }}>
          {pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'}
        </Text>
        <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 8 }}>{score} of {comp.questions.length} correct</Text>
        <View style={{ backgroundColor: '#F59E0B20', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 32 }}>
          <Text style={{ color: '#F59E0B', fontWeight: '900', fontSize: 16 }}>+{xpEarned} XP earned!</Text>
        </View>
        <TouchableOpacity style={{ backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 }} onPress={() => startComp(comp.id)}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelected(null)}>
          <Text style={{ color: '#64748B', fontWeight: '600' }}>Back to competitions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.slate100 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ backgroundColor: C.purple, paddingTop: 52, paddingBottom: 20, paddingHorizontal: 18 }}>
        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>COMPETITIONS</Text>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 }}>Challenges</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Compete, earn XP, top the leaderboard</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {COMPETITIONS.map(comp => {
          const isActive = comp.status === 'active';
          const daysLeft = Math.max(0, Math.round((new Date(comp.endDate).getTime() - Date.now()) / 86400000));
          return (
            <View key={comp.id} style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <View style={{ backgroundColor: C.brandLight, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: C.brand }}>{comp.subject}</Text>
                </View>
                <View style={{ backgroundColor: isActive ? C.successBg : C.slate100, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: isActive ? C.success : C.slate500 }}>{isActive ? '🟢 ACTIVE' : '✓ ENDED'}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 17, fontWeight: '900', color: C.slate900, marginBottom: 6 }}>{comp.title}</Text>
              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
                <Text style={{ fontSize: 12, color: C.slate500 }}>👥 {comp.participants} students</Text>
                <Text style={{ fontSize: 12, color: isActive ? C.warning : C.slate500, fontWeight: isActive ? '700' : '400' }}>
                  {isActive ? `⏰ ${daysLeft}d left` : '✓ Completed'}
                </Text>
                <Text style={{ fontSize: 12, color: C.purple, fontWeight: '700' }}>+{comp.questions.length * 20} XP</Text>
              </View>
              {isActive ? (
                <TouchableOpacity style={{ backgroundColor: C.purple, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }} onPress={() => startComp(comp.id)} activeOpacity={0.85}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Start Challenge →</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: C.slate100, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}>
                  <Text style={{ color: C.slate500, fontSize: 14, fontWeight: '700' }}>Competition ended</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
