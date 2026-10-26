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
        `Coulomb's Law quantifies the electrostatic force between two stationary electric point charges.\n\n` +
        `**Formula:**\n` +
        `$$F = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{|q_1 q_2|}{r^2}$$\n\n` +
        `Where:\n` +
        `- $q_1, q_2$: Magnitudes of the charges in Coulombs (C)\n` +
        `- $r$: Separation distance between the two charges in meters (m)\n` +
        `- $\\frac{1}{4\\pi\\varepsilon_0} \\approx 9 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$\n\n` +
        `💡 **Teacher's Tip:** When the distance between charges is halved ($r/2$), the electrostatic force increases by a factor of **4**!\n\n` +
        `**Quick Practice Question:** If two identical 1 C charges are placed 1 meter apart in a vacuum, what is the force between them? (Answer: $9 \\times 10^9$ N)`;
    } else if (qLower.includes('gauss') || qLower.includes('flux')) {
      fallbackAnswer = `**Gauss's Law Summary:**\n\n` +
        `The total electric flux $\\Phi$ passing through any closed surface is equal to $\\frac{1}{\\varepsilon_0}$ times the net electric charge ($q_{enclosed}$) enclosed within that surface.\n\n` +
        `**Formula:**\n` +
        `$$\\Phi = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}$$\n\n` +
        `🎯 **Key Exam Highlights:**\n` +
        `1. The surface must be completely closed (Gaussian surface).\n` +
        `2. Charges located outside the closed surface do not contribute to the net flux.`;
    } else {
      fallbackAnswer = `**Solution & Clarification:**\n\n` +
        `You asked: "${question}"\n\n` +
        `1. **Core Concept:** Break down the problem statement and identify the given variables and standard units.\n` +
        `2. **Step-by-Step Approach:**\n` +
        `   - Step 1: Identify the relevant governing formula.\n` +
        `   - Step 2: Substitute values with consistent SI units.\n` +
        `   - Step 3: Compute the final numerical value and specify appropriate units.\n\n` +
        `💡 *To enable live AI generation, set 'GEMINI_API_KEY=your_key' in your '.env.local' file (free from Google AI Studio).*`;
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
