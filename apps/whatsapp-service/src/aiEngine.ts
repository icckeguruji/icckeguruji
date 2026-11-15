import { SenderIdentity } from './accountLinker.js';
import * as PublicTools from './tools/publicTools.js';
import * as StudentTools from './tools/studentTools.js';
import * as TeacherTools from './tools/teacherTools.js';
import * as AdminTools from './tools/adminTools.js';

interface AiProcessOptions {
  senderJid: string;
  senderText: string;
  identity: SenderIdentity;
}

export async function processAiMessage({
  senderJid,
  senderText,
  identity,
}: AiProcessOptions): Promise<string> {
  const text = senderText.trim();
  const lower = text.toLowerCase();

  // Detect language tone
  const isHindi = /[\u0900-\u097F]/.test(text);
  const isHinglish =
    lower.includes('kaun') ||
    lower.includes('kya') ||
    lower.includes('hai') ||
    lower.includes('kab') ||
    lower.includes('mera') ||
    lower.includes('meri') ||
    lower.includes('kahan') ||
    lower.includes('kaise') ||
    lower.includes('chahiye');

  // =========================================================================
  // 1. PUBLIC VISITOR LOGIC (If not linked or asking public info)
  // =========================================================================
  const coaching = PublicTools.getCoachingInfo();

  // Intent: Coaching Contact & Location
  if (
    lower.includes('contact') ||
    lower.includes('address') ||
    lower.includes('kahan') ||
    lower.includes('location') ||
    lower.includes('phone') ||
    lower.includes('number') ||
    lower.includes('bade sir')
  ) {
    if (isHindi) {
      return `📍 *आइडियल कोचिंग सेंटर (ICC)*\nनिदेशक: *बड़े सर*\n📞 संपर्क सूत्र: ${coaching.contactNumber}\n🏢 पता: सरोतिया, महागामा, गोड्डा, झारखंड 814165\n🎯 समर्थित बोर्ड: BSEB (बिहार बोर्ड) एवं JAC (झारखंड बोर्ड)\n\nकोर्स में नामांकन के लिए हमारी वेबसाइट या ऐप पर जाएँ।`;
    }
    return `📍 *IDEAL COACHING CENTRE (ICC)*\nDirector: *BADE SIR*\n📞 Contact: ${coaching.contactNumber}\n🏢 Address: ${coaching.address}\n🎯 Supported Boards: ${coaching.boardsSupported}\n\nFor admissions & courses, visit our public website or student app!`;
  }

  // Intent: Course Fees & Pricing
  if (
    lower.includes('fee') ||
    lower.includes('fees') ||
    lower.includes('paisa') ||
    lower.includes('price') ||
    lower.includes('kitna') ||
    lower.includes('cost')
  ) {
    const courses = await PublicTools.getPublicCourses();
    const feeLines = courses
      .map(
        (c) =>
          `• *${c.title}* (${c.board_code}): ₹${c.discount_price || c.price} (Validity: ${c.validity_days || 365} Days)`
      )
      .join('\n');

    if (isHindi) {
      return `📚 *ICC कोर्स एवं शुल्क विवरण:*\n\n${feeLines}\n\n💳 *आधिकारिक UPI आईडी:* \`${coaching.upiId}\`\nपेयी: *IDEAL COACHING CENTRE*\n\nनामांकन करने के लिए कोर्स पेज पर जाएँ, UPI द्वारा भुगतान करें और 12 अंकों का UTR सबमिट करें।`;
    }
    return `📚 *IDEAL COACHING CENTRE — Course Fee Schedule:*\n\n${feeLines}\n\n💳 *Official UPI VPA:* \`${coaching.upiId}\`\nPayee: *IDEAL COACHING CENTRE*\n\nTo enroll, visit our course page, transfer the fee via UPI, and submit your 12-digit UTR for admin approval.`;
  }

  // Intent: Courses Available & Boards
  if (
    lower.includes('course') ||
    lower.includes('class') ||
    lower.includes('board') ||
    lower.includes('bseb') ||
    lower.includes('jac') ||
    lower.includes('subject')
  ) {
    const courses = await PublicTools.getPublicCourses();
    const courseList = courses
      .map((c) => `🎓 *${c.title}*\n  Board: ${c.board_code} | Fee: ₹${c.discount_price || c.price}`)
      .join('\n\n');

    if (isHindi) {
      return `🌟 *IDEAL COACHING CENTRE — उपलब्ध कोर्सेज:*\n\n${courseList}\n\nहम विशेष रूप से **BSEB (बिहार बोर्ड)** और **JAC (झारखंड बोर्ड)** के कक्षा 8वीं से 12वीं तक के छात्रों को लाइव क्लास, नोट्स एवं टेस्ट सीरीज प्रदान करते हैं।`;
    }
    return `🌟 *IDEAL COACHING CENTRE — Available Courses:*\n\n${courseList}\n\nWe specialize exclusively in **BSEB (Bihar Board)** & **JAC (Jharkhand Board)** for Classes 8 to 12 with live classes, chapter notes, and Sunday test series.`;
  }

  // Intent: Admission & Enrollment Guide
  if (
    lower.includes('admission') ||
    lower.includes('enroll') ||
    lower.includes('join') ||
    lower.includes('kaise le') ||
    lower.includes('kaise kare')
  ) {
    if (isHindi) {
      return `📝 *ICC में नामांकन (Enrollment) की प्रक्रिया:*\n\n1. हमारी वेबसाइट या स्टूडेंट ऐप खोलें और "Courses" पर जाएँ।\n2. अपने पसंदीदा बोर्ड (BSEB/JAC) और क्लास के कोर्स पर "Enroll Now" दबाएँ।\n3. अपना नाम, मोबाइल, ईमेल, जन्मतिथि एवं पासवर्ड भरें।\n4. संस्थान की आधिकारिक UPI आईडी \`${coaching.upiId}\` पर शुल्क भेजें।\n5. रसीद से 12 अंकों का UTR नंबर दर्ज करके सबमिट करें।\n6. बड़े सर द्वारा UTR सत्यापित होते ही आपका खाता तुरंत सक्रिय हो जाएगा!`;
    }
    return `📝 *How to Enroll in IDEAL COACHING CENTRE:*\n\n1. Open our Website or Student App and browse to "Courses".\n2. Click "Enroll Now" on your target board (BSEB/JAC) and class.\n3. Fill in your Name, Mobile, Email, DOB, and create a password.\n4. Send the course fee via UPI to \`${coaching.upiId}\` (IDEAL COACHING CENTRE).\n5. Enter the 12-digit UPI UTR number and submit.\n6. Director BADE SIR will verify the transaction and activate your account!`;
  }

  // =========================================================================
  // 2. PRIVATE QUERIES GATING (If unlinked user asks private questions)
  // =========================================================================
  const isPrivateQuery =
    lower.includes('mera') ||
    lower.includes('meri') ||
    lower.includes('my') ||
    lower.includes('result') ||
    lower.includes('assignment') ||
    lower.includes('payment') ||
    lower.includes('live class') ||
    lower.includes('notes');

  if (!identity.isLinked && isPrivateQuery) {
    if (isHindi) {
      return `🔒 *व्यक्तिगत छात्र विवरण सुरक्षित हैं*\n\nअपने नामांकित कोर्स, लाइव क्लास, नोट्स, फीस और रिज़ल्ट देखने के लिए कृपया अपना व्हाट्सएप अकाउंट लिंक करें:\n\n1. ICC स्टूडेंट ऐप या वेबसाइट में लॉगिन करें।\n2. **Profile** में जाएँ और **"Link WhatsApp Account"** चुनें।\n3. प्राप्त 6-अंकों का कोड यहाँ भेजें (उदाहरण: \`#LINK 123456\`).\n\nलिंक होते ही आपकी सभी क्लास और रिज़ल्ट जानकारी यहाँ उपलब्ध हो जाएगी!`;
    }
    return `🔒 *Private Account Information Protected*\n\nTo access your personal course contents, live classes, study notes, fee status, and exam results, please link your WhatsApp account:\n\n1. Log in to the ICC Student App or Website.\n2. Open **Profile** and select **"Link WhatsApp Account"**.\n3. Send the 5-minute code here (e.g. \`#LINK 123456\`).\n\nOnce verified, you will receive real-time updates directly on WhatsApp!`;
  }

  // =========================================================================
  // 3. LINKED STUDENT QUERIES
  // =========================================================================
  if (identity.isLinked && identity.userRole === 'student' && identity.userId) {
    const studentId = identity.userId;

    // Next Live Class
    if (lower.includes('live') || lower.includes('class') || lower.includes('kab')) {
      const liveList = await StudentTools.getStudentLiveClasses(studentId);
      if (liveList.length === 0) {
        return `📅 Hello ${identity.userName}, there are no upcoming live classes scheduled at this moment. You will receive a push notification when Director BADE SIR schedules the next session!`;
      }
      const nextCls = liveList[0];
      return `🔴 *Next Live Class for ${identity.userName}:*\n\n📌 *${nextCls.title}*\n⏰ Time: ${new Date(nextCls.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n📡 Platform: ${nextCls.platform.toUpperCase()}\n🔗 Join Link: ${nextCls.meeting_link || 'Available 15 minutes before class'}`;
    }

    // Payment / Fee Status
    if (lower.includes('payment') || lower.includes('fees') || lower.includes('utr') || lower.includes('status')) {
      const payments = await StudentTools.getStudentPayments(studentId);
      if (payments.length === 0) {
        return `💳 Hello ${identity.userName}, no payment requests found under your student profile. If you enrolled recently, please verify your UTR submission.`;
      }
      const latest = payments[0];
      const statusEmoji = latest.status === 'approved' ? '✅ APPROVED' : latest.status === 'pending' ? '⏳ PENDING VERIFICATION' : '❌ REJECTED';
      return `💳 *Fee & Payment Record — ${identity.userName}:*\n\nStatus: *${statusEmoji}*\nCourse: ${latest.course_title || 'Enrolled Course'}\nAmount: ₹${latest.amount}\nUTR Number: \`${latest.utr_number}\`\nDate: ${new Date(latest.created_at).toLocaleDateString('en-IN')}\n\n${latest.admin_remarks ? `Admin Remarks: ${latest.admin_remarks}` : 'Direct verification managed by Director BADE SIR.'}`;
    }

    // PDF Notes & Study Materials
    if (lower.includes('note') || lower.includes('pdf') || lower.includes('material')) {
      const notes = await StudentTools.getStudentNotes(studentId);
      if (notes.length === 0) {
        return `📖 Hello ${identity.userName}, study notes are currently being uploaded by faculty. Please check back shortly or access the in-app encrypted offline vault!`;
      }
      const notesList = notes.map((n) => `📄 *${n.title}*`).join('\n');
      return `📚 *Available Study Notes & PDFs for ${identity.userName}:*\n\n${notesList}\n\n🔒 For anti-piracy DRM protection, you can download and read these notes encrypted inside the ICC Android App without internet.`;
    }

    // Sunday Test Results
    if (lower.includes('result') || lower.includes('marks') || lower.includes('score') || lower.includes('exam')) {
      const results = await StudentTools.getStudentResults(studentId);
      if (results.length === 0) {
        return `📊 Hello ${identity.userName}, you have not attempted any weekly Sunday tests yet. Complete your test in the student app to see your scorecard here!`;
      }
      const resLines = results
        .map(
          (r: any) =>
            `🏆 *${r.examinations?.title || 'Sunday Test'}*\nScore: ${r.total_score} marks (${r.percentage}%) • Status: ${r.status?.toUpperCase()}`
        )
        .join('\n\n');
      return `📈 *Recent Test Scorecards — ${identity.userName}:*\n\n${resLines}\n\nDirector BADE SIR dispatches weekly summaries directly to your parents' WhatsApp as well.`;
    }

    // Enrolled Courses
    if (lower.includes('enrolled') || lower.includes('course')) {
      const enrollments = await StudentTools.getStudentEnrollments(studentId);
      if (enrollments.length === 0) {
        return `🎓 Hello ${identity.userName}, your course enrollment is currently being activated by the administration.`;
      }
      const list = enrollments
        .map((e: any) => `• *${e.courses?.title || 'Target Batch'}* [Status: ${e.status.toUpperCase()}]`)
        .join('\n');
      return `🎓 *Your Active Course Enrollments — ${identity.userName}:*\n\n${list}`;
    }
  }

  // =========================================================================
  // 4. LINKED TEACHER QUERIES
  // =========================================================================
  if (identity.isLinked && identity.userRole === 'teacher' && identity.userId) {
    if (lower.includes('batch') || lower.includes('student') || lower.includes('schedule')) {
      const batches = await TeacherTools.getTeacherBatches(identity.userId);
      const batchLines = batches.map((b) => `• *${b.name}* (Time: ${b.schedule_time})`).join('\n');
      return `👨‍🏫 *Faculty Schedule — ${identity.userName}:*\n\n${batchLines || 'All scheduled batches are active.'}\n\nYou can manage assignments and live sessions through the shared Admin/Teacher Dashboard.`;
    }
  }

  // =========================================================================
  // 5. LINKED ADMIN QUERIES
  // =========================================================================
  if (identity.isLinked && identity.userRole === 'admin') {
    if (lower.includes('stat') || lower.includes('summary') || lower.includes('payment') || lower.includes('student')) {
      const summary = await AdminTools.getAdminSummary();
      return `👑 *ICC Institute Administration Overview (Director BADE SIR):*\n\n• Active Students: *${summary.activeStudentsCount}*\n• Pending UPI Payment Approvals: *${summary.pendingPaymentsCount}*\n• Published Courses: *${summary.publishedCoursesCount}*\n• Board Focus: Strictly BSEB & JAC\n\nLog in to the Admin Portal at \`/payments\` to audit UTRs and activate student accounts.`;
    }
  }

  // =========================================================================
  // 6. DEFAULT POLITE GREETING & FALLBACK
  // =========================================================================
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste') || lower.includes('pranam')) {
    if (isHindi) {
      return `नमस्ते! **आइडियल कोचिंग सेंटर (ICC)** के AI असिस्टेंट में आपका स्वागत है।\n\nआप मुझसे BSEB और JAC बोर्ड के कोर्सेज, क्लास फीस, बैच टाइमिंग, सरोतिया सेंटर का पता या बड़े सर के संपर्क के बारे में पूछ सकते हैं!`;
    }
    return `Namaste! Welcome to **IDEAL COACHING CENTRE (ICC)** AI Assistant.\n\nI can help you with BSEB & JAC course admissions, fee schedules, batch timings, Sunday test results, and coaching information. How may I assist you today?`;
  }

  // Generic helpful fallback
  if (isHindi) {
    return coaching.enrollmentInfo + `\n\nअधिक जानकारी के लिए निदेशक बड़े सर से ${coaching.contactNumber} पर बात करें।`;
  }
  return `Thank you for messaging IDEAL COACHING CENTRE (ICC).\n\nYou can ask about our BSEB & JAC courses, batch timings, fees, or enrollment steps. For urgent queries, contact Director BADE SIR at ${coaching.contactNumber}.`;
}
