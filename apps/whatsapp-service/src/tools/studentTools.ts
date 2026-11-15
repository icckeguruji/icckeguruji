import { supabase } from '../supabaseClient.js';

export async function getStudentProfile(userId: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, username, mobile_number, email, board_code, class_id, is_active')
      .eq('id', userId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function getStudentEnrollments(userId: string) {
  try {
    const { data } = await supabase
      .from('enrollments')
      .select('id, status, enrolled_at, courses(title, board_code)')
      .eq('student_id', userId);
    return data || [];
  } catch {
    return [];
  }
}

export async function getStudentPayments(userId: string) {
  try {
    const { data } = await supabase
      .from('payments')
      .select('id, amount, utr_number, status, admin_remarks, created_at, course_title')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function getStudentLiveClasses(userId: string) {
  try {
    const { data } = await supabase
      .from('live_classes')
      .select('id, title, platform, meeting_link, scheduled_at, status')
      .in('status', ['live', 'scheduled'])
      .order('scheduled_at', { ascending: true })
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}

export async function getStudentNotes(userId: string) {
  try {
    const { data } = await supabase
      .from('study_materials')
      .select('id, title, file_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    return data || [];
  } catch {
    return [];
  }
}

export async function getStudentResults(userId: string) {
  try {
    const { data } = await supabase
      .from('exam_attempts')
      .select('id, total_score, percentage, status, completed_at, examinations(title)')
      .eq('student_id', userId)
      .order('completed_at', { ascending: false })
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
}
