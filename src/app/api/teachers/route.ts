import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TeacherItem {
  id: string;
  full_name: string;
  qualification: string;
  subjects: string;
  email: string;
  mobile: string;
  assignedBatches: number;
}

const defaultTeachers: TeacherItem[] = [
  {
    id: 't-0',
    full_name: 'BADE SIR (Director / बड़े सर)',
    qualification: 'Founder & Academic Director - 12+ Years Experience',
    subjects: 'Senior Physics, Mathematics & Board Strategy',
    email: 'icckeguruji@gmail.com',
    mobile: '9771350910',
    assignedBatches: 6,
  },
  {
    id: 't-1',
    full_name: 'Dr. R. K. Sharma',
    qualification: 'M.Sc., Ph.D. in Physics (Ex-Patna Faculty)',
    subjects: 'Class 10 & 12 Physics, Numerical Problem Solving',
    email: 'rksharma.physics@gmail.com',
    mobile: '9835012345',
    assignedBatches: 4,
  },
  {
    id: 't-2',
    full_name: 'Prof. Animesh Verma',
    qualification: 'M.Sc. Mathematics, B.Ed (10+ Years Board Prep)',
    subjects: 'Class 9, 10 & 11 Mathematics, Geometry & Trigonometry',
    email: 'animesh.maths@gmail.com',
    mobile: '9431098765',
    assignedBatches: 5,
  },
  {
    id: 't-3',
    full_name: 'Dr. S. N. Mishra',
    qualification: 'M.Sc. Organic Chemistry, CSIR-NET Qualified',
    subjects: 'Class 11 & 12 Chemistry, Reaction Mechanisms',
    email: 'snmishra.chem@gmail.com',
    mobile: '9122334455',
    assignedBatches: 3,
  },
  {
    id: 't-4',
    full_name: 'Smt. Pratibha Kumari',
    qualification: 'M.A. Hindi & Sanskrit Literature, B.Ed',
    subjects: 'Class 9 & 10 Hindi, Sanskrit Vyakaran & Sahitya',
    email: 'pratibha.sahitya@gmail.com',
    mobile: '9934112233',
    assignedBatches: 4,
  },
];

async function getCloudTeachers(): Promise<TeacherItem[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'icc_teachers')
        .maybeSingle();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        return data.value as TeacherItem[];
      }
    } catch (e) {
      console.warn('getCloudTeachers error:', e);
    }
  }
  return defaultTeachers;
}

async function saveCloudTeachers(teachers: TeacherItem[]): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('platform_settings').upsert({
        key: 'icc_teachers',
        value: teachers,
        description: 'Institute Teachers & Faculty List with real-time multi-client sync',
        updated_at: new Date().toISOString(),
      });
      if (!error) return true;
      console.warn('saveCloudTeachers Supabase error:', error);
    } catch (e) {
      console.warn('saveCloudTeachers exception:', e);
    }
  }
  return false;
}

export async function GET() {
  const teachers = await getCloudTeachers();
  return NextResponse.json(teachers, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentTeachers = await getCloudTeachers();

    if (body.syncAll && Array.isArray(body.teachers)) {
      await saveCloudTeachers(body.teachers);
      return NextResponse.json({ success: true, teachers: body.teachers });
    }

    const newTeacher: TeacherItem = {
      id: body.id || `t-${Date.now()}`,
      full_name: body.full_name || 'New Faculty',
      qualification: body.qualification || '',
      subjects: body.subjects || '',
      email: body.email || '',
      mobile: body.mobile || '',
      assignedBatches: Number(body.assignedBatches) || 1,
    };

    const updated = [newTeacher, ...currentTeachers.filter((t) => t.id !== newTeacher.id)];
    await saveCloudTeachers(updated);

    return NextResponse.json({ success: true, teacher: newTeacher, teachers: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save teacher' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Teacher ID is required' }, { status: 400 });
    }

    const currentTeachers = await getCloudTeachers();
    const updated = currentTeachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    await saveCloudTeachers(updated);

    return NextResponse.json({ success: true, teachers: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Teacher ID is required' }, { status: 400 });
    }

    const currentTeachers = await getCloudTeachers();
    const filtered = currentTeachers.filter((t) => t.id !== id);
    await saveCloudTeachers(filtered);

    return NextResponse.json({ success: true, teachers: filtered });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to delete teacher' }, { status: 500 });
  }
}
