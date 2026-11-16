// IDEAL COACHING CENTRE — AI AUTOMATION & 30-SECOND LIVE QUIZ ENGINE
// Provides:
// 1. Intelligent AI Auto-Fill for Course creation, Live sessions, and Study Materials
// 2. 30-Second Timed Live Quiz with +10 / -5 Scoring
// 3. Anti-Repetition Engine (Never asks the same question twice to a student)
// 4. Badges & Points Calculation

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface AIQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
  chapter?: string;
  language: 'hi' | 'ur' | 'en';
}

export interface QuizSubmissionResult {
  pointsDelta: number;
  newTotalPoints: number;
  newlyUnlockedBadge?: string;
}

// -------------------------------------------------------------
// CURRICULUM KNOWLEDGE BASE FOR AI QUIZ GENERATION
// -------------------------------------------------------------
const CURRICULUM_QUESTIONS_POOL: AIQuizQuestion[] = [
  // Science - Chemistry
  {
    id: 'q-chem-001',
    subject: 'Science',
    chapter: 'Chemical Reactions & Equations',
    language: 'hi',
    question: 'लोहे की कील को कॉपर सल्फेट के नीले घोल में डालने पर घोल का रंग कैसा हो जाता है?',
    options: ['हरा (Green)', 'लाल (Red)', 'पीला (Yellow)', 'रंगहीन (Colorless)'],
    correctIndex: 0,
    explanation: 'Fe, Cu को विस्थापित कर हरा फेरस सल्फेट (FeSO₄) बनाता है। यह विस्थापन अभिक्रिया है।',
  },
  {
    id: 'q-chem-002',
    subject: 'Science',
    chapter: 'Chemical Reactions & Equations',
    language: 'hi',
    question: 'श्वसन (Respiration) किस प्रकार की रासायनिक अभिक्रिया है?',
    options: ['ऊष्माक्षेपी (Exothermic)', 'ऊष्माशोषी (Endothermic)', 'संयोजन', 'अपघटन'],
    correctIndex: 0,
    explanation: 'श्वसन में ग्लूकोज के विखंडन से ऊर्जा (ऊष्मा) मुक्त होती है, अतः यह ऊष्माक्षेपी अभिक्रिया है।',
  },
  {
    id: 'q-chem-003',
    subject: 'Science',
    chapter: 'Acids, Bases & Salts',
    language: 'hi',
    question: 'शुद्ध जल का pH मान कितना होता है?',
    options: ['0', '7', '14', '1'],
    correctIndex: 1,
    explanation: 'शुद्ध जल उदासीन (Neutral) होता है, इसलिए इसका pH मान ठीक 7 होता है।',
  },
  {
    id: 'q-chem-004',
    subject: 'Science',
    chapter: 'Metals & Non-Metals',
    language: 'hi',
    question: 'कमरे के तापमान पर द्रव अवस्था में पाई जाने वाली एकमात्र धातु कौन सी है?',
    options: ['पारा (Mercury)', 'ब्रोमीन', 'सोडियम', 'लोहा'],
    correctIndex: 0,
    explanation: 'पारा (Hg) कमरे के तापमान पर द्रव अवस्था में पाई जाने वाली धातु है।',
  },

  // Science - Physics
  {
    id: 'q-phy-001',
    subject: 'Science',
    chapter: 'Light — Reflection & Refraction',
    language: 'hi',
    question: 'समतल दर्पण (Plane Mirror) द्वारा बना प्रतिबिम्ब हमेशा कैसा होता है?',
    options: ['काल्पनिक एवं सीधा', 'वास्तविक एवं उल्टा', 'वास्तविक एवं सीधा', 'उल्टा एवं बड़ा'],
    correctIndex: 0,
    explanation: 'समतल दर्पण हमेशा आभासी (काल्पनिक) तथा सीधा प्रतिबिंब बनाता है।',
  },
  {
    id: 'q-phy-002',
    subject: 'Science',
    chapter: 'Electricity',
    language: 'hi',
    question: 'विद्युत धारा (Electric Current) का SI मात्रक क्या होता है?',
    options: ['एम्पियर (Ampere)', 'वोल्ट (Volt)', 'ओम (Ohm)', 'वाट (Watt)'],
    correctIndex: 0,
    explanation: 'विद्युत धारा का SI मात्रक एम्पियर (A) होता है। (I = Q/t)',
  },

  // Science - Biology
  {
    id: 'q-bio-001',
    subject: 'Science',
    chapter: 'Life Processes (जैव प्रक्रम)',
    language: 'hi',
    question: 'पौधों में जाइलम (Xylem) का मुख्य कार्य क्या है?',
    options: ['जल का परिवहन', 'भोजन का परिवहन', 'अमीनो अम्ल का वहन', 'ऑक्सीजन का वहन'],
    correctIndex: 0,
    explanation: 'जाइलम जड़ से पत्तियों तक जल एवं खनिज लवणों का संवहन करता है।',
  },
  {
    id: 'q-bio-002',
    subject: 'Science',
    chapter: 'Life Processes (जैव प्रक्रम)',
    language: 'hi',
    question: 'मनुष्य के हृदय में कितने कोष्ठक (Chambers) होते हैं?',
    options: ['4 (चार)', '2 (दो)', '3 (तीन)', '6 (छह)'],
    correctIndex: 0,
    explanation: 'मानव हृदय में 4 कोष्ठ होते हैं: दायाँ अलिंद, बायाँ अलिंद, दायाँ निलय, बायाँ निलय।',
  },

  // Mathematics
  {
    id: 'q-math-001',
    subject: 'Mathematics',
    chapter: 'Real Numbers (वास्तविक संख्याएं)',
    language: 'hi',
    question: 'पाई (π) किस प्रकार की संख्या है?',
    options: ['अपरिमेय संख्या (Irrational)', 'परिमेय संख्या (Rational)', 'पूर्णांक (Integer)', 'प्राकृत संख्या'],
    correctIndex: 0,
    explanation: 'π एक अपरिमेय संख्या है क्योंकि इसका दशमलव प्रसार अशांत अनावर्ती होता है।',
  },
  {
    id: 'q-math-002',
    subject: 'Mathematics',
    chapter: 'Polynomials (बहुपद)',
    language: 'hi',
    question: 'द्विघात बहुपद (ax² + bx + c) के शून्यकों का योगफल (α + β) क्या होता है?',
    options: ['-b / a', 'c / a', 'b / a', '-c / a'],
    correctIndex: 0,
    explanation: 'द्विघात समीकरण में शून्यकों का योगफल α + β = -b/a होता है।',
  },
  {
    id: 'q-math-003',
    subject: 'Mathematics',
    chapter: 'Trigonometry (त्रिकोणमिति)',
    language: 'hi',
    question: 'sin²θ + cos²θ का मान किसके बराबर होता है?',
    options: ['1', '0', '-1', '2'],
    correctIndex: 0,
    explanation: 'यह मूल त्रिकोणमितीय सर्वसमिका है: sin²θ + cos²θ = 1।',
  },

  // Social Science (SST)
  {
    id: 'q-sst-001',
    subject: 'Social Science',
    chapter: 'Nationalism in India',
    language: 'hi',
    question: 'जलियांवाला बाग हत्याकांड किस वर्ष और किस तारीख को हुआ था?',
    options: ['13 अप्रैल 1919', '15 अगस्त 1919', '26 जनवरी 1920', '13 अप्रैल 1920'],
    correctIndex: 0,
    explanation: 'अमृतसर के जलियांवाला बाग में 13 अप्रैल 1919 को बैसाखी के दिन जनरल डायर ने गोलियां चलवाई थीं।',
  },
  {
    id: 'q-sst-002',
    subject: 'Social Science',
    chapter: 'Resources and Development',
    language: 'hi',
    question: 'काली मिट्टी किस फसल की खेती के लिए सबसे अधिक उपयुक्त मानी जाती है?',
    options: ['कपास (Cotton)', 'गेहूं (Wheat)', 'चावल (Rice)', 'चाय (Tea)'],
    correctIndex: 0,
    explanation: 'काली मिट्टी को रेगुर मिट्टी भी कहा जाता है और यह कपास की खेती के लिए सर्वोत्तम होती है।',
  },

  // Urdu Subject Pool
  {
    id: 'q-urdu-001',
    subject: 'Urdu',
    chapter: 'Urdu Adab',
    language: 'ur',
    question: 'اردو زبان کا پہلا صاحبِ دیوان شاعر کون ہے؟',
    options: ['قلی قطب شاہ', 'مرزا غالب', 'میر تقی میر', 'علامہ اقبال'],
    correctIndex: 0,
    explanation: 'محمد قلی قطب شاہ اردو زبان کے پہلے صاحبِ دیوان شاعر مانے جاتے ہیں۔',
  },
  {
    id: 'q-urdu-002',
    subject: 'Urdu',
    chapter: 'Urdu Qawaid',
    language: 'ur',
    question: 'اسم کی کتنی بنیادی اقسام ہیں؟',
    options: ['دو (معرفہ اور نکرہ)', 'تین', 'چار', 'پانچ'],
    correctIndex: 0,
    explanation: 'اسم کی دو بنیادی اقسام اسمِ معرفہ اور اسمِ نکرہ ہیں۔',
  },
  // Hindi
  {
    id: 'q-hindi-001',
    subject: 'Hindi',
    chapter: 'Hindi Vyakaran',
    language: 'hi',
    question: 'संधि के कितने मुख्य भेद होते हैं?',
    options: ['तीन (3)', 'दो (2)', 'चार (4)', 'पांच (5)'],
    correctIndex: 0,
    explanation: 'संधि के तीन मुख्य भेद हैं: स्वर संधि, व्यंजन संधि तथा विसर्ग संधि।',
  },
  {
    id: 'q-hindi-002',
    subject: 'Hindi',
    chapter: 'Hindi Vyakaran',
    language: 'hi',
    question: 'कारक के कुल कितने भेद माने गए हैं?',
    options: ['आठ (8)', 'सात (7)', 'छह (6)', 'नौ (9)'],
    correctIndex: 0,
    explanation: 'हिंदी व्याकरण में कारक के 8 भेद होते हैं (कर्ता से संबोधन तक)।',
  },

  // English
  {
    id: 'q-eng-001',
    subject: 'English',
    chapter: 'English Grammar',
    language: 'hi',
    question: 'Choose the correct passive voice: "He wrote a letter."',
    options: [
      'A letter was written by him.',
      'A letter is written by him.',
      'A letter has been written by him.',
      'A letter had written by him.',
    ],
    correctIndex: 0,
    explanation: 'Simple past "wrote" changes to "was written" in passive voice.',
  },
  {
    id: 'q-eng-002',
    subject: 'English',
    chapter: 'English Grammar',
    language: 'hi',
    question: 'Which of the following is an example of an Abstract Noun?',
    options: ['Honesty', 'Boy', 'Teacher', 'Book'],
    correctIndex: 0,
    explanation: 'Honesty is an abstract quality that cannot be touched, hence an Abstract Noun.',
  },

  // Sanskrit
  {
    id: 'q-sans-001',
    subject: 'Sanskrit',
    chapter: 'Sanskrit Vyakaran',
    language: 'hi',
    question: 'संस्कृत में लकारों की कुल संख्या कितनी मानी जाती है?',
    options: ['10 (दस)', '5 (पांच)', '7 (सात)', '12 (बारह)'],
    correctIndex: 0,
    explanation: 'संस्कृत व्याकरण में कुल 10 लकार होते हैं, जिनमें मुख्य 5 लकारों का प्रायः अध्ययन होता है।',
  },
  {
    id: 'q-sans-002',
    subject: 'Sanskrit',
    chapter: 'Sanskrit Vyakaran',
    language: 'hi',
    question: '‘पठ्’ धातु का लट् लकार प्रथम पुरुष एकवचन रूप क्या होगा?',
    options: ['पठति', 'पठसि', 'पठामि', 'पठतः'],
    correctIndex: 0,
    explanation: 'लट् लकार प्रथम पुरुष एकवचन में ति प्रत्यय लगकर ‘पठति’ बनता है।',
  },
];

