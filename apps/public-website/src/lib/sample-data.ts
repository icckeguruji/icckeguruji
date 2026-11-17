// IDEAL COACHING CENTRE — SEED / SAMPLE DATA REPOSITORY (MATCHING POSTGRES SCHEMA)

import {
  AcademicBoard,
  AcademicSession,
  ClassItem,
  SubjectItem,
  Course,
  Batch,
  UserProfile,
  Payment,
  StudyMaterial,
  LiveClass,
  RecordedLecture,
  Examination,
  TeacherProfile,
  PlatformConfig,
} from '@icc/shared-types';

export const initialBoards: AcademicBoard[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    code: 'BSEB',
    name: 'Bihar School Examination Board',
    name_hi: 'बिहार विद्यालय परीक्षा समिति',
    description: 'Matric and Intermediate state board preparation with full Hindi & English support.',
    description_hi: 'बिहार बोर्ड मैट्रिक एवं इंटरमीडिएट परीक्षा के लिए संपूर्ण अध्ययन सामग्री।',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    code: 'JAC',
    name: 'Jharkhand Academic Council',
    name_hi: 'झारखंड अधिविद्य परिषद्',
    description: 'Complete course curriculum and sample model papers for JAC Ranchi.',
    description_hi: 'झारखंड एकेडमिक काउंसिल रांची बोर्ड परीक्षाओं के लिए विशेष कक्षाएं।',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialSessions: AcademicSession[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    name: '2026-2027',
    start_date: '2026-04-01',
    end_date: '2027-03-31',
    is_current: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialClasses: ClassItem[] = [
  { id: 'c0000000-0000-0000-0000-000000000007', name: 'Class 7', name_hi: 'कक्षा 7', numeric_order: 7, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000008', name: 'Class 8', name_hi: 'कक्षा 8', numeric_order: 8, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000009', name: 'Class 9', name_hi: 'कक्षा 9', numeric_order: 9, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000010', name: 'Class 10', name_hi: 'कक्षा 10', numeric_order: 10, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000011', name: 'Class 11 (Science)', name_hi: 'कक्षा 11 (विज्ञान)', numeric_order: 11, is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: 'c0000000-0000-0000-0000-000000000012', name: 'Class 12 (Science)', name_hi: 'कक्षा 12 (विज्ञान)', numeric_order: 12, is_active: true, created_at: '2026-01-01T00:00:00Z' },
];

export const initialSubjects: SubjectItem[] = [
  {
    id: 'sub00000-0000-0000-0000-000000000001',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'BSEB10-MATH',
    icon_name: 'Calculator',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub00000-0000-0000-0000-000000000002',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'Science (Physics, Chemistry, Biology)',
    name_hi: 'विज्ञान (भौतिकी, रसायन, जीव विज्ञान)',
    code: 'BSEB10-SCI',
    icon_name: 'Flask',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub00000-0000-0000-0000-000000000003',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'Social Science',
    name_hi: 'सामाजिक विज्ञान',
    code: 'BSEB10-SST',
    icon_name: 'Globe',
    display_order: 3,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub00000-0000-0000-0000-000000000011',
    board_id: 'b0000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'Mathematics',
    name_hi: 'गणित',
    code: 'JAC10-MATH',
    icon_name: 'Calculator',
    display_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub00000-0000-0000-0000-000000000012',
    board_id: 'b0000000-0000-0000-0000-000000000002',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    name: 'Science',
    name_hi: 'विज्ञान',
    code: 'JAC10-SCI',
    icon_name: 'Flask',
    display_order: 2,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialCourses: Course[] = [];

export const initialStudents: UserProfile[] = [];

export const initialPayments: Payment[] = [];

export const initialStudyMaterials: StudyMaterial[] = [
  {
    id: 'mat00000-0000-0000-0000-000000000001',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub00000-0000-0000-0000-000000000002',
    chapter_id: 'ch000000-0000-0000-0000-000000000001',
    title: 'Chemical Reactions - Complete Handwritten Topper Notes',
    title_hi: 'रासायनिक अभिक्रियाएँ - संपूर्ण हस्तलिखित टॉपर नोट्स',
    description: 'Crisp bilingual notes with NCERT highlighted points and reaction tables.',
    file_path: 'bseb/class10/science/ch01_chemical_reactions_notes.pdf',
    file_size_bytes: 2450000,
    material_type: 'chapter_notes',
    is_free: false,
    version: 1,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'mat00000-0000-0000-0000-000000000002',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub00000-0000-0000-0000-000000000001',
    chapter_id: 'ch000000-0000-0000-0000-000000000011',
    title: 'Real Numbers - Formula Sheet & Important Theorems',
    title_hi: 'वास्तविक संख्याएं - सूत्र पुस्तिका एवं महत्वपूर्ण प्रमेय',
    description: 'One-page formula sheet for rapid exam revision.',
    file_path: 'bseb/class10/math/ch01_real_numbers_formula.pdf',
    file_size_bytes: 850000,
    material_type: 'formula_sheet',
    is_free: true,
    version: 1,
    created_at: '2026-04-02T00:00:00Z',
    updated_at: '2026-04-02T00:00:00Z',
  },
];

export const initialLiveClasses: LiveClass[] = [];

export const initialPlatformConfig: PlatformConfig = {
  institution_profile: {
    name: 'IDEAL COACHING CENTRE',
    tagline: 'कक्षा 1 से 12वीं तक • बिहार बोर्ड (BSEB) एवं झारखंड बोर्ड (JAC)',
    tagline_en: 'Classes 1st to 12th • Bihar Board (BSEB) & Jharkhand Board (JAC)',
    address: 'Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165',
    contact_phone: '+91 9771350910',
    contact_email: 'icckeguruji@gmail.com',
    whatsapp_number: '919771350910',
    website_url: 'https://icckeguruji.vercel.app',
    established_year: 2018,
  },
  payment_config: {
    upi_id: 'azhargodda@ybl',
    account_holder_name: 'IDEAL COACHING CENTRE',
    bank_name: 'YES Bank / YBL UPI',
    account_number: 'azhargodda@ybl',
    ifsc_code: 'YESB0YBLUPI',
    qr_code_url: '',
    instructions_hi: '1. दिए गए UPI ID (azhargodda@ybl) पर फोनपे, गूगल पे या पेटीएम से भुगतान करें।\n2. भुगतान के उपरांत 12 अंकों का UTR/Transaction ID दर्ज करें।\n3. रसीद का स्क्रीनशॉट संलग्न करें और सबमिट करें। 15 मिनट के अंदर आपका बैच एक्टिवेट हो जाएगा।',
    instructions_en: '1. Pay using PhonePe, Google Pay, or Paytm to UPI ID (azhargodda@ybl).\n2. Note down the 12-digit UTR/Transaction Reference ID.\n3. Upload screenshot and submit. Batch access will be activated within 15 minutes.',
  },
  academic_config: {
    supported_boards: ['BSEB', 'JAC'],
    default_language: 'en',
    supported_languages: ['en', 'hi'],
    currency: 'INR',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
  },
};
