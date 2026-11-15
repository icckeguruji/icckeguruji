import { supabase } from '../supabaseClient.js';

export async function getTeacherBatches(teacherId: string) {
  try {
    const { data } = await supabase
      .from('batches')
      .select('id, name, schedule_time, max_students')
      .eq('teacher_id', teacherId);
    return data || [];
  } catch {
    return [];
  }
}

export async function getTeacherLiveClasses(teacherId: string) {
  try {
    const { data } = await supabase
      .from('live_classes')
      .select('id, title, scheduled_at, meeting_link, status')
      .eq('teacher_id', teacherId)
      .in('status', ['live', 'scheduled'])
      .order('scheduled_at', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}
