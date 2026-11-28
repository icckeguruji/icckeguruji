import { SenderIdentity } from './accountLinker.js';
import { supabase } from './supabaseClient.js';
import * as PublicTools from './tools/publicTools.js';
import * as StudentTools from './tools/studentTools.js';
import * as AdminTools from './tools/adminTools.js';

interface AiProcessOptions {
  senderJid: string;
  senderText: string;
  identity: SenderIdentity;
  pushName?: string;
}

// Per-user short conversation history (in-memory, max 6 turns)
const conversationMemory = new Map<string, Array<{ role: 'user' | 'assistant'; content: string }>>();
let cachedSnapshot: any = null;
let snapshotFetchedAt = 0;

function detectLanguageMode(text: string): 'hindi' | 'hinglish' | 'english' {
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  const lower = text.toLowerCase();
  const hinglishWords = [
    'kya', 'hai', 'hain', 'kaun', 'kab', 'kahan', 'kaise', 'kitna', 'kitni',
    'mera', 'meri', 'mere', 'mujhe', 'aap', 'tum', 'chahiye', 'batao', 'bataiye',
    'namaste', 'salam', 'assalam', 'shukriya', 'dhanyawad', 'padhai', 'paisa',
    'rupay', 'karna', 'kare', 'karen', 'milega', 'milegi', 'chalu', 'band', 'theek',
    'thik', 'ji', 'haan', 'nahi', 'nhi', 'bhai', 'sir', 'zoya', 'madam', 'didi',
  ];
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  if (tokens.some((t) => hinglishWords.includes(t))) return 'hinglish';
  return 'english';
}

async function fetchLiveInstituteSnapshot() {
  if (cachedSnapshot && Date.now() - snapshotFetchedAt < 60000) {
    return cachedSnapshot;
  }
  try {
    const [coursesRes, subjectsRes, liveRes, lecRes, matRes, psRes] = await Promise.all([
      supabase.from('courses').select('id, title, title_hi, class_name, price, discount_price, validity_days, is_free, is_published').eq('is_published', true).order('created_at', { ascending: false }),
      supabase.from('subjects').select('id, name, name_hi, course_id').order('display_order', { ascending: true }),
      supabase.from('live_classes').select('id, title, status, scheduled_at, duration_minutes, course_id').order('scheduled_at', { ascending: false }).limit(8),
      supabase.from('recorded_lectures').select('id, title, course_id').limit(15),
      supabase.from('study_materials').select('id, title, material_type, is_free').limit(15),
      supabase.from('platform_settings').select('key, value').in('key', ['teachers_list', 'app_update_config']),
    ]);

    const courses = coursesRes.data || [];
    const subjects = subjectsRes.data || [];
    const liveClasses = liveRes.data || [];
    const lectures = lecRes.data || [];
    const materials = matRes.data || [];
    const settingsMap: Record<string, any> = {};
    (psRes.data || []).forEach((row: any) => {
      settingsMap[row.key] = row.value;
    });

    const snapshot = {
      courses,
      subjects,
      liveClasses,
      lecturesCount: lectures.length,
      materialsCount: materials.length,
      teachers: Array.isArray(settingsMap.teachers_list) ? settingsMap.teachers_list : [],
      appConfig: settingsMap.app_update_config || {
        latest_version: '1.0.3',
        apk_download_url: 'https://icconline.vercel.app/api/download-apk',
      },
    };
    cachedSnapshot = snapshot;
    snapshotFetchedAt = Date.now();
    return snapshot;
  } catch {
    return {
      courses: [],
      subjects: [],
      liveClasses: [],
      lecturesCount: 0,
      materialsCount: 0,
      teachers: [],
      appConfig: { latest_version: '1.0.3', apk_download_url: 'https://icconline.vercel.app/api/download-apk' },
    };
  }
}

