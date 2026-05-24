import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../utils/design';
import { useStore } from '../../store';
import { chatbotMessage } from '../../utils/aiService';

interface Message { role: 'user' | 'assistant'; content: string }

export default function Chatbot() {
  const { user, chatOpen, setChatOpen } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] ?? 'there'}! How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    const response = await chatbotMessage(user?.role ?? 'student', text, messages.slice(-6));
    setTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  return (
    <>
      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setChatOpen(!chatOpen)} activeOpacity={0.85}>
        <Ionicons name={chatOpen ? 'close' : 'chatbubble-ellipses'} size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Chat panel */}
      {chatOpen && (
        <View style={s.panel}>
          <View style={s.panelHeader}>
            <View style={s.onlineDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.panelTitle}>EduSpark AI</Text>
              <Text style={s.panelSub}>Ask me anything</Text>
            </View>
            <TouchableOpacity onPress={() => setChatOpen(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={18} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={s.messages}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg, i) => (
              <View key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <View style={[s.bubble, msg.role === 'user' ? s.userBubble : s.aiBubble]}>
                  <Text style={[s.bubbleText, msg.role === 'user' && { color: colors.white }]}>
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))}
            {typing && (
              <View style={[s.aiBubble, { alignSelf: 'flex-start' }]}>
                <Text style={[s.bubbleText, { color: colors.gray400, fontStyle: 'italic' }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.inputRow}>
              <TextInput
                style={s.inputField}
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything..."
                placeholderTextColor={colors.gray400}
                onSubmitEditing={send}
                returnKeyType="send"
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[s.sendBtn, { backgroundColor: !input.trim() ? colors.gray200 : colors.brand }]}
                onPress={send}
                disabled={!input.trim() || typing}
                activeOpacity={0.85}
              >
                <Ionicons name="send" size={16} color={!input.trim() ? colors.gray400 : colors.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  panel: {
    position: 'absolute', bottom: 150, right: 16,
    width: 320, height: 400,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    zIndex: 99, overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
    borderWidth: 0.5, borderColor: colors.gray200,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderBottomWidth: 0.5, borderColor: colors.gray100,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  panelTitle: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.gray900 },
  panelSub: { fontSize: typography.xs, color: colors.gray400 },
  messages: { flex: 1, backgroundColor: colors.gray50 },
  bubble: { borderRadius: 14, padding: 10 },
  aiBubble: {
    backgroundColor: colors.white, borderWidth: 0.5,
    borderColor: colors.gray200, borderBottomLeftRadius: 4,
  },
  userBubble: { backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: typography.sm, color: colors.gray800, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 10, borderTopWidth: 0.5, borderColor: colors.gray100,
    backgroundColor: colors.white,
  },
  inputField: {
    flex: 1, backgroundColor: colors.gray100, borderRadius: 18,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: typography.sm, color: colors.gray900, maxHeight: 80,
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
