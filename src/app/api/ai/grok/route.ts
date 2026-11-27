import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, messages } = body;

    const apiKey = (
      process.env.GROK_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.XAI_API_KEY ||
      process.env.NEXT_PUBLIC_GROK_API_KEY ||
      process.env.NEXT_PUBLIC_GROQ_API_KEY ||
      ''
    ).trim();

    const isApiKeyValid = apiKey && apiKey !== 'xai-your-api-key';
    const isGroq = apiKey.startsWith('gsk_');
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.x.ai/v1/chat/completions';
    const primaryModel = isGroq ? 'openai/gpt-oss-120b' : 'grok-beta';
    const fallbackModel = isGroq ? 'qwen/qwen3.8-27b' : 'grok-beta';

    // -------------------------------------------------------------
    // ACTION 1: EXAM PAPER GENERATOR (BSEB & JAC PATTERN)
    // -------------------------------------------------------------
    if (action === 'generate_exam_paper') {
      const {
        classLevel = 'Class 10',
        subject = 'Science',
        topic = 'Chemical Reactions & Equations',
        totalMarks = 50,
      } = payload || {};

      const prompt = `Generate a standard Examination Question Paper for IDEAL COACHING CENTRE (ICC).
Class: ${classLevel}
Subject: ${subject}
Chapter / Topic: ${topic}
Total Marks: ${totalMarks}
Time Allowed: 1 Hour 30 Minutes

Please format the question paper strictly in this structure:
1. HEADER: IDEAL COACHING CENTRE — ${classLevel} EXAMINATION (${subject.toUpperCase()})
2. GENERAL INSTRUCTIONS (Bilingual English & Hindi)
3. SECTION A: OBJECTIVE QUESTIONS (Multiple Choice Questions with 4 options A, B, C, D)
4. SECTION B: SHORT ANSWER QUESTIONS (2 Marks each, step-by-step concepts)
5. SECTION C: LONG ANSWER QUESTIONS (5 Marks each, comprehensive conceptual / numerical questions)
6. COMPLETE ANSWER KEY & MARKING SCHEME (Detailed explanations for all questions at the bottom)`;

      if (isApiKeyValid) {
        try {
          const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: primaryModel,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert curriculum developer and academic examiner. You produce clean, rigorous, formatted examination question papers with accurate answer keys.',
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.2,
              max_tokens: 2500,
            }),
          });

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              return NextResponse.json({
                success: true,
                paper: text,
                model: 'ICC Smart AI',
                live: true,
              });
            }
          } else if (isGroq) {
            // Retry with qwen model
            const retryRes = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: fallbackModel,
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are an expert academic curriculum developer and examination evaluator.',
                  },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.2,
                max_tokens: 2500,
              }),
            });
            if (retryRes.ok) {
              const data = await retryRes.json();
              const text = data.choices?.[0]?.message?.content;
              if (text) {
                return NextResponse.json({
                  success: true,
                  paper: text,
                  model: 'ICC Smart AI',
                  live: true,
                });
              }
            }
          }
        } catch (err) {
          console.warn('Grok exam generation failed, using local template:', err);
        }
      }

      // High-quality Domain Fallback Paper
      const fallbackPaper = `================================================================================
                    IDEAL COACHING CENTRE (ICC), GODDA
             ${classLevel.toUpperCase()} PERIODIC EVALUATION TEST — 2026
Subject: ${subject} | Topic: ${topic}
Time: 1 Hour 30 Mins                                           Total Marks: ${totalMarks}
================================================================================

GENERAL INSTRUCTIONS / सामान्य निर्देश:
1. All questions are compulsory. (सभी प्रश्न अनिवार्य हैं।)
2. Section A contains 10 Objective MCQs (1 Mark each).
3. Section B contains 5 Short Answer Questions (2 Marks each).
4. Section C contains 2 Long Answer Questions (5 Marks each).

--------------------------------------------------------------------------------
SECTION A: OBJECTIVE QUESTIONS (1 Mark Each / कुल 10 अंक)
--------------------------------------------------------------------------------
Q1. Which of the following is a displacement reaction?
    (a) 2KClO3 → 2KCl + 3O2
    (b) Fe + CuSO4 → FeSO4 + Cu
    (c) CaO + H2O → Ca(OH)2
    (d) 2Mg + O2 → 2MgO

Q2. What is the chemical formula of Quick Lime (बिना बुझा चूना)?
    (a) Ca(OH)2
    (b) CaCO3
    (c) CaO
    (d) CaCl2

Q3. Respiration is which type of reaction? (श्वसन किस प्रकार की अभिक्रिया है?)
    (a) Exothermic (ऊष्माक्षेपी)
    (b) Endothermic (ऊष्माशोषी)
    (c) Combination (संयोजन)
    (d) Reduction (अपचयन)

Q4. Rancidity of fats and oils can be prevented by adding:
    (a) Oxidants
    (b) Antioxidants
    (c) Water
    (d) Acids

Q5. What colour precipitate is formed when Lead Nitrate reacts with Potassium Iodide?
    (a) White
    (b) Yellow
    (c) Blue
    (d) Red

--------------------------------------------------------------------------------
SECTION B: SHORT ANSWER QUESTIONS (2 Marks Each / कुल 10 अंक)
--------------------------------------------------------------------------------
Q6. Define a combination reaction. Give one balanced chemical equation.
    (संयोजन अभिक्रिया किसे कहते हैं? एक संतुलित समीकरण लिखें।)

Q7. Why is respiration considered an exothermic reaction? Explain.
    (श्वसन को ऊष्माक्षेपी अभिक्रिया क्यों कहा जाता है? स्पष्ट करें।)

Q8. Balance the following chemical equations:
    (a) HNO3 + Ca(OH)2 → Ca(NO3)2 + H2O
    (b) NaOH + H2SO4 → Na2SO4 + H2O

Q9. What is a precipitation reaction? Give an example.
    (अवक्षेपण अभिक्रिया से आप क्या समझते हैं? उदाहरण दें।)

Q10. Why do we apply paint on iron articles?
     (लोहे की वस्तुओं पर हम पेंट क्यों लगाते हैं?)

--------------------------------------------------------------------------------
SECTION C: LONG ANSWER QUESTIONS (5 Marks Each / कुल 10 अंक)
--------------------------------------------------------------------------------
Q11. Explain oxidation and reduction with two suitable chemical equations. How do corrosion and rancidity affect daily life materials?
     (उपचयन एवं अपचयन को उदाहरण सहित समझाइए। संक्षारण और विकृतगंधिता हमारे दैनिक जीवन को कैसे प्रभावित करते हैं?)

Q12. Differentiate clearly between displacement and double displacement reactions with balanced equations and observations.
     (विस्थापन एवं द्विविस्थापन अभिक्रिया में संतुलित समीकरण एवं प्रेक्षण के साथ स्पष्ट अंतर स्पष्ट करें।)

================================================================================
                    DETAILED ANSWER KEY & MARKING SCHEME
================================================================================
Section A Answers:
1. (b) Fe + CuSO4 → FeSO4 + Cu (Iron displaces copper from CuSO4)
2. (c) CaO (Calcium Oxide)
3. (a) Exothermic (Glucose oxidation releases energy: C6H12O6 + 6O2 → 6CO2 + 6H2O + Energy)
4. (b) Antioxidants (Prevents aerial oxidation)
5. (b) Yellow precipitate of Lead Iodide (PbI2)

Section B Answers:
6. A reaction where two or more reactants combine to form a single product. Example: CaO + H2O → Ca(OH)2 + Heat.
7. During digestion, food is broken down into glucose. This glucose combines with oxygen in cells releasing energy. Hence it is exothermic.
8. (a) 2HNO3 + Ca(OH)2 → Ca(NO3)2 + 2H2O
   (b) 2NaOH + H2SO4 → Na2SO4 + 2H2O
9. Any reaction that produces an insoluble solid (precipitate) is called a precipitation reaction. Example: Na2SO4 + BaCl2 → BaSO4↓ + 2NaCl.
10. Paint prevents iron from coming into direct contact with moisture and oxygen from the atmosphere, thereby stopping rust (corrosion) formation.

Section C Hints & Key Concepts:
11. Oxidation: Addition of oxygen or removal of hydrogen. Reduction: Addition of hydrogen or removal of oxygen. Corrosion eats away metals (Rusting of iron: Fe2O3.xH2O). Rancidity causes foul smell/taste in oxidized edible oils.
12. Single displacement involves free active metal displacing a less active metal ion. Double displacement involves exchange of ions between two aqueous compounds.`;

      return NextResponse.json({
        success: true,
        paper: fallbackPaper,
        model: 'ICC Smart AI (Board Template)',
        live: false,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: AUTO-DRAFT DOUBT ANSWER FOR TEACHERS
    // -------------------------------------------------------------
    if (action === 'draft_doubt_solution') {
      const { title, description, subject } = payload || {};

      const prompt = `Student Doubt Resolution for IDEAL COACHING CENTRE:
Subject: ${subject || 'General'}
Question Title: ${title}
Details / Student Query: ${description}

Please write a comprehensive, crystal-clear, step-by-step teacher solution suitable for Class 9/10/11/12 examinations.
Include:
1. Direct clear answer
2. Step-by-step mathematical/chemical steps or formulas
3. Real-world example or intuition
4. Exam tip for getting full marks`;

      if (isApiKeyValid) {
        try {
          const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: primaryModel,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are Senior Faculty at IDEAL COACHING CENTRE. You explain concepts clearly, kindly, and step-by-step in bilingual Hindi/English.',
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.2,
            }),
          });

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              return NextResponse.json({
                success: true,
                solution: text,
                model: 'ICC Smart AI',
                live: true,
              });
            }
          }
        } catch (err) {
          console.warn('AI doubt resolution fallback:', err);
        }
      }

      const fallbackSolution = `प्रिय विद्यार्थी, आपके प्रश्न का चरणबद्ध समाधान नीचे दिया गया है:

1. मुख्य अवधारणा (Core Concept):
यूक्लिड विभाजन प्रमेयिका (Euclid's Division Lemma) के अनुसार:
a = bq + r, जहाँ 0 ≤ r < b होता है।

2. चरणबद्ध हल (Step-by-Step Solution):
संख्याएँ 135 और 225 का HCF ज्ञात करना:
- चरण 1: चूँकि 225 > 135,
  225 = 135 × 1 + 90 (यहाँ शेषफल r = 90 ≠ 0 है)
- चरण 2: अब भाजक 135 और नए शेषफल 90 पर विभाजन प्रमेयिका लागू करने पर:
  135 = 90 × 1 + 45 (यहाँ शेषफल r = 45 ≠ 0 है)
- चरण 3: अब भाजक 90 और नए शेषफल 45 पर विभाजन प्रमेयिका लागू करने पर:
  90 = 45 × 2 + 0 (यहाँ शेषफल r = 0 प्राप्त हो गया)

3. निष्कर्ष (Final Answer):
चूँकि इस अंतिम चरण में शेषफल 0 है तथा भाजक 45 है, अतः
HCF (135, 225) = 45 होगा।

बोर्ड परीक्षा टिप: परीक्षा में प्रत्येक चरण (Step) को स्पष्ट रूप से दर्शाएं, इससे पूरे अंक प्राप्त होते हैं।`;

      return NextResponse.json({
        success: true,
        solution: fallbackSolution,
        model: 'ICC Smart AI (Knowledge Base)',
        live: false,
      });
    }

    // -------------------------------------------------------------
    // ACTION 4: AI QUIZ GENERATOR FROM COURSE / PDF / STUDY MATERIALS
    // -------------------------------------------------------------
    if (action === 'generate_quiz') {
      const {
        courseTitle = 'Board Exam Course',
        className = 'Class 10',
        subjectName = 'Science',
        language = 'hi',
        count = 5,
        chaptersContext = [],
        materialsContext = [],
        excludeQuestions = [],
      } = payload || {};

      const isUrdu = String(subjectName).toLowerCase().includes('urdu') || language === 'ur';
      const targetLangLabel = isUrdu ? 'Urdu (اردو script ONLY)' : 'Hindi (Devanagari script / हिंदी ONLY)';

      // Attempt to fetch lightweight text snippets from public study material URLs if readable text/markdown
      let extractedMaterialSnippets = '';
      if (Array.isArray(materialsContext) && materialsContext.length > 0) {
        const snippetList: string[] = [];
        for (const mat of materialsContext.slice(0, 6)) {
          const title = mat?.title || '';
          const desc = mat?.description || '';
          const url = mat?.file_path || '';
          let extra = '';
          if (typeof url === 'string' && url.startsWith('http') && !url.toLowerCase().endsWith('.pdf')) {
            try {
              const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
              if (r.ok && (r.headers.get('content-type') || '').includes('text')) {
                extra = (await r.text()).slice(0, 600);
              }
            } catch {}
          }
          snippetList.push(`- ${title}${desc ? `: ${desc}` : ''}${extra ? ` | Content: ${extra}` : ''}`);
        }
        extractedMaterialSnippets = snippetList.join('\n');
      }

      const chaptersStr = Array.isArray(chaptersContext) && chaptersContext.length > 0
        ? chaptersContext.map((c: any) => `${c.chapter_number || ''}. ${c.title || ''}${c.description ? ` (${c.description})` : ''}`).join('\n')
        : 'Standard board syllabus chapters';

      const excludeStr = Array.isArray(excludeQuestions) && excludeQuestions.length > 0
        ? excludeQuestions.slice(-30).join('\n- ')
        : 'None';

      const quizPrompt = `Generate exactly ${count} unique multiple-choice quiz questions for a student of IDEAL COACHING CENTRE.
Course: ${courseTitle} (${className})
Subject: ${subjectName}
Target Question Language: ${targetLangLabel}

Available Chapters:
${chaptersStr}

Available Study Materials & PDF Notes Topics:
${extractedMaterialSnippets || 'Standard NCERT/BSEB/JAC notes for this subject'}

CRITICAL RULES:
1. Every question, all 4 options, and the explanation MUST be written strictly in ${targetLangLabel}.
2. Questions MUST be strictly relevant to ${className} ${subjectName} and the listed chapters/study materials.
3. NEVER repeat or paraphrase any of these already-mastered questions:
- ${excludeStr}
4. Return ONLY a valid JSON array (no markdown fences, no extra prose) of objects with exact keys:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "correctIndex": 0,
    "explanation": "...",
    "chapter": "..."
  }
]`;

      if (isApiKeyValid) {
        try {
          const aiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: primaryModel,
              messages: [
                {
                  role: 'system',
                  content: `You are an expert BSEB/JAC board exam question setter. Output ONLY a valid JSON array of ${count} MCQs strictly in ${targetLangLabel}.`,
                },
                { role: 'user', content: quizPrompt },
              ],
              temperature: 0.4,
              max_tokens: 2200,
            }),
          });

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            let raw = data.choices?.[0]?.message?.content || '';
            raw = raw.replace(/```json|```/gi, '').trim();
            const firstBracket = raw.indexOf('[');
            const lastBracket = raw.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
              raw = raw.slice(firstBracket, lastBracket + 1);
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return NextResponse.json({
                success: true,
                questions: parsed,
                live: true,
                language: isUrdu ? 'ur' : 'hi',
              });
            }
          }
        } catch (err) {
          console.warn('AI quiz generation fallback:', err);
        }
      }

      return NextResponse.json({
        success: true,
        questions: [],
        live: false,
        language: isUrdu ? 'ur' : 'hi',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action requested' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown AI error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