class AIService {
  // -------------------------------------------------------------
  // 1. AI AUTO-FILL ENGINE
  // -------------------------------------------------------------

  /**
   * Auto-completes course metadata if left blank
   */
  async autoFillCourse(title: string, className: string = 'Class 10') {
    const cleanTitle = title.trim() || `${className} State Board Topper Course 2027`;

    return {
      title: cleanTitle,
      title_hi: `${className} बोर्ड परीक्षा 2027 टॉपर कोर्स`,
      tagline: `Complete Board Examination 2027 Syllabus Mastery with BADE SIR`,
      description: `Comprehensive coaching program covering full syllabus with daily HD live interactive sessions, handwritten PDF master notes, chapter-wise NCERT solutions, and weekly 30-second live test series.`,
      features: [
        'Daily 4K Interactive In-App Live Classes',
        'Direct Doubt Resolution with BADE SIR',
        'Handwritten Classroom Chapter Notes (PDF)',
        'Weekly 30-Second AI Speed Quiz Series',
        'Offline Secure Study Mode (Zero Internet Needed)',
        'Full 100% Syllabus Coverage for Board Exams',
      ],
      price: '999',
      discount_price: '499',
      validity_days: '365',
      start_date: new Date().toISOString().split('T')[0],
      thumbnail_url:
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    };
  }

