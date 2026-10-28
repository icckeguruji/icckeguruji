import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, prompt, formType, currentConfig, problem, subject, classLevel, topic, questionCount, durationMinutes } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to call Gemini if API Key is available
    async function callGemini(systemPrompt: string, userPrompt: string, jsonMode = false) {
      if (!apiKey) return null;
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }]
                }
              ],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2000,
                ...(jsonMode ? { responseMimeType: 'application/json' } : {})
              }
            }),
            signal: AbortSignal.timeout(8000)
          }
        );
        if (response.ok) {
          const resData = await response.json();
          return resData.candidates?.[0]?.content?.parts?.[0]?.text;
        }
      } catch (err) {
        console.warn('Gemini call timed out, falling back to heuristic engine:', err);
      }
      return null;
    }

    // =========================================================================
    // 1. AUTOFILL MODE
    // =========================================================================
    if (mode === 'autofill') {
      const rawPrompt = (prompt || '').trim();

      // Try with Gemini first
      const geminiSystem = `You are a high-speed data extraction AI for an Indian coaching institute named 'ICC KE GURUJI'.
Given a natural language prompt, extract and format fields into valid JSON for formType: "${formType}".
For student: return { name, phone, email, fatherName, address, streakDays, monthlyFee, classGrade, avatar }
For teacher: return { name, phone, email, subject, qualification, experience, salaryMonthly, address, bloodGroup, specialization, bio }
For course: return { title, subtitle, category, price, originalPrice, duration, instructorName, features }
For quiz: return { title, chapter, durationMinutes, totalMarks, questions: [{ question, options: [A,B,C,D], correctIndex: 0, explanation }] }
For announcement: return { title, message, category }
For fee: return { studentName, studentPhone, amountPaid, month, paymentMode }
Only return raw JSON without markdown formatting.`;

      const geminiResult = await callGemini(geminiSystem, rawPrompt, true);
      if (geminiResult) {
        try {
          const clean = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          return NextResponse.json({ success: true, data: parsed, source: 'gemini' });
        } catch {
          // fallback to heuristics
        }
      }

      // Smart Heuristic Fallback Engine
      const extracted: Record<string, unknown> = {};

      // Phone
      const phoneMatch = rawPrompt.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
      if (phoneMatch) extracted.phone = phoneMatch[0];

      // Email
      const emailMatch = rawPrompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) extracted.email = emailMatch[0];

      // Currency / Numbers
      const feeMatch = rawPrompt.match(/(?:rs\.?|inr|₹|fees?|fee|salary|price|amount)?\s*([0-9]{3,6})/i);
      if (feeMatch) {
        const numVal = parseInt(feeMatch[1], 10);
        if (formType === 'student') extracted.monthlyFee = numVal;
        if (formType === 'teacher') extracted.salaryMonthly = numVal;
        if (formType === 'course') extracted.price = numVal;
        if (formType === 'fee') extracted.amountPaid = numVal;
      }

      if (formType === 'student') {
        // Name guess: first few words before comma or phone or keywords
        const cleanWords = rawPrompt
          .replace(extracted.phone as string || '', '')
          .replace(extracted.email as string || '', '')
          .replace(/fee\s*\d+/i, '')
          .replace(/class\s*\d+/i, '')
          .split(/[,;\n]/)[0]
          .trim();
        extracted.name = cleanWords || 'Student';
        extracted.address = rawPrompt.includes('at ') || rawPrompt.includes('in ')
          ? rawPrompt.split(/(?:at|in|near|road|chowk|nagar|ward)\s+/i)[1]?.split(/[,.\n]/)[0]?.trim() || 'Patna, Bihar'
          : 'Station Road, Ward No. 4, Bihar';
        extracted.classGrade = rawPrompt.toLowerCase().includes('10')
          ? 'Class 10 Board Special'
          : rawPrompt.toLowerCase().includes('12')
          ? 'Class 12 - PCM Foundation'
          : 'Class 11 & 12 Science';
        extracted.streakDays = 5;
        extracted.avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80';
      } else if (formType === 'teacher') {
        extracted.name = rawPrompt.split(/[,;\n]/)[0].trim() || 'Faculty Educator';
        extracted.subject = rawPrompt.toLowerCase().includes('physics')
          ? 'Physics & Mechanics'
          : rawPrompt.toLowerCase().includes('math')
          ? 'Mathematics & Calculus'
          : rawPrompt.toLowerCase().includes('chem')
          ? 'Chemistry & Organic'
          : 'Science & Mentorship';
        extracted.qualification = 'M.Sc, B.Ed (Gold Medalist)';
        extracted.experience = '8+ Years Experience';
        extracted.address = 'Kankarbagh, Patna, Bihar';
        extracted.bloodGroup = 'O+';
        extracted.specialization = 'Board Exam Mastery & Competitive Drills';
        extracted.bio = 'Passionate mentor committed to making concepts crystal clear with daily numerical drills.';
      } else if (formType === 'announcement') {
        extracted.title = rawPrompt.split(/[:\n]/)[0].trim() || 'Important Coaching Notice';
        extracted.message = rawPrompt;
        extracted.category = 'general';
      }

      return NextResponse.json({ success: true, data: extracted, source: 'heuristic' });
    }

    // =========================================================================
    // 2. WEBSITE UPDATE MODE (HOMEPAGE DETAILS CHANGER)
    // =========================================================================
    if (mode === 'website_update') {
      const userInstruction = (prompt || '').trim();
      const geminiSystem = `You are the lead content & brand strategist for 'ICC KE GURUJI'.
Given the user's instructions and the current coaching website configuration, output updated fields as JSON.
Fields you can update:
- heroHeadline: Powerful catchy headline
- heroSubheadline: Inspiring subtitle
- marqueeNotice: Urgent announcement ticker
- admissionBadgeText: Special badge
- tagline: Subtitle tagline
- stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, stat4Value, stat4Label
- homeQuizQuestion, homeQuizOptions (array of 4), homeQuizCorrectIndex (0-3), homeQuizExplanation
Return only a valid JSON object with the keys that should be changed.`;

      const promptPayload = `Current Config:\n${JSON.stringify(currentConfig || {}, null, 2)}\n\nInstruction from Admin:\n"${userInstruction}"`;
      const geminiResult = await callGemini(geminiSystem, promptPayload, true);
      if (geminiResult) {
        try {
          const clean = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
          const patch = JSON.parse(clean);
          return NextResponse.json({ success: true, patch, source: 'gemini' });
        } catch {
          // fallback
        }
      }

      // Smart Heuristic Fallback
      const patch: Record<string, unknown> = {};
      const lower = userInstruction.toLowerCase();

      if (lower.includes('diwali') || lower.includes('discount') || lower.includes('offer')) {
        patch.admissionBadgeText = '🪔 Diwali Mahabachat Offer: 50% Flat Scholarship for All New Batches!';
        patch.heroHeadline = 'Master Board Exams & IIT-JEE with ICC KE GURUJI';
        patch.heroSubheadline = 'Festival Special Admissions Open! Secure your seat with top Bihar faculties, daily live doubt resolution & handwritten notes.';
      } else if (lower.includes('marquee') || lower.includes('notice')) {
        patch.marqueeNotice = `🔴 Notice: ${userInstruction}`;
      } else if (lower.includes('headline')) {
        patch.heroHeadline = userInstruction.replace(/headline|make|change|to/gi, '').trim();
      } else {
        patch.heroHeadline = userInstruction;
        patch.marqueeNotice = `📢 Update: ${userInstruction}`;
      }

      return NextResponse.json({ success: true, patch, source: 'heuristic' });
    }

    // =========================================================================
    // 3. STUDENT PROBLEM & DOUBT SOLVER
    // =========================================================================
    if (mode === 'solve_problem') {
      const studentQuery = problem || prompt;
      if (!studentQuery) {
        return NextResponse.json({ error: 'Problem statement required' }, { status: 400 });
      }

      const geminiSystem = `You are Guruji AI, an empathetic, top-tier educator for ICC KE GURUJI coaching institute.
You specialize in Classes 9th-12th CBSE/Bihar Board, IIT-JEE, and NEET syllabus.
Subject: ${subject || 'General STEM'}. Class Level: ${classLevel || 'Class 10-12'}.
Solve the student's problem following this exact structure:
1. 💡 **Core Concept & Formula**: Identify the fundamental physical/mathematical law.
2. 📝 **Step-by-Step Derivation / Numerical Solution**: Clear substitution with SI units.
3. 🎯 **Final Answer**: Emphasize the final numerical or conceptual result in bold.
4. 🧠 **Guruji Memory Trick**: Provide an easy mnemonic or common pitfall to avoid.
5. ⚡ **Quick Check Question**: 1 quick similar question with answer for the student to self-test.
Use friendly Hinglish (encouraging teacher tone) and clear markdown.`;

      const geminiResult = await callGemini(geminiSystem, studentQuery);
      if (geminiResult) {
        return NextResponse.json({ success: true, solution: geminiResult, source: 'gemini' });
      }

      // Contextual High-Precision Heuristic Solver Fallback
      const qLower = studentQuery.toLowerCase();
      let fallback = '';

      if (qLower.includes('velocity') || qLower.includes('stone') || qLower.includes('kinematics') || qLower.includes('acceleration')) {
        fallback = `### 💡 Core Concept & Formula (Equations of Motion)
When an object moves under uniform acceleration (or free fall under gravity $g = 9.8 \\text{ m/s}^2$ or $10 \\text{ m/s}^2$):
- $v = u + at$
- $s = ut + \\frac{1}{2}at^2$
- $v^2 = u^2 + 2as$

---
### 📝 Step-by-Step Numerical Solution:
1. **Given Data**:
   - Initial velocity ($u$) and acceleration ($a = -g$ upward).
   - At maximum height, final velocity $v = 0$.
2. **Formula Applied**:
   $$h_{max} = \\frac{u^2}{2g}$$
3. **Time of Flight**:
   $$T = \\frac{2u}{g}$$

---
### 🎯 Final Answer:
At peak altitude, instantaneous velocity becomes **0 m/s**, and maximum height attained is directly proportional to the square of initial velocity ($u^2$)!

---
### 🧠 Guruji Memory Trick:
> **"Upar jaye toh minus g, niche aaye toh plus g!"** Always remember that acceleration due to gravity always points toward Earth's center.

---
### ⚡ Quick Check Question:
*A ball is thrown vertically upward with $20 \\text{ m/s}$. Taking $g = 10 \\text{ m/s}^2$, what is its maximum height?*
**(Answer: $h = \\frac{20^2}{2 \\times 10} = 20 \\text{ meters}$)**`;
      } else if (qLower.includes('ohm') || qLower.includes('current') || qLower.includes('resistance')) {
        fallback = `### 💡 Core Concept & Formula (Ohm's Law)
At constant temperature, the electric current passing through a conductor is directly proportional to the potential difference across its ends:
$$V = I \\cdot R$$
Where $V$ is Voltage (Volts), $I$ is Current (Amperes), and $R$ is Resistance (Ohms $\\Omega$).

---
### 📝 Step-by-Step Derivation & Series/Parallel Shortcuts:
- **Series Combination**: $R_{eq} = R_1 + R_2 + R_3$ (Current remains identical).
- **Parallel Combination**: $\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2}$ (Voltage remains identical).

---
### 🎯 Final Answer:
Resistance is the internal opposition offered by the material to charge flow: $R = \\rho \\frac{l}{A}$.

---
### 🧠 Guruji Memory Trick:
> **"VIR formula: V on top, I and R shoulder-to-shoulder in the triangle!"**`;
      } else {
        fallback = `### 💡 Guruji Concept Solution:
**Your Question:** *"${studentQuery}"*

---
### 📝 Step-by-Step Breakdown:
1. **Understand Given Conditions**: Always list given variables and required variables with SI units.
2. **Select Governing Equation**: Write down the primary formula connecting these quantities.
3. **Careful Substitution**: Avoid sign errors, especially in vectors, calculus limits, and algebra.

---
### 🎯 Key Takeaway:
Review chapter fundamentals and practice 3 related numericals to build muscle memory!

---
### 🧠 Guruji Advice:
> *For live custom generation on any topic, provide your Gemini API key in \`.env.local\`.* Guruji is always here to support your success!`;
      }

      return NextResponse.json({ success: true, solution: fallback, source: 'heuristic' });
    }

    // =========================================================================
    // 4. GENERATE TIMED QUIZ
    // =========================================================================
    if (mode === 'generate_quiz') {
      const quizTopic = topic || 'Physics Class 12';
      const qCount = questionCount || 5;
      const dMins = durationMinutes || 10;

      const geminiSystem = `Generate a ${qCount}-question timed MCQ quiz on topic "${quizTopic}".
Output JSON:
{
  "title": "${quizTopic} Speed Test",
  "chapter": "${quizTopic}",
  "durationMinutes": ${dMins},
  "totalMarks": ${qCount * 4},
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ]
}
Only return valid JSON.`;

      const geminiResult = await callGemini(geminiSystem, `Generate quiz for ${quizTopic}`, true);
      if (geminiResult) {
        try {
          const clean = geminiResult.replace(/```json/g, '').replace(/```/g, '').trim();
          const quiz = JSON.parse(clean);
          return NextResponse.json({ success: true, quiz, source: 'gemini' });
        } catch {
          // fallback
        }
      }

      // Heuristic Mock Quiz Fallback
      const mockQuiz = {
        id: `quiz-ai-${Date.now()}`,
        courseId: 'course-1',
        title: `${quizTopic} Timed Speed Drill`,
        chapter: quizTopic,
        durationMinutes: dMins,
        totalMarks: 20,
        questions: [
          {
            id: 'q1',
            question: `In ${quizTopic}, what fundamental property is conserved in an isolated system?`,
            options: ['Total Energy and Momentum', 'Only Velocity', 'Only Heat', 'Neither Energy nor Momentum'],
            correctIndex: 0,
            explanation: 'The law of conservation states that total energy and momentum remain constant in any isolated closed physical system.'
          },
          {
            id: 'q2',
            question: 'What is the standard SI unit of Electric Potential difference?',
            options: ['Ampere (A)', 'Volt (V) or Joule/Coulomb', 'Ohm (Ω)', 'Tesla (T)'],
            correctIndex: 1,
            explanation: 'Electric potential is the work done per unit positive charge, hence 1 Volt = 1 Joule/Coulomb.'
          },
          {
            id: 'q3',
            question: 'When the speed of a moving body is doubled, its kinetic energy becomes:',
            options: ['Half', 'Double', 'Four times (4x)', 'Unchanged'],
            correctIndex: 2,
            explanation: 'Kinetic Energy = 1/2 * m * v². Since KE is proportional to v², doubling velocity increases KE by (2)² = 4 times.'
          }
        ]
      };

      return NextResponse.json({ success: true, quiz: mockQuiz, source: 'heuristic' });
    }

    return NextResponse.json({ error: 'Invalid mode specified' }, { status: 400 });
  } catch (error) {
    console.error('AI Studio API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
