-- ==============================================================================
-- IDEAL COACHING CENTRE — PRODUCTION SEED DATA
-- Target Boards: Bihar Board (BSEB) & Jharkhand Board (JAC)
-- Rich Bilingual Academic Curriculum (Classes 9, 10, 11, 12)
-- ==============================================================================

-- 1. Academic Boards
INSERT INTO public.academic_boards (id, code, name, name_hi, description, description_hi)
VALUES
('b0000000-0000-0000-0000-000000000001', 'BSEB', 'Bihar School Examination Board', 'बिहार विद्यालय परीक्षा समिति', 'Complete syllabus, model papers and previous years papers for Bihar State Board Matric and Inter.', 'बिहार बोर्ड मैट्रिक एवं इंटरमीडिएट परीक्षा के लिए संपूर्ण पाठ्यक्रम, मॉडल पेपर एवं पिछले वर्षों के प्रश्न पत्र।'),
('b0000000-0000-0000-0000-000000000002', 'JAC', 'Jharkhand Academic Council', 'झारखंड अधिविद्य परिषद्', 'Complete syllabus, question banks and notes for Jharkhand Academic Council Ranchi examinations.', 'झारखंड एकेडमिक काउंसिल रांची बोर्ड परीक्षाओं के लिए संपूर्ण पाठ्यक्रम, प्रश्न बैंक और हस्तलिखित नोट्स।')
ON CONFLICT (code) DO NOTHING;

-- 2. Academic Session
INSERT INTO public.academic_sessions (id, name, start_date, end_date, is_current)
VALUES
('s0000000-0000-0000-0000-000000000001', '2026-2027', '2026-04-01', '2027-03-31', true)
ON CONFLICT (name) DO NOTHING;

-- 3. Classes
INSERT INTO public.classes (id, name, name_hi, numeric_order)
VALUES
('c0000000-0000-0000-0000-000000000009', 'Class 9', 'कक्षा 9', 9),
('c0000000-0000-0000-0000-000000000010', 'Class 10', 'कक्षा 10', 10),
('c0000000-0000-0000-0000-000000000011', 'Class 11 (Science)', 'कक्षा 11 (विज्ञान)', 11),
('c0000000-0000-0000-0000-000000000012', 'Class 12 (Science)', 'कक्षा 12 (विज्ञान)', 12)
ON CONFLICT DO NOTHING;

