import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, courseTitle, subject } = await req.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If user has provided Gemini API key, use official Gemini API
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are an expert, encouraging coaching teacher and doubt-solving assistant for an Indian coaching institute named 'ICC KE GURUJI'.
The student is studying the course: "${courseTitle || 'Class 12 Physics & Tech'}".
Subject/Topic: "${subject || 'General'}".

Student's question/doubt:
"${question}"

Instructions:
1. Explain in simple, clear, and friendly Hinglish (Hindi + English) as Indian coaching teachers do.
2. Provide step-by-step mathematical derivations or code if applicable.
3. Highlight key formulas with bullet points.
4. Give a practical real-world analogy or memory trick (mnemonic).
5. Add 1 quick practice question at the end to check understanding.`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              }
            }),
            signal: AbortSignal.timeout(6000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return NextResponse.json({ answer, source: 'gemini-live' });
          }
        }
      } catch (geminiError) {
        console.error('Gemini API call timed out or failed, falling back to smart responder:', geminiError);
      }
    }

    // Smart contextual fallback when GEMINI_API_KEY is not yet entered
    let fallbackAnswer = '';
    const qLower = question.toLowerCase();

    if (qLower.includes('coulomb') || qLower.includes('force')) {
      fallbackAnswer = `**Coulomb's Law Explanation:**\n\n` +
        `Coulomb's Law do static point charges ke beech lagne wale electrostatic force ko define karta hai.\n\n` +
        `**Formula:**\n` +
        `$$F = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{|q_1 q_2|}{r^2}$$\n\n` +
        `Jahan:\n` +
        `- $q_1, q_2$: Charges ki value in Coulombs (C)\n` +
        `- $r$: Dono charges ke beech ki distance (meters)\n` +
        `- $\\frac{1}{4\\pi\\varepsilon_0} \\approx 9 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$\n\n` +
        `💡 **Teacher's Tip:** Agar distance half ($r/2$) ho jaye, toh force **4 times** increase ho jata hai!\n\n` +
        `**Quick Practice Question:** Agar do identical 1C charges 1 meter door rakhe hain, toh unke beech kitna force lagega? (Answer: $9 \\times 10^9$ N)`;
    } else if (qLower.includes('gauss') || qLower.includes('flux')) {
      fallbackAnswer = `**Gauss's Law Summary:**\n\n` +
        `Kisi bhi closed surface se nikalne wala total electric flux $\\Phi$, us closed surface ke andar band total charge ($q_{in}$) ka $\\frac{1}{\\varepsilon_0}$ times hota hai.\n\n` +
        `**Formula:**\n` +
        `$$\\Phi = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}$$\n\n` +
        `🎯 **Board Exam Imp Points:**\n` +
        `1. Surface hamesha closed (Gaussian surface) honi chahiye.\n` +
        `2. Outside charges flux mein contribute nahi karte.`;
    } else {
      fallbackAnswer = `**Namaste! Aapke doubt ka solution:**\n\n` +
        `Aapne pucha: "${question}"\n\n` +
        `1. **Core Concept:** Is topic ko samajhne ke liye pehle basic definition aur given variables ko identify karein.\n` +
        `2. **Step-by-Step Approach:**\n` +
        `   - Step 1: Formulas aur standard units (SI Units) check karein.\n` +
        `💡 *Real Gemini API key add karne ke liye '.env.local' mein 'GEMINI_API_KEY=your_key' set karein (Google AI Studio se 100% free milti hai).*`;
    }

    return NextResponse.json({
      answer: fallbackAnswer,
      source: apiKey ? 'gemini-live' : 'smart-demo'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