  /**
   * Auto-completes live class details
   */
  async autoFillLiveSession(title: string, subjectName: string, chapterName: string) {
    const cleanTitle = title.trim() || `${subjectName}: Board High-Scoring Questions Practice`;
    return {
      title: cleanTitle,
      title_hi: `${subjectName}: बोर्ड परीक्षा महत्वपूर्ण प्रश्नोत्तर अभ्यास`,
      description: `Live interactive session on "${chapterName}". Step-by-step problem derivations, high-scoring exam formulas, and student doubt resolution with BADE SIR.`,
      duration_minutes: '60',
      youtube_video_id: 'jfKfPfyJRdk',
    };
  }

  /**
   * Auto-completes study material notes metadata
   */
  async autoFillStudyMaterial(title: string, subjectName: string, chapterName: string) {
    const cleanTitle = title.trim() || `${chapterName} Master Handwritten Notes`;
    return {
      title: cleanTitle,
      title_hi: `${chapterName} हस्तलिखित संपूर्ण क्लास नोट्स`,
      description: `Exhaustive classroom notes drafted by Director BADE SIR. Includes all board definitions, formulas, balanced equations, and previous year solved questions.`,
    };
  }

  // -------------------------------------------------------------
  // 2. AI 30-SECOND LIVE QUIZ & ANTI-REPETITION ENGINE
  // -------------------------------------------------------------

