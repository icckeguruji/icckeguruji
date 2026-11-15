import { supabase } from '../supabaseClient.js';

export async function getPublicCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, description, price, discount_price, validity_days, board_code')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {}

  // Fallback to verified institute curriculum
  return [
    {
      id: 'bseb-class10',
      title: 'BSEB Class 10 (Matric) Board Topper Batch 2026',
      price: 2499,
      discount_price: 1499,
      validity_days: 365,
      board_code: 'BSEB',
      description: 'Complete syllabus with Live Classes, PDF Notes, and Sunday Tests',
    },
    {
      id: 'jac-class10',
      title: 'JAC Class 10 Board Exam Target Batch 2026',
      price: 2499,
      discount_price: 1499,
      validity_days: 365,
      board_code: 'JAC',
      description: 'Jharkhand Board targeted preparation with full chapter notes',
    },
    {
      id: 'bseb-class12',
      title: 'BSEB Class 12 Science & Arts Crash Course',
      price: 2999,
      discount_price: 1999,
      validity_days: 365,
      board_code: 'BSEB',
      description: 'Physics, Chemistry, Maths/Biology & Hindi/English intermediate syllabus',
    },
    {
      id: 'jac-class12',
      title: 'JAC Class 12 Intermediate Board Booster',
      price: 2999,
      discount_price: 1999,
      validity_days: 365,
      board_code: 'JAC',
      description: 'Full JAC intermediate revision with model papers',
    },
  ];
}

export async function getPublicBatches() {
  try {
    const { data } = await supabase
      .from('batches')
      .select('name, schedule_time, days_of_week')
      .eq('is_active', true);

    if (data && data.length > 0) return data;
  } catch {}

  return [
    { name: 'Class 10 Morning Star Batch', schedule_time: '06:30 AM - 08:30 AM', days_of_week: 'Mon - Sat' },
    { name: 'Class 12 Science Power Batch', schedule_time: '04:00 PM - 06:00 PM', days_of_week: 'Mon - Sat' },
    { name: 'Class 9 Foundation Batch', schedule_time: '08:30 AM - 10:00 AM', days_of_week: 'Mon - Sat' },
  ];
}

export function getCoachingInfo() {
  return {
    instituteName: 'IDEAL COACHING CENTRE (ICC)',
    director: 'BADE SIR',
    contactNumber: '+91 9771350910',
    address: 'Sarotiya, Mahagama, Godda, Jharkhand 814165',
    boardsSupported: 'Strictly Bihar Board (BSEB) & Jharkhand Board (JAC)',
    upiId: 'azhargodda@ybl',
    enrollmentInfo: 'To enroll, visit our website or download the student app, choose your course, and pay via UPI. Enter your 12-digit UTR to activate your account upon admin approval.',
  };
}
