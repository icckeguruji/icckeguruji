export interface AiAcademicSuggestion {
  title: string;
  title_hi: string;
  tagline: string;
  description: string;
  description_hi: string;
  suggestions: string[];
}

/**
 * Calls `/api/ai/grok` with `autofill_academic` to generate English + Hindi titles,
 * descriptions, and topic suggestions in one click.
 */
export async function autoFillAcademicWithAI(params: {
  kind: 'course' | 'subject' | 'sub_subject' | 'chapter' | 'material';
  title: string;
  context?: string;
}): Promise<AiAcademicSuggestion> {
  const cleanTitle = (params.title || '').trim() || 'Board Preparation';
  try {
    const res = await fetch('/api/ai/grok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'autofill_academic',
        payload: {
          kind: params.kind,
          title: cleanTitle,
          context: params.context || 'BSEB & JAC Board',
        },
      }),
    });
    const data = await res.json();
    if (data?.success && data?.result) {
      return data.result as AiAcademicSuggestion;
    }
  } catch {}

  return {
    title: cleanTitle,
    title_hi: cleanTitle,
    tagline: `Complete ${cleanTitle} Mastery with BADE SIR`,
    description: `Structured ${cleanTitle} syllabus with daily live classes, recorded lectures, handwritten PDF notes, and weekly tests.`,
    description_hi: `${cleanTitle} की संपूर्ण तैयारी — लाइव कक्षाएं, हस्तलिखित नोट्स और साप्ताहिक टेस्ट के साथ।`,
    suggestions: [
      `${cleanTitle} — Foundation & Concepts`,
      `${cleanTitle} — Important Questions & NCERT Solutions`,
      `${cleanTitle} — Previous Year Board Paper Practice`,
    ],
  };
}
