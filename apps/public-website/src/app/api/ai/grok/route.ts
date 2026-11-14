import { NextRequest, NextResponse } from 'next/server';

// System context about IDEAL COACHING CENTRE (ICC) for Grok AI
const ICC_SYSTEM_PROMPT = `You are ICC AI, an intelligent educational assistant for IDEAL COACHING CENTRE (ICC).
Address: Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165.
Founder & Director: BADE SIR (+91 9771350910).
Specialization: Bihar Board (BSEB) and Jharkhand Board (JAC) for Classes 1st to 12th (Matric & Intermediate).
Payment Details: UPI ID azhargodda@ybl (Payee: IDEAL COACHING CENTRE).
Features: Live Classes, In-app Recorded Lectures, High Quality Handwritten Notes, Weekly Sunday Board Mock Tests, 24/7 Doubt Clearance.
Enrollment: Students can enroll directly on the website or student app by choosing a course, paying via dynamic UPI QR code, and submitting their 12-digit UTR. Admin approves the account.
Tone: Helpful, polite, inspiring, encouraging, bilingual (Hindi & English/Hinglish). Provide step-by-step clear explanations with examples.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], taskType = 'general' } = body;

    const apiKey = (
      process.env.GROK_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.XAI_API_KEY ||
      process.env.NEXT_PUBLIC_GROK_API_KEY ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY ||
      ''
    ).trim();

    // 1. Live AI Call (Supports Groq gsk_ & xAI xai- keys seamlessly)
    if (apiKey && apiKey !== 'xai-your-api-key') {
      try {
        const isGroq = apiKey.startsWith('gsk_');
        const endpoint = isGroq
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://api.x.ai/v1/chat/completions';
        const modelName = isGroq ? 'openai/gpt-oss-120b' : 'grok-beta';

        const fullMessages = [
          { role: 'system', content: ICC_SYSTEM_PROMPT },
          ...messages,
        ];

        const aiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: fullMessages,
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              success: true,
              text: reply,
              model: 'ICC Smart AI',
              live: true,
            });
          }
        } else {
          // If 120b model had issue, retry with qwen
          if (isGroq) {
            const fallbackAi = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'qwen/qwen3.8-27b',
                messages: fullMessages,
                temperature: 0.3,
                max_tokens: 1500,
              }),
            });
            if (fallbackAi.ok) {
              const data = await fallbackAi.json();
              const reply = data.choices?.[0]?.message?.content;
              if (reply) {
                return NextResponse.json({
                  success: true,
                  text: reply,
                  model: 'ICC Smart AI',
                  live: true,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Live API fetch failed, falling back to local engine:', err);
      }
    }

    // 2. Intelligent Domain Engine Fallback (Guarantees ₹0 cost and 100% uptime)
    const lastUserMessage =
      [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content?.toLowerCase() || '';

    let fallbackReply = '';

    if (taskType === 'counselor' || lastUserMessage.includes('admission') || lastUserMessage.includes('enroll') || lastUserMessage.includes('fees') || lastUserMessage.includes('course') || lastUserMessage.includes('bade sir') || lastUserMessage.includes('contact')) {
      if (lastUserMessage.includes('fees') || lastUserMessage.includes('fee') || lastUserMessage.includes('price')) {
        fallbackReply = `Namaste! IDEAL COACHING CENTRE (ICC) offers the most affordable & high-quality coaching in Godda & Santhal Pargana:
- **BSEB Class 10 Toppers Batch**: ₹499 (Discounted fee, full syllabus with notes & tests)
- **JAC Class 10 Board Crash Course**: ₹599 (Full Board Revision)
- **Class 9 Foundation Mission**: ₹399
- **Class 12 Intermediate Science/Arts**: ₹799

All courses include live interactive classes, full chapter notes (PDFs), recorded revision, and weekly Sunday tests. You can click on the "Courses" tab above and enroll directly with UPI QR code!`;
      } else if (lastUserMessage.includes('contact') || lastUserMessage.includes('bade sir') || lastUserMessage.includes('phone') || lastUserMessage.includes('number')) {
        fallbackReply = `You can directly reach out to our Director:
- **Director**: BADE SIR
- **Phone / WhatsApp**: +91 9771350910
- **Institute Address**: Sarotiya, Post Sarbhanga, Mahagama, Godda (JH) 814165
- **UPI ID for Course Enrollment**: azhargodda@ybl (Payee: IDEAL COACHING CENTRE)`;
      } else if (lastUserMessage.includes('enroll') || lastUserMessage.includes('admission') || lastUserMessage.includes('how to')) {
        fallbackReply = `Enrollment in ICC is quick and 100% digital:
1. Visit the **Courses** page on our website or app.
2. Click **"Enroll Now"** on your target board (BSEB or JAC) and class.
3. Fill your student details: Full Name, WhatsApp Number, Date of Birth, Email ID, and Password.
4. Scan the dynamic UPI QR code on screen and pay via PhonePe / GPay / Paytm.
5. Enter the **12-digit UPI UTR number** from your payment receipt and submit.
6. Admin will verify and activate your student ID. Once activated, your course and study materials will instantly unlock!`;
      } else {
        fallbackReply = `Namaste! Welcome to IDEAL COACHING CENTRE (ICC) AI Counselor.
Under the guidance of Director **BADE SIR**, we specialize in top rankings for **Bihar Board (BSEB)** and **Jharkhand Board (JAC)** Classes 1st to 12th.

How can I assist you today?
1. Check Course Details & Fees Structure
2. Bihar Board (BSEB) vs Jharkhand Board (JAC) guidance
3. Online Enrollment & UPI Payment Procedure
4. Speak with Director BADE SIR (+91 9771350910)`;
      }
    } else {
      fallbackReply = `Namaste! Main **ICC AI Guruji** hoon.
Main Bihar Board (BSEB) aur Jharkhand Board (JAC) ke sabhi vishayo (Ganit, Vigyan, Samajik Vigyan, Hindi, English) ke sawal step-by-step samjha sakta hoon.

Aap apna koi bhi question ya topic pooch sakte hain, main poore concept aur board exam ke tips ke sath explain karunga!`;
    }

    return NextResponse.json({
      success: true,
      text: fallbackReply,
      model: 'ICC Smart AI (Knowledge Base)',
      live: false,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
