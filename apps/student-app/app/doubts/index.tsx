import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/useAuthStore';
import { CoachingHeader } from '../../src/components/CoachingHeader';
import { askGrokGuruji } from '../../src/services/grokAi';
import {
  Sparkles,
  Bot,
  Send,
  HelpCircle,
  GraduationCap,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react-native';

interface DoubtItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  status: 'open' | 'resolved';
  answer?: string;
  answeredBy?: string;
}

interface AiChatEntry {
  id: string;
  question: string;
  answer: string;
  model: string;
  time: string;
}

export default function StudentDoubtsScreen() {
  const { user, selectedBoard } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'faculty'>('ai');

  // AI Guruji State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<AiChatEntry[]>([
    {
      id: 'ai-init',
      question: 'विस्थापन एवं द्विविस्थापन अभिक्रिया में क्या मुख्य अंतर है?',
      answer: `🔹 **विस्थापन एवं द्विविस्थापन अभिक्रिया में अंतर**:

1. **विस्थापन अभिक्रिया (Displacement Reaction)**:
- इसमें अधिक क्रियाशील धातु कम क्रियाशील धातु को उसके लवण के विलयन से विस्थापित कर देती है।
- **समीकरण**: Fe + CuSO4 → FeSO4 + Cu (लोहा कॉपर को हटा देता है)

2. **द्विविस्थापन अभिक्रिया (Double Displacement Reaction)**:
- इसमें दो यौगिकों के बीच आयनों का परस्पर आदान-प्रदान (Exchange of Ions) होता है।
- **समीकरण**: Na2SO4 + BaCl2 → BaSO4↓ + 2NaCl (सफेद अवक्षेप बनता है)

💡 **बोर्ड परीक्षा टिप**: परीक्षा में तीर (↓) का निशान अवक्षेप (Precipitate) दर्शाने के लिए अवश्य लगाएं।`,
      model: 'Grok-AI (ICC Engine)',
      time: 'Just now',
    },
  ]);

  // Faculty Doubts State
  const [doubts, setDoubts] = useState<DoubtItem[]>([
    {
      id: 'd-1',
      subject: 'Science (विज्ञान)',
      title: 'विस्थापन एवं द्विविस्थापन अभिक्रिया में क्या अंतर है?',
      description: 'सर, कृपया उदाहरण सहित समझाएं कि कॉपर सल्फेट और आयरन की क्रिया विस्थापन क्यों है?',
      status: 'resolved',
      answer: 'विस्थापन अभिक्रिया में अधिक क्रियाशील तत्व कम क्रियाशील तत्व को उसके यौगिक से विस्थापित करता है। Fe + CuSO4 -> FeSO4 + Cu। जबकि द्विविस्थापन में आयनों का आदान-प्रदान होता है।',
      answeredBy: 'Dr. S. N. Mishra (Chemistry Faculty)',
    },
    {
      id: 'd-2',
      subject: 'Mathematics (गणित)',
      title: 'यूक्लिड विभाजन प्रमेयिका द्वारा HCF ज्ञात करने में शेषफल शून्य न आने पर क्या करें?',
      description: 'कृपया 135 और 225 के HCF का चरणबद्ध हल बताएं।',
      status: 'open',
    },
  ]);

  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAskAi = async (customQ?: string) => {
    const q = customQ || aiQuestion.trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    try {
      const res = await askGrokGuruji(q, 'General', selectedBoard);
      const newEntry: AiChatEntry = {
        id: `ai-${Date.now()}`,
        question: q,
        answer: res.answer,
        model: res.model,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setAiHistory([newEntry, ...aiHistory]);
      setAiQuestion('');
    } catch {
      Alert.alert('Error', 'Unable to get response from Grok AI right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePostDoubt = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert('Error', 'Please enter a title and question details.');
      return;
    }
    const created: DoubtItem = {
      id: `d-${Date.now()}`,
      subject: 'Science',
      title: newTitle,
      description: newDesc,
      status: 'open',
    };
    setDoubts([created, ...doubts]);
    setIsAsking(false);
    setNewTitle('');
    setNewDesc('');
    Alert.alert(
      'Success',
      'Your doubt has been submitted to faculty. You will receive an answer shortly.'
    );
  };

  const quickPrompts = [
    "Explain Ohm's Law with formula",
    "Newton's 3 Laws of Motion",
    "Snell's Law of Refraction",
    "Euclid Division Lemma for HCF",
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Branded Header */}
      <CoachingHeader />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ai' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ai')}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color={activeTab === 'ai' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'ai' && styles.tabBtnTextActive]}>
            AI Guruji (Grok AI) ⚡
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'faculty' && styles.tabBtnActive]}
          onPress={() => setActiveTab('faculty')}
          activeOpacity={0.8}
        >
          <HelpCircle size={14} color={activeTab === 'faculty' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'faculty' && styles.tabBtnTextActive]}>
            Faculty Doubts
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === 'ai' ? (
          /* ========================================================= */
          /* 1. ICC AI GURUJI (GROK AI ENGINE)                         */
          /* ========================================================= */
          <View>
            {/* Banner */}
            <View style={styles.aiBanner}>
              <View style={styles.aiBannerHeader}>
                <View style={styles.aiAvatarBox}>
                  <Bot size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiBannerTitle}>ICC AI Guruji (Grok AI)</Text>
                  <Text style={styles.aiBannerSub}>
                    24/7 Step-by-step doubt clearing for {selectedBoard === 'BSEB' ? 'Bihar Board (BSEB)' : 'Jharkhand Board (JAC)'}
                  </Text>
                </View>
              </View>

              {/* Quick Prompts */}
              <Text style={styles.quickPromptLabel}>Try asking about:</Text>
              <View style={styles.chipRow}>
                {quickPrompts.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleAskAi(p)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Input Box */}
            <View style={styles.aiInputCard}>
              <TextInput
                style={styles.aiInput}
                value={aiQuestion}
                onChangeText={setAiQuestion}
                placeholder="Type your question or doubt in Hindi/English..."
                placeholderTextColor="#94A3B8"
                multiline
              />
              <TouchableOpacity
                style={[styles.askAiBtn, (!aiQuestion.trim() || aiLoading) && styles.askAiBtnDisabled]}
                onPress={() => handleAskAi()}
                disabled={!aiQuestion.trim() || aiLoading}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Sparkles size={16} color="#FFFFFF" />
                    <Text style={styles.askAiBtnText}>Ask AI Guruji</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* AI Solutions Stream */}
            <View style={styles.aiStream}>
              <Text style={styles.sectionHeading}>Instant AI Explanations</Text>
              {aiHistory.map((item) => (
                <View key={item.id} style={styles.solutionCard}>
                  <View style={styles.qHeader}>
                    <Text style={styles.qTitle}>❓ {item.question}</Text>
                    <View style={styles.modelBadge}>
                      <Text style={styles.modelBadgeText}>{item.model}</Text>
                    </View>
                  </View>

                  <View style={styles.solutionDivider} />

                  <Text style={styles.solutionText}>{item.answer}</Text>
                  <Text style={styles.timestamp}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* 2. FACULTY DOUBTS TAB                                     */
          /* ========================================================= */
          <View>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageTitle}>Faculty Doubt Clearance</Text>
                <Text style={styles.pageSub}>
                  Submitted questions reviewed by ICC teachers
                </Text>
              </View>
              <TouchableOpacity
                style={styles.askBtn}
                onPress={() => setIsAsking(!isAsking)}
              >
                <Text style={styles.askBtnText}>
                  {isAsking ? '✕ Cancel' : '+ Ask Faculty'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Doubt Form */}
            {isAsking && (
              <View style={styles.askCard}>
                <Text style={styles.askHeading}>Submit a Doubt to Teachers</Text>
                <TextInput
                  style={styles.input}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Short title of question (e.g., Ohm's Law derivation)"
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                  multiline
                  value={newDesc}
                  onChangeText={setNewDesc}
                  placeholder="Describe your doubt in detail..."
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity style={styles.postBtn} onPress={handlePostDoubt}>
                  <Text style={styles.postBtnText}>Submit Doubt to Faculty</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Doubts List */}
            <View style={styles.list}>
              {doubts.map((d) => (
                <View key={d.id} style={styles.doubtCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.subjectTag}>{d.subject}</Text>
                    {d.status === 'resolved' ? (
                      <Text style={styles.resolvedTag}>✓ Resolved</Text>
                    ) : (
                      <Text style={styles.openTag}>⏳ Under Review</Text>
                    )}
                  </View>

                  <Text style={styles.doubtTitle}>{d.title}</Text>
                  <Text style={styles.doubtDesc}>{d.description}</Text>

                  {d.answer && (
                    <View style={styles.answerBox}>
                      <Text style={styles.facultyName}>👨‍🏫 {d.answeredBy}:</Text>
                      <Text style={styles.answerText}>{d.answer}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  aiBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiBannerSub: {
    fontSize: 11,
    color: '#C7D2FE',
    marginTop: 2,
  },
  quickPromptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    marginTop: 14,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    fontSize: 11,
    color: '#E0E7FF',
    fontWeight: '500',
  },
  aiInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 10,
  },
  aiInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  askAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
  },
  askAiBtnDisabled: {
    opacity: 0.5,
  },
  askAiBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiStream: {
    gap: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  solutionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  qTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  modelBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modelBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  solutionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  solutionText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: '#94A3B8',
    alignSelf: 'flex-end',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  pageSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  askBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  askBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  askCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 10,
  },
  askHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  postBtn: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  postBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    gap: 14,
  },
  doubtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resolvedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  openTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  doubtTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  doubtDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  answerBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  facultyName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 12,
    color: '#14532D',
    lineHeight: 18,
  },
});