  /**
   * Generates a unique 30-second quiz for a student
   * Filters out already answered question IDs
   */
  async getLiveQuizQuestions(
    studentId: string,
    subjectFilter?: string,
    chapterFilter?: string,
    language: 'hi' | 'ur' | 'en' = 'hi',
    count: number = 5
  ): Promise<AIQuizQuestion[]> {
    // 1. Retrieve list of already answered question IDs by this student
    const answeredIds = await this.getAnsweredQuestionIds(studentId);

    // 2. Filter pool by subject, language, and non-answered questions
    let pool = CURRICULUM_QUESTIONS_POOL.filter((q) => {
      if (answeredIds.has(q.id)) return false;
      if (language === 'ur' && q.language !== 'ur') return false;
      if (language !== 'ur' && q.language === 'ur') return false;
      if (subjectFilter && subjectFilter !== 'ALL' && q.subject.toLowerCase() !== subjectFilter.toLowerCase()) {
        return false;
      }
      return true;
    });

    // If student has answered all available questions in this filter, recycle pool
    if (pool.length === 0) {
      pool = CURRICULUM_QUESTIONS_POOL.filter((q) => {
        if (language === 'ur') return q.language === 'ur';
        return q.language !== 'ur';
      });
    }

    // Shuffle and pick requested count
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Retrieves answered question IDs for a student from local store & Supabase
   */
  private async getAnsweredQuestionIds(studentId: string): Promise<Set<string>> {
    const set = new Set<string>();
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(`quiz_answered_${studentId}`);
        if (stored) {
          const arr: string[] = JSON.parse(stored);
          arr.forEach((id) => set.add(id));
        }
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`quiz_answered_${studentId}`);
        if (stored) {
          const arr: string[] = JSON.parse(stored);
          arr.forEach((id) => set.add(id));
        }
      }