async function askMissZoyaLLM(
  senderJid: string,
  text: string,
  langMode: 'hindi' | 'hinglish' | 'english',
  systemContext: string
): Promise<string | null> {
  const apiKey = (
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    ''
  ).trim();
  if (!apiKey || apiKey === 'xai-your-api-key') return null;

  const isGroq = apiKey.startsWith('gsk_');
  const endpoint = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.x.ai/v1/chat/completions';
  const model = isGroq ? 'llama-3.1-8b-instant' : 'grok-beta';

  const history = conversationMemory.get(senderJid) || [];
  const langInstruction =
    langMode === 'english'
      ? 'The user is speaking in English. Reply warmly, politely, and clearly in natural English.'
      : langMode === 'hindi'
      ? 'The user is writing in Hindi. Reply warmly, respectfully, and lovingly in clean Hindi (Devanagari) with helpful formatting.'
      : 'The user is speaking in Hinglish (Hindi written in English script). Reply warmly, respectfully ("Aap / Ji"), and lovingly in natural Hinglish!';

  const systemPrompt = `You are **Miss Zoya**, the warm, loving, intelligent, and super helpful official AI Assistant of **IDEAL COACHING CENTRE (ICC)**, directed by **BADE SIR** (Sarotiya, Mahagama, Godda, Jharkhand).
Your personality:
- Always greet warmly on greetings ("Namaste / Assalam-o-Alaikum! Main Miss Zoya hoon 🌸, IDEAL COACHING CENTRE mein aapka dil se swagat hai!").
- Speak politely, affectionately, and concisely—use clean WhatsApp formatting (*bold*, bullet points, emojis).
- ${langInstruction}
- Answer strictly using the LIVE DATA provided below. Never invent fake courses, fees, or dates.
- If the user asks about personal enrolled data and is NOT linked yet, politely guide them to link their WhatsApp from Student App -> Profile -> Link WhatsApp Account (#LINK CODE).

LIVE WEBSITE, APP & DASHBOARD DATA:
${systemContext}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6),
          { role: 'user', content: text },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) return null;

    const updated = [...history, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: reply }].slice(-6);
    conversationMemory.set(senderJid, updated);
    return reply;
  } catch {
    return null;
  }
}

export async function processAiMessage({
  senderJid,
  senderText,
  identity,
  pushName,
}: AiProcessOptions): Promise<string> {
  const text = senderText.trim();
  const lower = text.toLowerCase();
  const langMode = detectLanguageMode(text);
  const displayName = identity.isLinked ? identity.userName : (pushName || 'Dost');

  const coaching = PublicTools.getCoachingInfo();
  const snapshot = await fetchLiveInstituteSnapshot();

  const liveCoursesText = snapshot.courses.length
    ? snapshot.courses
        .map(
          (c: any) =>
            `- ${c.title} (${c.class_name || 'Board'}): Fee ₹${c.discount_price || c.price} (MRP ₹${c.price}), Validity ${c.validity_days || 365} days`
        )
        .join('\n')
    : 'Courses are available at https://icconline.vercel.app/courses';

  const liveSessionsText = snapshot.liveClasses.length
    ? snapshot.liveClasses
        .slice(0, 5)
        .map(
          (l: any) =>
            `- ${l.title} [${l.status?.toUpperCase()}] at ${new Date(l.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
        )
        .join('\n')
    : 'No live classes scheduled right now.';

  const subjectsText = snapshot.subjects.length
    ? snapshot.subjects.slice(0, 15).map((s: any) => s.name).join(', ')
    : 'Mathematics, Science (Physics, Chemistry, Biology), Social Science (History, Geography, Civics, Economics), English, Hindi';

  let personalContext = 'User is a public visitor (not linked yet).';
  if (identity.isLinked && identity.userId) {
    personalContext = `Linked User: ${identity.userName} (Role: ${identity.userRole})`;
    if (identity.userRole === 'student') {
      const [pays, lives] = await Promise.all([
        StudentTools.getStudentPayments(identity.userId),
        StudentTools.getStudentLiveClasses(identity.userId),
      ]);
      personalContext += `\nLatest Payments: ${JSON.stringify(pays.slice(0, 2))}\nUpcoming Student Live Classes: ${JSON.stringify(lives.slice(0, 3))}`;
    }
  }

  const systemContext = `Institute: ${coaching.instituteName}
Director: ${coaching.director}
Contact: ${coaching.contactNumber}
Address: ${coaching.address}
Official UPI ID: ${coaching.upiId}
Website: https://icconline.vercel.app
Android App Download Page: https://icconline.vercel.app/download-app
Direct APK v${snapshot.appConfig?.latest_version || '1.0.3'}: ${snapshot.appConfig?.apk_download_url || 'https://icconline.vercel.app/api/download-apk'}
Developer (only mention if asked who made the app/website): Muzaffar Iqbal Ishaati (9934215013)

LIVE COURSES:
${liveCoursesText}

SUBJECTS:
${subjectsText}

LIVE & RECENT CLASSES:
${liveSessionsText}

TOTAL CONTENT: ${snapshot.lecturesCount}+ Recorded Video Lectures, ${snapshot.materialsCount}+ PDF Study Notes.

USER STATUS:
${personalContext}`;

  // 1. Try LLM-powered Miss Zoya first
  const llmReply = await askMissZoyaLLM(senderJid, text, langMode, systemContext);
  if (llmReply) {
    return llmReply;
  }

  // 2. Smart Bilingual Rule-Based Fallback (Miss Zoya)
  const isGreeting = /^(hi|hello|hey|hlo|namaste|salam|assalam|good morning|good evening|good afternoon|zoya|miss zoya)\b/i.test(lower);
  if (isGreeting) {
    if (langMode === 'english') {
      return `🌸 *Welcome to IDEAL COACHING CENTRE (ICC)!*\n\nHello *${displayName}*! I am *Miss Zoya*, your friendly AI Assistant. 😊\n\nI can help you with:\n📚 *Live Courses & Fees*\n🔴 *Live Class Schedule*\n📝 *Admission & UPI Enrollment*\n📲 *Android App Download Link*\n\nHow may I help you today?`;
    }
    return `🌸 *IDEAL COACHING CENTRE (ICC) में आपका दिल से स्वागत है!*\n\nनमस्ते / अस्सलाम-ओ-अलैकुम *${displayName}* जी! 😊 मैं *Miss Zoya* हूँ, आपकी AI असिस्टेंट।\n\nमैं आपकी इन सभी चीज़ों में मदद कर सकती हूँ:\n📚 *कोर्स और फीस की पूरी जानकारी*\n🔴 *लाइव क्लास का समय*\n📝 *एडमिशन / Enroll करने का तरीका*\n📲 *Android App डाउनलोड लिंक*\n\nबताइए, आज मैं आपकी क्या मदद करूँ?`;
  }

  if (lower.includes('contact') || lower.includes('address') || lower.includes('kahan') || lower.includes('location') || lower.includes('bade sir') || lower.includes('number')) {
    if (langMode === 'english') {
      return `📍 *IDEAL COACHING CENTRE (ICC)*\n👩‍💼 *Miss Zoya here to help!*\n\n👨‍🏫 Director: *BADE SIR*\n📞 Helpline: *${coaching.contactNumber}*\n🏢 Address: *${coaching.address}*\n🎯 Boards: BSEB (Bihar) & JAC (Jharkhand)\n🌐 Website: https://icconline.vercel.app`;
    }
    return `📍 *आइडियल कोचिंग सेंटर (ICC)*\n👩‍💼 *Miss Zoya आपकी सेवा में!*\n\n👨‍🏫 डायरेक्टर: *BADE SIR*\n📞 संपर्क नंबर: *${coaching.contactNumber}*\n🏢 पता: सरोतिया, महागामा, गोड्डा, झारखंड 814165\n🌐 वेबसाइट: https://icconline.vercel.app\n\nकोई और जानकारी चाहिए तो बेझिझक पूछिए! 😊`;
  }

  if (lower.includes('app') || lower.includes('apk') || lower.includes('download')) {
    if (langMode === 'english') {
      return `📲 *ICC Official Android App (v${snapshot.appConfig?.latest_version || '1.0.3'})*\n\nDownload our Student App for Live Classes, Recorded Lectures, Handwritten PDFs & AI Quizzes:\n🔗 Download Page: https://icconline.vercel.app/download-app\n📦 Direct APK: https://icconline.vercel.app/api/download-apk`;
    }
    return `📲 *ICC ऑफिशियल Android App (v${snapshot.appConfig?.latest_version || '1.0.3'})*\n\nलाइव क्लास, रिकॉर्डेड वीडियो, PDF नोट्स और AI क्विज़ के लिए हमारा ऐप डाउनलोड करें:\n🔗 डाउनलोड पेज: https://icconline.vercel.app/download-app\n📦 डायरेक्ट APK: https://icconline.vercel.app/api/download-apk\n\nडाउनलोड करने में कोई दिक्कत आए तो मुझे बताइएगा! 🌸`;
  }

  if (lower.includes('course') || lower.includes('fee') || lower.includes('price') || lower.includes('paisa') || lower.includes('kitna') || lower.includes('class') || lower.includes('subject')) {
    const courseLines = snapshot.courses.length
      ? snapshot.courses.map((c: any) => `🎓 *${c.title}*\n   💰 Fee: ₹${c.discount_price || c.price} (Validity: ${c.validity_days || 365} Days)`).join('\n\n')
      : 'Courses are live on https://icconline.vercel.app/courses';

    if (langMode === 'english') {
      return `📚 *Live Courses at IDEAL COACHING CENTRE:*\n\n${courseLines}\n\n💳 Official UPI: \`${coaching.upiId}\`\n🌐 Enroll online: https://icconline.vercel.app/courses\n\nLet me know which class you are in so I can guide you! 😊`;
    }
    return `📚 *IDEAL COACHING CENTRE — लाइव कोर्सेज और फीस:*\n\n${courseLines}\n\n💳 *आधिकारिक UPI ID:* \`${coaching.upiId}\`\n🌐 ऑनलाइन Enroll करें: https://icconline.vercel.app/courses\n\nआप किस क्लास में हैं? बताइए, मैं आपको सबसे सही बैच सजेस्ट करूँगी! 🌸`;
  }

  if (lower.includes('live') || lower.includes('schedule') || lower.includes('kab')) {
    const liveNow = snapshot.liveClasses.filter((l: any) => l.status === 'live' || l.status === 'scheduled');
    if (liveNow.length > 0) {
      const list = liveNow.slice(0, 4).map((l: any) => `🔴 *${l.title}* (${l.status.toUpperCase()})\n   ⏰ ${new Date(l.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`).join('\n\n');
      return langMode === 'english'
        ? `📡 *Live & Upcoming Classes:*\n\n${list}\n\nJoin inside the ICC Student App!`
        : `📡 *लाइव और आने वाली क्लासेस:*\n\n${list}\n\nआप इन्हें ICC Student App के *Live* टैब में देख सकते हैं! 🌸`;
    }
    return langMode === 'english'
      ? `📅 No live class is running at this exact moment, *${displayName}*. You can watch all recorded lectures & PDF notes anytime in the ICC App!`
      : `📅 अभी इस समय कोई लाइव क्लास नहीं चल रही है, *${displayName}* जी। जब भी *BADE SIR* लाइव आएंगे, आपको तुरंत नोटिफिकेशन मिल जाएगा! 🌸`;
  }

  if (lower.includes('enroll') || lower.includes('admission') || lower.includes('join')) {
    if (langMode === 'english') {
      return `📝 *Easy Enrollment Steps (IDEAL COACHING CENTRE):*\n1. Visit https://icconline.vercel.app/courses or open the ICC App.\n2. Click *Enroll Now* on your course.\n3. Fill your details & pay via UPI to \`${coaching.upiId}\`.\n4. Enter your 12-digit UTR number.\n5. Once Director *BADE SIR* approves, you will get your Login ID & App access immediately! 🎉`;
    }
    return `📝 *ICC में Enroll करने का आसान तरीका:*\n1. वेबसाइट https://icconline.vercel.app/courses या Student App खोलें।\n2. अपने कोर्स पर *Enroll Now* दबाएं।\n3. अपनी जानकारी भरें और UPI (\`${coaching.upiId}\`) से पेमेंट करें।\n4. 12-अंकों का UTR नंबर डालकर सबमिट करें।\n5. *BADE SIR* के Approve करते ही आपकी ID चालू हो जाएगी और आपको नोटिफिकेशन मिल जाएगा! 🎉`;
  }

  if (identity.isLinked && identity.userRole === 'student' && identity.userId) {
    if (lower.includes('payment') || lower.includes('utr') || lower.includes('status')) {
      const pays = await StudentTools.getStudentPayments(identity.userId);
      if (pays.length === 0) {
        return langMode === 'english'
          ? `💳 Hi *${identity.userName}*, no payment records found yet.`
          : `💳 नमस्ते *${identity.userName}* जी, अभी आपके खाते में कोई पेमेंट रिकॉर्ड नहीं मिला।`;
      }
      const p = pays[0];
      return `💳 *Payment Status — ${identity.userName}:*\nStatus: *${p.status?.toUpperCase()}*\nAmount: ₹${p.amount}\nUTR: \`${p.utr_number}\``;
    }
    if (lower.includes('note') || lower.includes('pdf')) {
      const notes = await StudentTools.getStudentNotes(identity.userId);
      const list = notes.slice(0, 6).map((n: any) => `📄 ${n.title}`).join('\n');
      return list
        ? `📚 *Study Notes for ${identity.userName}:*\n\n${list}\n\nOpen in ICC Student App -> Notes!`
        : `📖 Notes are being updated in your ICC App, *${identity.userName}*!`;
    }
  }

  if (identity.isLinked && identity.userRole === 'admin') {
    if (lower.includes('pending') || lower.includes('revenue') || lower.includes('summary')) {
      const summary = await AdminTools.getAdminSummary();
      return `📊 *Admin Live Report (Miss Zoya):*\n👥 Active Students: ${summary.activeStudentsCount}\n📚 Published Courses: ${summary.publishedCoursesCount}\n⏳ Pending Payments: ${summary.pendingPaymentsCount}`;
    }
  }

  if (langMode === 'english') {
    return `🌸 Hello *${displayName}*! I am *Miss Zoya* from *IDEAL COACHING CENTRE*.\n\nYou can ask me about:\n• *Courses & Fees*\n• *Live Class Schedule*\n• *How to Enroll*\n• *Android App Download Link*\n• *Contact & Address*\n\nWhat would you like to know? 😊`;
  }
  return `🌸 नमस्ते *${displayName}* जी! मैं *Miss Zoya* हूँ, *IDEAL COACHING CENTRE (BADE SIR)* की AI असिस्टेंट।\n\nआप मुझसे पूछ सकते हैं:\n• *कोर्स और फीस की जानकारी*\n• *लाइव क्लास का समय*\n• *Enroll कैसे करें*\n• *Android App डाउनलोड लिंक*\n• *कोचिंग का पता और नंबर*\n\nकृपया अपना सवाल पूछें, मुझे आपकी मदद करके खुशी होगी! 😊`;
}
