import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  BookOpen,
  Radio,
  FileText,
  CreditCard,
  Megaphone,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Bot,
} from 'lucide-react-native';
import { directorAiAgent, AgentMessage } from '../services/directorAiAgent';

interface DirectorAiModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_PROMPT_PILLS = [
  { label: '✨ + नया कोर्स बनाएं', prompt: 'Class 10 ke liye naya Topper Course add kar do ₹499 me' },
  { label: '🗑️ सब डमी डेटा खाली करें', prompt: 'Sabhi purane dummy course aur notes khali kar do, mujhe shuru se add karna hai' },
  { label: '🔴 लाइव क्लास शुरू करें', prompt: 'Aaj shaam 7 baje Class 10 Math ka Live Class schedule kar do' },
  { label: '📑 PDF नोट्स जोड़ें', prompt: 'Class 10 Science Chapter 1 ka handwritten notes add kar do' },
  { label: '💳 पेंडिंग फीस अप्रूव करें', prompt: 'Sabhi pending student fees approve kar do' },
  { label: '📢 सभी छात्रों को नोटिस भेजें', prompt: 'Sabhi students ko notice bhej do ki kal subah 8 baje test hoga' },
  { label: '📊 कोचिंग ओवरव्यू रिपोर्ट', prompt: 'Coaching ka overview aur student report dikhao' },
];

export function DirectorAiModal({ visible, onClose }: DirectorAiModalProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'प्रणाम बड़े सर! 🙏\n\nमैं आपका **ICC Director AI Copilot** हूँ। आप मुझे बोलकर या लिखकर जो भी आदेश देंगे, मैं ऐप में वह कार्य तुरंत पूरा कर दूँगा:\n\n• **नया कोर्स जोड़ना** (Class 1 से 12)\n• **लाइव क्लास शेड्यूल करना**\n• **स्टडी नोट्स PDF अपलोड करना**\n• **पेंडिंग फीस अप्रूव करना**\n• **सभी छात्रों को नोटिस भेजना**\n\nबताइए आज क्या कार्य करना है?',
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [visible, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'director',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await directorAiAgent.processCommand(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'क्षमा करें बड़े सर, कार्य पूरा करने में कुछ रुकावट आई। कृपया पुनः प्रयास करें।',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    directorAiAgent.resetConversation();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'ai',
        text: 'चैट रीसेट हो गई है बड़े सर! नया आदेश दें।',
        timestamp: 'Just now',
      },
    ]);
  };

  const handleActionNavigate = (route?: string) => {
    if (!route) return;
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiBadgeIcon}>
                <Bot size={20} color="#2563EB" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.headerTitle}>Director AI Copilot</Text>
                  <View style={styles.onlinePill}>
                    <View style={styles.greenDot} />
                    <Text style={styles.onlineText}>Live</Text>
                  </View>
                </View>
                <Text style={styles.headerSubtitle}>
                  Executive Autonomous Assistant (BADE SIR)
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={handleResetChat}
                style={styles.iconBtn}
                accessibilityLabel="Reset Chat"
              >
                <RotateCcw size={17} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={styles.iconBtn}
                accessibilityLabel="Close"
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Action Suggestion Pills */}
          <View style={styles.pillsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
              {QUICK_PROMPT_PILLS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.pill}
                  onPress={() => handleSend(p.prompt)}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text style={styles.pillText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Thread */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatScroll}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((m) => {
              const isUser = m.sender === 'director';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageRow,
                    isUser ? styles.userRow : styles.aiRow,
                  ]}
                >
                  {!isUser && (
                    <View style={styles.aiAvatar}>
                      <Sparkles size={14} color="#2563EB" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isUser ? styles.userBubbleText : styles.aiBubbleText,
                      ]}
                    >
                      {m.text}
                    </Text>

                    {/* Action Execution Visual Card */}
                    {m.actionResult && (
                      <View style={styles.actionCard}>
                        <View style={styles.actionCardHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={16} color="#059669" />
                            <Text style={styles.actionCardTitle}>{m.actionResult.title}</Text>
                          </View>
                          {m.actionResult.badge && (
                            <View style={styles.actionBadge}>
                              <Text style={styles.actionBadgeText}>{m.actionResult.badge}</Text>
                            </View>
                          )}
                        </View>

                        {m.actionResult.subtitle && (
                          <Text style={styles.actionCardSubtitle}>
                            {m.actionResult.subtitle}
                          </Text>
                        )}

                        {m.actionResult.actionRoute && (
                          <TouchableOpacity
                            style={styles.actionCardBtn}
                            onPress={() => handleActionNavigate(m.actionResult?.actionRoute)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.actionCardBtnText}>
                              {m.actionResult.actionButtonText || 'Open in App'}
                            </Text>
                            <ExternalLink size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <Text
                      style={[
                        styles.timestamp,
                        isUser ? styles.userTimestamp : styles.aiTimestamp,
                      ]}
                    >
                      {m.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.messageRow, styles.aiRow]}>
                <View style={styles.aiAvatar}>
                  <Sparkles size={14} color="#2563EB" />
                </View>
                <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.thinkingText}>बड़े सर के आदेश का पालन किया जा रहा है...</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="बड़े सर, जो काम करवाना है यहाँ लिखें..."
              placeholderTextColor="#94A3B8"
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              editable={!loading}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!input.trim() || loading) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
              activeOpacity={0.8}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiBadgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  pillsContainer: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  pillsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatScroll: {
    padding: 16,
    gap: 14,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    maxWidth: '88%',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#0F2B48',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiBubbleText: {
    color: '#0F172A',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },
  userTimestamp: {
    color: '#94A3B8',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#94A3B8',
    textAlign: 'left',
  },
  actionCard: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  actionBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: '#166534',
  },
  actionCardBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionCardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thinkingText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    fontSize: 13.5,
    color: '#0F172A',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
});