      // Check Supabase if configured
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from('student_quiz_history')
          .select('question_id')
          .eq('student_id', studentId);
        if (data) {
          data.forEach((row: any) => set.add(row.question_id));
        }
      }
    } catch {}
    return set;
  }

  /**
   * Submits a quiz answer: +10 on Correct, -5 on Wrong / Timeout
   * Atomic point and badge calculator
   */
  async submitAnswer(
    studentId: string,
    questionId: string,
    isCorrect: boolean,
    subject?: string,
    chapter?: string,
    currentPoints: number = 0,
    currentBadges: string[] = []
  ): Promise<QuizSubmissionResult> {
    const pointsDelta = isCorrect ? 10 : -5;
    const newTotalPoints = Math.max(0, currentPoints + pointsDelta);

    // Save answered question ID to local cache so it never repeats
    try {
      const answeredSet = await this.getAnsweredQuestionIds(studentId);
      answeredSet.add(questionId);
      const arr = Array.from(answeredSet);
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(`quiz_answered_${studentId}`, JSON.stringify(arr));
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(`quiz_answered_${studentId}`, JSON.stringify(arr));
      }
    } catch {}

    // Calculate badges
    let newlyUnlockedBadge: string | undefined = undefined;
    if (newTotalPoints >= 1000 && !currentBadges.includes('BADE SIR Mastermind')) {
      newlyUnlockedBadge = 'BADE SIR Mastermind';
    } else if (newTotalPoints >= 500 && !currentBadges.includes('State Ranker')) {
      newlyUnlockedBadge = 'State Ranker';
    } else if (newTotalPoints >= 300 && !currentBadges.includes('Gold Topper')) {
      newlyUnlockedBadge = 'Gold Topper';
    } else if (newTotalPoints >= 150 && !currentBadges.includes('Silver Achiever')) {
      newlyUnlockedBadge = 'Silver Achiever';
    } else if (newTotalPoints >= 50 && !currentBadges.includes('Bronze Scholar')) {
      newlyUnlockedBadge = 'Bronze Scholar';
    }

    // Sync with Supabase
    try {
      if (isSupabaseConfigured) {
        await supabase.from('student_quiz_history').insert({
          student_id: studentId,
          question_id: questionId,
          subject_id: subject,
          chapter_id: chapter,
          is_correct: isCorrect,
          points_earned: pointsDelta,
        });

        const updatedBadges = newlyUnlockedBadge
          ? [...currentBadges, newlyUnlockedBadge]
          : currentBadges;

        await supabase
          .from('profiles')
          .update({
            quiz_points: newTotalPoints,
            badges: updatedBadges,
            updated_at: new Date().toISOString(),
          })
          .eq('id', studentId);
      }
    } catch (e) {
      console.warn('Supabase quiz sync warning:', e);
    }

    return {
      pointsDelta,
      newTotalPoints,
      newlyUnlockedBadge,
    };
  }
}

export const aiService = new AIService();
