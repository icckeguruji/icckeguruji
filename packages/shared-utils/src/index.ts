// IDEAL COACHING CENTRE — SHARED UTILITIES

// Format Indian Rupee (INR ₹)
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format readable file size in KB/MB
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Normalize Indian mobile number to 10 digits
export function normalizeMobileNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

// Mask email for student reassurance without data leakage (e.g. m****r@gmail.com)
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '****@****.com';
  const [localPart, domainPart] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}****@${domainPart}`;
  }
  return `${localPart[0]}****${localPart.slice(-1)}@${domainPart}`;
}

// Extract YouTube Video ID from any format (short link, watch URL, or plain ID)
export function extractYouTubeVideoId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  return match ? match[1] : trimmed;
}

// Get YouTube High-Res Thumbnail URL
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// Format date and time in IST (Asia/Kolkata)
export function formatIST(dateInput: string | Date, includeTime = true): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  }).format(d);
}

// Bilingual Text Picker (Defaults to Hindi, falls back gracefully)
export function getBilingualText<T extends { [key: string]: any }>(
  item: T,
  field: string,
  lang: 'hi' | 'en' = 'hi'
): string {
  if (!item) return '';
  const hiField = `${field}_hi`;
  if (lang === 'hi') {
    return item[hiField] || item[field] || '';
  }
  return item[field] || item[hiField] || '';
}

// Bilingual UI Dictionary
export const translations = {
  hi: {
    appName: 'आइडियल कोचिंग सेंटर',
    tagline: 'बिहार एवं झारखंड बोर्ड परीक्षा में शत-प्रतिशत सफलता',
    login: 'लॉगिन करें',
    register: 'नया खाता बनाएँ',
    enterIdentifier: 'मोबाइल नंबर / यूज़रनेम / ईमेल दर्ज करें',
    sendOtp: 'ओटीपी प्राप्त करें',
    enterOtp: '6 अंकों का ओटीपी दर्ज करें',
    verifyOtp: 'सत्यापित करें एवं आगे बढ़ें',
    otpSentNotice: 'ओटीपी आपके पंजीकृत ईमेल पर भेजा गया है। एसएमएस नहीं भेजा जाएगा।',
    resendOtp: 'ओटीपी पुनः भेजें',
    home: 'होम',
    courses: 'कोर्स',
    liveClasses: 'लाइव क्लास',
    notes: 'नोट्स एवं पीडीएफ',
    tests: 'ऑनलाइन परीक्षा',
    doubts: 'शंका समाधान',
    profile: 'प्रोफ़ाइल',
    enrollNow: 'अभी प्रवेश लें',
    freeBatch: 'निःशुल्क बैच',
    payUpi: 'यूपीआई (UPI) से भुगतान करें',
    pendingApproval: 'सत्यापन प्रक्रियाधीन',
    activeCourse: 'सक्रिय कोर्स',
    allSubjects: 'सभी विषय',
    viewDetails: 'विवरण देखें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    readOnline: 'ऑनलाइन पढ़ें',
    startTest: 'परीक्षा शुरू करें',
    submitTest: 'परीक्षा जमा करें',
    questions: 'प्रश्न',
    marks: 'अंक',
    duration: 'समय',
    minutes: 'मिनट',
    passed: 'उत्तीर्ण',
    failed: 'पुनः प्रयास करें',
    changeLanguage: 'भाषा बदलें (Language)',
    boardBseb: 'बिहार बोर्ड (BSEB)',
    boardJac: 'झारखंड बोर्ड (JAC)',
  },
  en: {
    appName: 'IDEAL COACHING CENTRE',
    tagline: 'Excellence in BSEB & JAC State Board Examinations',
    login: 'Log In',
    register: 'Create Account',
    enterIdentifier: 'Enter Mobile Number / Username / Email',
    sendOtp: 'Get Email OTP',
    enterOtp: 'Enter 6-digit OTP',
    verifyOtp: 'Verify & Continue',
    otpSentNotice: 'OTP is sent strictly to your registered email address. No SMS will be sent.',
    resendOtp: 'Resend OTP',
    home: 'Home',
    courses: 'Courses',
    liveClasses: 'Live Classes',
    notes: 'Notes & PDFs',
    tests: 'Online Exams',
    doubts: 'Doubts',
    profile: 'Profile',
    enrollNow: 'Enroll Now',
    freeBatch: 'Free Batch',
    payUpi: 'Pay via UPI',
    pendingApproval: 'Under Verification',
    activeCourse: 'Active Course',
    allSubjects: 'All Subjects',
    viewDetails: 'View Details',
    downloadPdf: 'Download PDF',
    readOnline: 'Read Online',
    startTest: 'Start Exam',
    submitTest: 'Submit Exam',
    questions: 'Questions',
    marks: 'Marks',
    duration: 'Duration',
    minutes: 'Minutes',
    passed: 'Passed',
    failed: 'Retry',
    changeLanguage: 'Change Language',
    boardBseb: 'Bihar Board (BSEB)',
    boardJac: 'Jharkhand Board (JAC)',
  },
};