-- 4. Subjects for BSEB Class 10
INSERT INTO public.subjects (id, board_id, class_id, name, name_hi, code, icon_name, display_order)
VALUES
('sub00000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Mathematics', 'गणित', 'BSEB10-MATH', 'calculator', 1),
('sub00000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Science (Physics, Chemistry, Biology)', 'विज्ञान (भौतिकी, रसायन, जीव विज्ञान)', 'BSEB10-SCI', 'flask', 2),
('sub00000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Social Science', 'सामाजिक विज्ञान', 'BSEB10-SST', 'globe', 3),
('sub00000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Hindi (Godhuli & Varnika)', 'हिंदी (गोधूलि एवं वर्णिका)', 'BSEB10-HIN', 'book', 4),
('sub00000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Sanskrit', 'संस्कृत', 'BSEB10-SKT', 'feather', 5),
('sub00000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'English (Panorama)', 'अंग्रेज़ी (Panorama)', 'BSEB10-ENG', 'book-open', 6)
ON CONFLICT (board_id, class_id, code) DO NOTHING;

-- 5. Subjects for JAC Class 10
INSERT INTO public.subjects (id, board_id, class_id, name, name_hi, code, icon_name, display_order)
VALUES
('sub00000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Mathematics', 'गणित', 'JAC10-MATH', 'calculator', 1),
('sub00000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Science', 'विज्ञान', 'JAC10-SCI', 'flask', 2),
('sub00000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Social Science', 'सामाजिक विज्ञान', 'JAC10-SST', 'globe', 3),
('sub00000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Hindi', 'हिंदी', 'JAC10-HIN', 'book', 4),
('sub00000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'English', 'अंग्रेज़ी', 'JAC10-ENG', 'book-open', 5)
ON CONFLICT (board_id, class_id, code) DO NOTHING;

-- 6. Chapters for BSEB Class 10 Science
INSERT INTO public.chapters (id, subject_id, chapter_number, title, title_hi, description, description_hi)
VALUES
('ch000000-0000-0000-0000-000000000001', 'sub00000-0000-0000-0000-000000000002', 1, 'Chemical Reactions and Equations', 'रासायनिक अभिक्रियाएँ एवं समीकरण', 'Study of chemical changes, balancing equations and reaction types.', 'रासायनिक परिवर्तनों, समीकरण संतुलन एवं अभिक्रियाओं के प्रकार का गहन अध्ययन।'),
('ch000000-0000-0000-0000-000000000002', 'sub00000-0000-0000-0000-000000000002', 2, 'Acids, Bases and Salts', 'अम्ल, क्षारक एवं लवण', 'Properties of acids, pH scale and common salts.', 'अम्ल और क्षारों के गुणधर्म, pH पैमाना और महत्वपूर्ण लवण।'),
('ch000000-0000-0000-0000-000000000003', 'sub00000-0000-0000-0000-000000000002', 3, 'Metals and Non-metals', 'धातु एवं अधातु', 'Physical and chemical properties, metallurgy and corrosion.', 'भौतिक एवं रासायनिक गुण, धातु निष्कर्षण और संक्षारण।'),
('ch000000-0000-0000-0000-000000000004', 'sub00000-0000-0000-0000-000000000002', 6, 'Life Processes', 'जैव प्रक्रम', 'Nutrition, respiration, transportation and excretion.', 'पोषण, श्वसन, वहन एवं उत्सर्जन की विस्तृत व्याख्या।'),
('ch000000-0000-0000-0000-000000000005', 'sub00000-0000-0000-0000-000000000002', 10, 'Light - Reflection and Refraction', 'प्रकाश - परावर्तन तथा अपवर्तन', 'Laws of reflection, spherical mirrors, refraction and lenses.', 'परावर्तन के नियम, गोलीय दर्पण, अपवर्तन तथा लेंस के सूत्र।'),
('ch000000-0000-0000-0000-000000000006', 'sub00000-0000-0000-0000-000000000002', 12, 'Electricity', 'विद्युत', 'Electric current, Ohm law, resistance, Joule heating effect.', 'विद्युत धारा, ओम का नियम, प्रतिरोधों का संयोजन, तापीय प्रभाव।')
ON CONFLICT (subject_id, chapter_number) DO NOTHING;

-- 7. Chapters for BSEB Class 10 Math
INSERT INTO public.chapters (id, subject_id, chapter_number, title, title_hi, description, description_hi)
VALUES
('ch000000-0000-0000-0000-000000000011', 'sub00000-0000-0000-0000-000000000001', 1, 'Real Numbers', 'वास्तविक संख्याएं', 'Euclid division lemma, Fundamental theorem of arithmetic, irrational numbers.', 'यूक्लिड विभाजन प्रमेयिका, अंकगणित की आधारभूत प्रमेय, अपरिमेय संख्याएं।'),
('ch000000-0000-0000-0000-000000000012', 'sub00000-0000-0000-0000-000000000001', 2, 'Polynomials', 'बहुपद', 'Geometrical meaning of zeroes, relationship between zeroes and coefficients.', 'शून्यकों का ज्यामितीय अर्थ, गुणांकों और शून्यकों में संबंध।'),
('ch000000-0000-0000-0000-000000000013', 'sub00000-0000-0000-0000-000000000001', 3, 'Linear Equations in Two Variables', 'दो चरों वाले रैखिक समीकरण युग्म', 'Graphical method, substitution, elimination and cross-multiplication.', 'आलेखीय विधि, प्रतिस्थापन विधि, विलोपन विधि तथा वज्र-गुणन विधि।'),
('ch000000-0000-0000-0000-000000000014', 'sub00000-0000-0000-0000-000000000001', 8, 'Introduction to Trigonometry', 'त्रिकोणमिति का परिचय', 'Trigonometric ratios, values for specific angles, trigonometric identities.', 'त्रिकोणमितीय अनुपात, विशिष्ट कोणों के मान, त्रिकोणमितीय सर्वसमिकाएँ।')
ON CONFLICT (subject_id, chapter_number) DO NOTHING;

-- 8. Sample Courses
INSERT INTO public.courses (
    id,
    title,
    title_hi,
    description,
    description_hi,
    thumbnail_url,
    board_id,
    class_id,
    session_id,
    is_free,
    price,
    discount_price,
    validity_days,
    is_published
)
VALUES
(
    'cr000000-0000-0000-0000-000000000001',
    'BSEB Class 10 Toppers Batch (2026-27)',
    'बिहार बोर्ड कक्षा 10 टॉपर बैच (2026-27)',
    'Comprehensive target batch for BSEB Class 10 Board exam with daily live classes, complete NCERT solutions, chapter-wise PDF notes, weekly mock tests and previous 10 years solved papers.',
    'बिहार बोर्ड मैट्रिक परीक्षा के लिए पूर्ण समर्पण बैच। प्रतिदिन लाइव कक्षाएं, संपूर्ण NCERT हल, हस्तलिखित नोट्स, साप्ताहिक टेस्ट एवं पिछले 10 वर्षों के हल प्रश्न पत्र।',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    's0000000-0000-0000-0000-000000000001',
    false,
    1499.00,
    799.00,
    365,
    true
),
(
    'cr000000-0000-0000-0000-000000000002',
    'JAC Class 10 Board Excellence Batch (2026-27)',
    'झारखंड बोर्ड कक्षा 10 सफलता बैच (2026-27)',
    'Complete master course for Jharkhand Board Matric exam covering Science, Mathematics, Social Science, Hindi & English with top coaching faculty.',
    'झारखंड बोर्ड मैट्रिक परीक्षा के लिए विशेष बैच। विज्ञान, गणित, सामाजिक विज्ञान एवं भाषा विषयों की पूर्ण तैयारी।',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000010',
    's0000000-0000-0000-0000-000000000001',
    false,
    1299.00,
    699.00,
    365,
    true
),
(
    'cr000000-0000-0000-0000-000000000003',
    'Free Foundation Batch - Class 10 Basics',
    'निःशुल्क आधार बैच - कक्षा 10 बेसिक',
    'Free foundation course for all Bihar & Jharkhand students covering essential Math and Science basics.',
    'बिहार और झारखंड के सभी छात्रों के लिए गणित और विज्ञान का निःशुल्क बेसिक फाउंडेशन कोर्स।',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    's0000000-0000-0000-0000-000000000001',
    true,
    0.00,
    0.00,
    365,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Map Course Subjects
INSERT INTO public.course_subjects (course_id, subject_id)
VALUES
('cr000000-0000-0000-0000-000000000001', 'sub00000-0000-0000-0000-000000000001'),
('cr000000-0000-0000-0000-000000000001', 'sub00000-0000-0000-0000-000000000002'),
('cr000000-0000-0000-0000-000000000001', 'sub00000-0000-0000-0000-000000000003'),
('cr000000-0000-0000-0000-000000000002', 'sub00000-0000-0000-0000-000000000011'),
('cr000000-0000-0000-0000-000000000002', 'sub00000-0000-0000-0000-000000000012'),
('cr000000-0000-0000-0000-000000000003', 'sub00000-0000-0000-0000-000000000001'),
('cr000000-0000-0000-0000-000000000003', 'sub00000-0000-0000-0000-000000000002')
ON CONFLICT (course_id, subject_id) DO NOTHING;

-- 9. Sample Batches
INSERT INTO public.batches (id, course_id, name, name_hi, schedule_info, start_date)
VALUES
('ba000000-0000-0000-0000-000000000001', 'cr000000-0000-0000-0000-000000000001', 'Morning Toppers Batch (प्रातःकालीन बैच)', 'प्रातःकालीन टॉपर बैच', 'Mon-Sat: 06:30 AM - 08:30 AM IST', '2026-04-15'),
('ba000000-0000-0000-0000-000000000002', 'cr000000-0000-0000-0000-000000000001', 'Evening Target Batch (सायंकालीन बैच)', 'सायंकालीन टारगेट बैच', 'Mon-Sat: 04:30 PM - 06:30 PM IST', '2026-04-15')
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Recorded Lectures (Using YouTube unlisted/educational embed video IDs)
INSERT INTO public.recorded_lectures (
    id,
    course_id,
    subject_id,
    chapter_id,
    title,
    title_hi,
    description,
    youtube_video_id,
    duration_seconds,
    lecture_order,
    is_free_preview
)
VALUES
(
    'lec00000-0000-0000-0000-000000000001',
    'cr000000-0000-0000-0000-000000000001',
    'sub00000-0000-0000-0000-000000000002',
    'ch000000-0000-0000-0000-000000000001',
    'Lec 01: Introduction to Chemical Reactions & Types',
    'लेक्चर 01: रासायनिक अभिक्रियाएँ एवं उनके प्रकार',
    'Concept of physical vs chemical change, reactants and products.',
    'dQw4w9WgXcQ',
    2700,
    1,
    true
),
(
    'lec00000-0000-0000-0000-000000000002',
    'cr000000-0000-0000-0000-000000000001',
    'sub00000-0000-0000-0000-000000000002',
    'ch000000-0000-0000-0000-000000000001',
    'Lec 02: Balancing Chemical Equations (Hit & Trial Method)',
    'लेक्चर 02: रासायनिक समीकरणों को संतुलित करना (सरल विधि)',
    'Step-by-step master technique to balance any equation for board exams.',
    'dQw4w9WgXcQ',
    3120,
    2,
    false
),
(
    'lec00000-0000-0000-0000-000000000003',
    'cr000000-0000-0000-0000-000000000001',
    'sub00000-0000-0000-0000-000000000001',
    'ch000000-0000-0000-0000-000000000011',
    'Lec 01: Real Numbers & Euclid Division Lemma',
    'लेक्चर 01: वास्तविक संख्याएं और यूक्लिड विभाजन प्रमेयिका',
    'Foundation of Number Systems and board exam question solving.',
    'dQw4w9WgXcQ',
    2850,
    1,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 11. Study Materials (Automatic PDF Mapping)
INSERT INTO public.study_materials (
    id,
    board_id,
    class_id,
    subject_id,
    chapter_id,
    title,
    title_hi,
    description,
    file_path,
    file_size_bytes,
    material_type,
    is_free,
    version
)
VALUES
(
    'mat00000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    'sub00000-0000-0000-0000-000000000002',
    'ch000000-0000-0000-0000-000000000001',
    'Chemical Reactions - Complete Handwritten Topper Notes',
    'रासायनिक अभिक्रियाएँ - संपूर्ण हस्तलिखित टॉपर नोट्स',
    'Crisp bilingual notes with NCERT highlighted points and reaction tables.',
    'bseb/class10/science/ch01_chemical_reactions_notes.pdf',
    2450000,
    'chapter_notes',
    false,
    1
),
(
    'mat00000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    'sub00000-0000-0000-0000-000000000001',
    'ch000000-0000-0000-0000-000000000011',
    'Real Numbers - Formula Sheet & Important Theorems',
    'वास्तविक संख्याएं - सूत्र पुस्तिका एवं महत्वपूर्ण प्रमेय',
    'One-page formula sheet for rapid exam revision.',
    'bseb/class10/math/ch01_real_numbers_formula.pdf',
    850000,
    'formula_sheet',
    true,
    1
),
(
    'mat00000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    'sub00000-0000-0000-0000-000000000002',
    'ch000000-0000-0000-0000-000000000001',
    'BSEB Class 10 Science - 5 Year Solved Board Questions',
    'बिहार बोर्ड कक्षा 10 विज्ञान - 5 वर्षीय हल प्रश्न पत्र',
    'Previous year questions with official model marking scheme.',
    'bseb/class10/science/ch01_pyq_solutions.pdf',
    3120000,
    'pyq',
    false,
    1
)
ON CONFLICT (id) DO NOTHING;

-- 12. Sample Examination
INSERT INTO public.examinations (
    id,
    course_id,
    subject_id,
    chapter_id,
    title,
    title_hi,
    description,
    duration_minutes,
    total_marks,
    pass_marks,
    negative_marking,
    exam_type,
    is_published
)
VALUES
(
    'ex000000-0000-0000-0000-000000000001',
    'cr000000-0000-0000-0000-000000000001',
    'sub00000-0000-0000-0000-000000000002',
    'ch000000-0000-0000-0000-000000000001',
    'Science Chapter 1: Chemical Reactions & Equations Practice Test',
    'विज्ञान अध्याय 1: रासायनिक अभिक्रियाएँ एवं समीकरण अभ्यास परीक्षा',
    'Timed MCQ test based strictly on BSEB Matric Exam pattern with negative marking.',
    30,
    20.00,
    7.00,
    0.25,
    'chapter_test',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Sample Questions for Examination
INSERT INTO public.questions (
    id,
    exam_id,
    question_text,
    question_text_hi,
    question_type,
    options,
    correct_answer,
    explanation,
    explanation_hi,
    marks,
    question_order
)
VALUES
(
    'q0000000-0000-0000-0000-000000000001',
    'ex000000-0000-0000-0000-000000000001',
    'What type of reaction occurs when Quick Lime (CaO) reacts with water?',
    'जब कली चूना (CaO) जल से अभिक्रिया करता है, तो यह किस प्रकार की अभिक्रिया होती है?',
    'single_choice',
    '[
        {"id": "opt1", "text": "Exothermic combination reaction", "text_hi": "ऊष्माक्षेपी संयोजन अभिक्रिया"},
        {"id": "opt2", "text": "Endothermic decomposition reaction", "text_hi": "ऊष्माशोषी वियोजन अभिक्रिया"},
        {"id": "opt3", "text": "Displacement reaction", "text_hi": "विस्थापन अभिक्रिया"},
        {"id": "opt4", "text": "Neutralization reaction only", "text_hi": "केवल उदासीनीकरण अभिक्रिया"}
    ]'::jsonb,
    '"opt1"'::jsonb,
    'CaO + H2O -> Ca(OH)2 + Heat. Heat is evolved, so it is an exothermic combination reaction.',
    'CaO + H2O -> Ca(OH)2 + ऊष्मा। इस अभिक्रिया में ऊष्मा उत्सर्जित होती है और दो अभिकारक मिलकर एक उत्पाद बनाते हैं, अतः यह ऊष्माक्षेपी संयोजन अभिक्रिया है।',
    1.00,
    1
),
(
    'q0000000-0000-0000-0000-000000000002',
    'ex000000-0000-0000-0000-000000000001',
    'Which gas is released when Zinc granules react with dilute Sulphuric acid?',
    'जिंक के दानों पर तनु सल्फ्यूरिक अम्ल डालने पर कौन सी गैस उत्सर्जित होती है?',
    'single_choice',
    '[
        {"id": "opt1", "text": "Oxygen (O2)", "text_hi": "ऑक्सीजन (O2)"},
        {"id": "opt2", "text": "Hydrogen (H2)", "text_hi": "हाइड्रोजन (H2)"},
        {"id": "opt3", "text": "Carbon dioxide (CO2)", "text_hi": "कार्बन डाइऑक्साइड (CO2)"},
        {"id": "opt4", "text": "Sulphur dioxide (SO2)", "text_hi": "सल्फर डाइऑक्साइड (SO2)"}
    ]'::jsonb,
    '"opt2"'::jsonb,
    'Zn + H2SO4 -> ZnSO4 + H2 ^. Hydrogen gas burns with a pop sound.',
    'Zn + H2SO4 -> ZnSO4 + H2 ^. धातु अम्ल से क्रिया कर हाइड्रोजन गैस उत्पन्न करते हैं जो फट-फट (pop) की ध्वनि के साथ जलती है।',
    1.00,
    2
),
(
    'q0000000-0000-0000-0000-000000000003',
    'ex000000-0000-0000-0000-000000000001',
    'Rusting of iron is an example of redox reaction and slow oxidation.',
    'लोहे पर जंग लगना एक रेडॉक्स (उपचयन-अपचयन) अभिक्रिया और मंद ऑक्सीकरण का उदाहरण है।',
    'true_false',
    '[
        {"id": "true", "text": "True", "text_hi": "सत्य"},
        {"id": "false", "text": "False", "text_hi": "असत्य"}
    ]'::jsonb,
    '"true"'::jsonb,
    'Rusting requires moisture and oxygen where iron undergoes oxidation, making it a redox process.',
    'जंग लगने के लिए नमी और ऑक्सीजन की आवश्यकता होती है जहाँ लोहे का ऑक्सीकरण होता है, अतः यह सत्य है।',
    1.00,
    3
)
ON CONFLICT (id) DO NOTHING;

-- 13. Platform Settings
INSERT INTO public.platform_settings (key, value, description)
VALUES
(
    'institution_profile',
    '{
        "name": "IDEAL COACHING CENTRE",
        "tagline": "बिहार एवं झारखंड बोर्ड परीक्षा में शत-प्रतिशत सफलता का विश्वसनीय संस्थान",
        "tagline_en": "Premier Coaching Institution for BSEB & JAC Board Exams",
        "address": "Main Market Road, Near Gandhi Chowk, Bihar / Jharkhand",
        "contact_phone": "+91 98765 43210",
        "contact_email": "contact@idealcoachingcentre.com",
        "whatsapp_number": "919876543210",
        "website_url": "https://idealcoachingcentre.com",
        "established_year": 2015
    }'::jsonb,
    'General institution information and contact details'
),
(
    'payment_config',
    '{
        "upi_id": "idealcoaching@upi",
        "account_holder_name": "IDEAL COACHING CENTRE",
        "bank_name": "State Bank of India",
        "account_number": "XXXXXXXX1234",
        "ifsc_code": "SBIN0001234",
        "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=idealcoaching@upi&pn=IDEAL%20COACHING%20CENTRE&cu=INR",
        "instructions_hi": "1. दिए गए क्यूआर कोड या UPI ID (idealcoaching@upi) पर गूगल पे, फोनपे या पेटीएम से भुगतान करें।\n2. भुगतान के उपरांत 12 अंकों का UTR/Transaction ID दर्ज करें।\n3. रसीद का स्क्रीनशॉट संलग्न करें और सबमिट करें। 1 घंटे के अंदर आपका कोर्स एक्टिवेट हो जाएगा।",
        "instructions_en": "1. Pay using Google Pay, PhonePe, or Paytm using the QR Code or UPI ID.\n2. Enter the 12-digit UTR/Transaction Reference Number.\n3. Upload screenshot and submit. Course will be activated within 1 hour."
    }'::jsonb,
    'Manual UPI Payment details and student instructions'
),
(
    'academic_config',
    '{
        "supported_boards": ["BSEB", "JAC"],
        "default_language": "hi",
        "supported_languages": ["hi", "en"],
        "currency": "INR",
        "currency_symbol": "₹",
        "timezone": "Asia/Kolkata"
    }'::jsonb,
    'Academic constraints and regional configuration'
),
(
    'free_tier_monitor',
    '{
        "max_db_size_mb": 500,
        "max_storage_size_mb": 1000,
        "max_auth_users": 50000,
        "current_policy": "Zero-Paid Free Tier Compliance"
    }'::jsonb,
    'Quotas and alerts tracking for zero-cost operation'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
