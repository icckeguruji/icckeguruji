import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { translations, formatINR } from '@icc/shared-utils';
import {
  academicService,
  AcademicSubject,
  SubSubject,
  AcademicChapter,
  RecordedLecture,
} from '../../src/services/academicService';
import { Course, LiveClass, StudyMaterial } from '@icc/shared-types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  BookOpen,
  Radio,
  FileText,
  Video,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Play,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  X,
  Share2,
} from 'lucide-react-native';

const thumbMap: Record<string, any> = {
  'c0000000-0000-0000-0000-000000000010': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'c0000000-0000-0000-0000-000000000009': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'c0000000-0000-0000-0000-000000000008': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'c0000000-0000-0000-0000-000000000007': require('../../assets/thumbnails/batch-b2-class7.jpg'),
  'cr000000-0000-0000-0000-000000000001': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'cr000000-0000-0000-0000-000000000002': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'cr000000-0000-0000-0000-000000000003': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'cr000000-0000-0000-0000-000000000004': require('../../assets/thumbnails/batch-b2-class7.jpg'),
  '10000000-0000-0000-0000-000000000001': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  '10000000-0000-0000-0000-000000000002': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  '10000000-0000-0000-0000-000000000003': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'batch-b3-class10': require('../../assets/thumbnails/batch-b3-class10.jpg'),
  'batch-b4-class9': require('../../assets/thumbnails/batch-b4-class9.jpg'),
  'batch-b1-class8': require('../../assets/thumbnails/batch-b1-class8.jpg'),
  'batch-b2-class7': require('../../assets/thumbnails/batch-b2-class7.jpg'),
};

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, language } = useAuthStore();
  const t = translations[language] || translations.en;

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.role === 'teacher' ||
    user?.email === 'icckeguruji@gmail.com' ||
    user?.mobile_number === '9771350910' ||
    user?.username === 'badesir';

  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const course = currentCourse;

  // Hierarchy Navigation States:
  // 'subjects' -> 'sub_subjects' (if applicable) -> 'chapters' -> 'chapter_content'
  const [activeLevel, setActiveLevel] = useState<'subjects' | 'sub_subjects' | 'chapters' | 'chapter_content'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubject | null>(null);
  const [selectedSubSubject, setSelectedSubSubject] = useState<SubSubject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<AcademicChapter | null>(null);

  // Content tab inside chapter: 'live' | 'videos' | 'notes'
  const [chapterContentTab, setChapterContentTab] = useState<'live' | 'videos' | 'notes'>('videos');

  // Academic data states
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [chapters, setChapters] = useState<AcademicChapter[]>([]);
  const [recordedLectures, setRecordedLectures] = useState<RecordedLecture[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  // Admin Modals
  const [modalType, setModalType] = useState<
    'none' | 'add_subject' | 'add_sub_subject' | 'add_chapter' | 'add_lecture' | 'schedule_live' | 'upload_notes'
  >('none');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTitleHi, setFormTitleHi] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVideoId, setFormVideoId] = useState('');
  const [formDuration, setFormDuration] = useState('45');
  const [formPdfUri, setFormPdfUri] = useState<string | null>(null);
  const [formPdfName, setFormPdfName] = useState<string | null>(null);

  useEffect(() => {
    loadAcademicData();
  }, [id]);

  const loadAcademicData = async () => {
    setLoading(true);
    try {
      const found = await academicService.getCourseById(id);
      setCurrentCourse(found || null);
      if (found) {
        const className = academicService.getClassNameFromCourse(found);
        const subs = await academicService.getSubjects(id, className);
        setSubjects(subs);
      }
    } catch (e) {
      console.warn('Error loading academic data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubject = async (sub: AcademicSubject) => {
    setSelectedSubject(sub);
    if (sub.has_sub_subjects && sub.sub_subjects && sub.sub_subjects.length > 0) {
      setActiveLevel('sub_subjects');
    } else {
      setSelectedSubSubject(null);
      const chaps = await academicService.getChapters(sub.id);
      setChapters(chaps);
      setActiveLevel('chapters');
    }
  };

  const handleSelectSubSubject = async (subSub: SubSubject) => {
    if (!selectedSubject) return;
    setSelectedSubSubject(subSub);
    const chaps = await academicService.getChapters(selectedSubject.id, subSub.id);
    setChapters(chaps);
    setActiveLevel('chapters');
  };

  const handleSelectChapter = async (chap: AcademicChapter) => {
    setSelectedChapter(chap);
    setActiveLevel('chapter_content');

    // Load content for this chapter
    const lecs = await academicService.getRecordedLectures(chap.id);
    setRecordedLectures(lecs);

    const lives = await academicService.getLiveClasses(chap.id);
    setLiveClasses(lives);

    const mats = await academicService.getStudyMaterials(chap.id);
    setStudyMaterials(mats);
  };

  // --- ADMIN ACTIONS ---

  const handleCreateSubject = async () => {
    if (!currentCourse) return;
    if (!formTitle.trim()) {
      Alert.alert('Required', 'Please enter subject name');
      return;
    }
    const className = academicService.getClassNameFromCourse(currentCourse);
    const newSub = await academicService.addSubject({
      course_id: currentCourse.id,
      class_name: className,
      name: formTitle.trim(),
      name_hi: formTitleHi.trim() || formTitle.trim(),
      has_sub_subjects: false,
    });
    setSubjects((prev) => [...prev, newSub]);
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'Subject added successfully!');
  };

  const handleDeleteSubject = async (subId: string) => {
    Alert.alert('Delete Subject', 'Are you sure you want to delete this subject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteSubject(subId);
          setSubjects((prev) => prev.filter((s) => s.id !== subId));
        },
      },
    ]);
  };

  const handleCreateSubSubject = async () => {
    if (!selectedSubject || !formTitle.trim()) {
      Alert.alert('Required', 'Please enter sub-subject name');
      return;
    }
    const newSubSub = await academicService.addSubSubject(selectedSubject.id, {
      name: formTitle.trim(),
      name_hi: formTitleHi.trim() || formTitle.trim(),
    });
    setSelectedSubject({
      ...selectedSubject,
      has_sub_subjects: true,
      sub_subjects: [...(selectedSubject.sub_subjects || []), newSubSub],
    });
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'Sub-Subject created!');
  };

  const handleCreateChapter = async () => {
    if (!currentCourse || !selectedSubject || !formTitle.trim()) {
      Alert.alert('Required', 'Please enter chapter title');
      return;
    }
    const className = academicService.getClassNameFromCourse(currentCourse);
    const newChap = await academicService.addChapter({
      subject_id: selectedSubject.id,
      sub_subject_id: selectedSubSubject?.id,
      course_id: currentCourse.id,
      class_name: className,
      chapter_number: chapters.length + 1,
      title: formTitle.trim(),
      title_hi: formTitleHi.trim() || formTitle.trim(),
      description: formDesc.trim(),
    });
    setChapters((prev) => [...prev, newChap]);
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'Chapter added successfully!');
  };

  const handleDeleteChapter = async (chapId: string) => {
    Alert.alert('Delete Chapter', 'Are you sure you want to delete this chapter?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await academicService.deleteChapter(chapId);
          setChapters((prev) => prev.filter((c) => c.id !== chapId));
        },
      },
    ]);
  };

  const handleAddVideoLecture = async () => {
    if (!currentCourse || !selectedChapter || !formTitle.trim() || !formVideoId.trim()) {
      Alert.alert('Required', 'Please enter lecture title and YouTube Video ID / Link');
      return;
    }

    // Extract YouTube ID if full URL pasted
    let cleanVideoId = formVideoId.trim();
    if (cleanVideoId.includes('v=')) {
      cleanVideoId = cleanVideoId.split('v=')[1]?.split('&')[0] || cleanVideoId;
    } else if (cleanVideoId.includes('youtu.be/')) {
      cleanVideoId = cleanVideoId.split('youtu.be/')[1]?.split('?')[0] || cleanVideoId;
    }

    const newLec = await academicService.addRecordedLecture({
      course_id: currentCourse.id,
      subject_id: selectedSubject?.id,
      sub_subject_id: selectedSubSubject?.id,
      chapter_id: selectedChapter.id,
      title: formTitle.trim(),
      title_hi: formTitleHi.trim() || formTitle.trim(),
      youtube_video_id: cleanVideoId,
      duration_seconds: (parseInt(formDuration, 10) || 45) * 60,
      is_free_preview: false,
    });
    setRecordedLectures((prev) => [...prev, newLec]);
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'Video lecture added to chapter!');
  };

  const handleScheduleLiveClass = async () => {
    if (!currentCourse || !selectedChapter || !formTitle.trim()) {
      Alert.alert('Required', 'Please enter live class title');
      return;
    }

    let cleanVideoId = formVideoId.trim() || 'jfKfPfyJRdk';
    if (cleanVideoId.includes('v=')) {
      cleanVideoId = cleanVideoId.split('v=')[1]?.split('&')[0] || cleanVideoId;
    } else if (cleanVideoId.includes('youtu.be/')) {
      cleanVideoId = cleanVideoId.split('youtu.be/')[1]?.split('?')[0] || cleanVideoId;
    }

    const className = academicService.getClassNameFromCourse(currentCourse);
    const newLive = await academicService.scheduleLiveClass({
      course_id: currentCourse.id,
      chapter_id: selectedChapter.id,
      subject_id: selectedSubject?.id,
      class_name: className,
      title: formTitle.trim(),
      title_hi: formTitleHi.trim() || formTitle.trim(),
      youtube_video_id: cleanVideoId,
      scheduled_at: new Date().toISOString(),
      duration_minutes: parseInt(formDuration, 10) || 60,
      status: 'live',
    });
    setLiveClasses((prev) => [newLive, ...prev]);
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'Live Class started and broadcasted to students!');
  };

  const handlePickAndUploadPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setFormPdfUri(file.uri);
        setFormPdfName(file.name);
        if (!formTitle) setFormTitle(file.name.replace(/\.pdf$/i, ''));
      }
    } catch (err) {
      Alert.alert('File Picker Error', 'Could not open device document storage.');
    }
  };

  const handleSaveUploadedPdfNotes = async () => {
    if (!currentCourse || !selectedChapter || !formTitle.trim()) {
      Alert.alert('Required', 'Please enter notes title');
      return;
    }
    const className = academicService.getClassNameFromCourse(currentCourse);
    const newMat = await academicService.addStudyMaterial({
      subject_id: selectedSubject?.id,
      chapter_id: selectedChapter.id,
      class_name: className,
      title: formTitle.trim(),
      title_hi: formTitleHi.trim() || formTitle.trim(),
      description: formDesc.trim(),
      file_path: formPdfUri || 'bseb/class10/uploaded_notes.pdf',
      file_size_bytes: 2500000,
      material_type: 'chapter_notes',
      is_free: true,
    });
    setStudyMaterials((prev) => [newMat, ...prev]);
    setModalType('none');
    resetForm();
    Alert.alert('Success', 'PDF Notes uploaded and linked to this chapter!');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormTitleHi('');
    setFormDesc('');
    setFormVideoId('');
    setFormDuration('45');
    setFormPdfUri(null);
    setFormPdfName(null);
  };

  // Back Navigation within Hierarchy
  const handleBackHierarchy = () => {
    if (activeLevel === 'chapter_content') {
      setActiveLevel('chapters');
    } else if (activeLevel === 'chapters') {
      if (selectedSubject?.has_sub_subjects) {
        setActiveLevel('sub_subjects');
      } else {
        setActiveLevel('subjects');
      }
    } else if (activeLevel === 'sub_subjects') {
      setActiveLevel('subjects');
    } else {
      router.back();
    }
  };

  if (loading && !course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Course Details</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Course Details</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
            कोर्स उपलब्ध नहीं है (Course Not Available)
          </Text>
          <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 }}>
            यह कोर्स हटा दिया गया है या उपलब्ध नहीं है।
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }}
            onPress={() => router.replace('/courses')}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>सभी कोर्सेस देखें</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header & Breadcrumb Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleBackHierarchy} style={styles.backButton}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {activeLevel === 'chapter_content'
              ? `${selectedChapter?.chapter_number ? `Ch ${selectedChapter.chapter_number}: ` : ''}${selectedChapter?.title}`
              : activeLevel === 'chapters'
              ? `${selectedSubSubject ? `${selectedSubSubject.name} Chapters` : `${selectedSubject?.name} Chapters`}`
              : activeLevel === 'sub_subjects'
              ? `${selectedSubject?.name} (Sub-Subjects)`
              : course.title}
          </Text>
          <Text style={styles.navSubTitle}>
            {activeLevel === 'subjects'
              ? 'Course Curriculum'
              : `${selectedSubject?.name || ''} ${selectedSubSubject ? `› ${selectedSubSubject.name}` : ''}`}
          </Text>
        </View>

        {isAdmin && (
          <View style={styles.adminIndicatorBadge}>
            <Sparkles size={11} color="#B45309" />
            <Text style={styles.adminIndicatorText}>BADE SIR</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner only visible at Top Subjects Level */}
        {activeLevel === 'subjects' && (
          <View style={styles.bannerContainer}>
            <Image
              source={thumbMap[course.id] || { uri: course.thumbnail_url }}
              style={styles.bannerImage}
              resizeMode="contain"
            />
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>
                {course.is_free ? t.freeBatch : formatINR(course.discount_price || course.price)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.body}>
          {/* LEVEL 1: SUBJECTS LIST */}
          {activeLevel === 'subjects' && (
            <View>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Subjects (विषय सूची)</Text>
                  <Text style={styles.sectionSubHeading}>
                    Tap a subject to explore sub-subjects and chapters
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.addActionButton}
                    onPress={() => setModalType('add_subject')}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addActionButtonText}>Add Subject</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.subjectsGrid}>
                {subjects.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subjectCard}
                    onPress={() => handleSelectSubject(sub)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subjectIconBox}>
                      <BookOpen size={22} color="#2563EB" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectName}>{sub.name}</Text>
                      <Text style={styles.subjectNameHi}>{sub.name_hi}</Text>
                      <Text style={styles.subjectMeta}>
                        {sub.has_sub_subjects
                          ? `${sub.sub_subjects?.length || 3} Disciplines (Physics, Chemistry, Bio)`
                          : 'Direct Chapters & Notes'}
                      </Text>
                    </View>

                    <View style={styles.subjectActionRight}>
                      {isAdmin ? (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteSubject(sub.id);
                          }}
                          style={styles.trashSmallBtn}
                        >
                          <Trash2 size={15} color="#EF4444" />
                        </TouchableOpacity>
                      ) : (
                        <ChevronRight size={18} color="#94A3B8" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* LEVEL 2: SUB-SUBJECTS (e.g. Science -> Physics, Chemistry, Biology) */}
          {activeLevel === 'sub_subjects' && selectedSubject && (
            <View>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>
                    {selectedSubject.name} Disciplines
                  </Text>
                  <Text style={styles.sectionSubHeading}>
                    Choose subject discipline to access chapter-wise videos & notes
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.addActionButton}
                    onPress={() => setModalType('add_sub_subject')}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addActionButtonText}>Add Sub-Subject</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.subSubjectsList}>
                {selectedSubject.sub_subjects?.map((subSub) => (
                  <TouchableOpacity
                    key={subSub.id}
                    style={styles.subSubjectCard}
                    onPress={() => handleSelectSubSubject(subSub)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.subSubjectBadge}>
                      <Layers size={20} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subSubjectName}>{subSub.name}</Text>
                      <Text style={styles.subSubjectNameHi}>{subSub.name_hi}</Text>
                    </View>
                    <ChevronRight size={18} color="#64748B" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* LEVEL 3: CHAPTERS LIST */}
          {activeLevel === 'chapters' && selectedSubject && (
            <View>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>
                    {selectedSubSubject ? selectedSubSubject.name : selectedSubject.name} Chapters (पाठ सूची)
                  </Text>
                  <Text style={styles.sectionSubHeading}>
                    Tap a chapter for live class, recorded videos & handwritten PDF notes
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.addActionButton}
                    onPress={() => setModalType('add_chapter')}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addActionButtonText}>Add Chapter</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.chaptersList}>
                {chapters.map((chap) => (
                  <TouchableOpacity
                    key={chap.id}
                    style={styles.chapterCard}
                    onPress={() => handleSelectChapter(chap)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chapterNumberCircle}>
                      <Text style={styles.chapterNumberText}>
                        {chap.chapter_number < 10 ? `0${chap.chapter_number}` : chap.chapter_number}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.chapterTitleText}>{chap.title}</Text>
                      <Text style={styles.chapterTitleHiText}>{chap.title_hi}</Text>

                      <View style={styles.chapterPillRow}>
                        {chap.live_count ? (
                          <View style={styles.liveTagPill}>
                            <Radio size={10} color="#DC2626" />
                            <Text style={styles.liveTagText}>Live Available</Text>
                          </View>
                        ) : null}

                        <View style={styles.countPill}>
                          <Video size={10} color="#2563EB" />
                          <Text style={styles.countPillText}>{chap.lecture_count || 4} Videos</Text>
                        </View>

                        <View style={styles.countPill}>
                          <FileText size={10} color="#059669" />
                          <Text style={styles.countPillText}>{chap.material_count || 2} PDFs</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {isAdmin && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(chap.id);
                          }}
                          style={styles.trashSmallBtn}
                        >
                          <Trash2 size={15} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                      <ChevronRight size={18} color="#94A3B8" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* LEVEL 4: CHAPTER CONTENT (LIVE, VIDEOS, PDF NOTES) */}
          {activeLevel === 'chapter_content' && selectedChapter && (
            <View>
              {/* Segmented Content Tabs */}
              <View style={styles.contentSegmentRow}>
                <TouchableOpacity
                  style={[styles.segmentBtn, chapterContentTab === 'live' && styles.segmentBtnActive]}
                  onPress={() => setChapterContentTab('live')}
                >
                  <Radio size={14} color={chapterContentTab === 'live' ? '#DC2626' : '#64748B'} />
                  <Text style={[styles.segmentBtnText, chapterContentTab === 'live' && styles.segmentBtnTextActive]}>
                    Live Class
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, chapterContentTab === 'videos' && styles.segmentBtnActive]}
                  onPress={() => setChapterContentTab('videos')}
                >
                  <Video size={14} color={chapterContentTab === 'videos' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.segmentBtnText, chapterContentTab === 'videos' && styles.segmentBtnTextActive]}>
                    Recorded ({recordedLectures.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, chapterContentTab === 'notes' && styles.segmentBtnActive]}
                  onPress={() => setChapterContentTab('notes')}
                >
                  <FileText size={14} color={chapterContentTab === 'notes' ? '#059669' : '#64748B'} />
                  <Text style={[styles.segmentBtnText, chapterContentTab === 'notes' && styles.segmentBtnTextActive]}>
                    PDF Notes ({studyMaterials.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB 1: LIVE CLASS FOR THIS CHAPTER */}
              {chapterContentTab === 'live' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.subSectionTitle}>🔴 Live Sessions for this Chapter</Text>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.addActionButtonRed}
                        onPress={() => setModalType('schedule_live')}
                      >
                        <Radio size={14} color="#FFFFFF" />
                        <Text style={styles.addActionButtonText}>Go Live / Schedule</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {liveClasses.length === 0 ? (
                    <View style={styles.emptyStateBox}>
                      <Radio size={32} color="#94A3B8" />
                      <Text style={styles.emptyStateTitle}>No Active Live Class</Text>
                      <Text style={styles.emptyStateSub}>
                        Next live class for {selectedChapter.title} will be announced by Director BADE SIR.
                      </Text>
                    </View>
                  ) : (
                    liveClasses.map((item) => (
                      <View key={item.id} style={styles.liveClassCard}>
                        <View style={styles.liveBadgeRow}>
                          <View style={styles.livePill}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.livePillText}>LIVE NOW</Text>
                          </View>
                          <Text style={styles.liveDurationText}>{item.duration_minutes} Mins</Text>
                        </View>
                        <Text style={styles.liveCardTitle}>{item.title}</Text>
                        <Text style={styles.liveCardDesc}>{item.description}</Text>

                        <TouchableOpacity
                          style={styles.joinLiveBtn}
                          onPress={() => router.push(`/lecture/${item.id}`)}
                        >
                          <Play size={16} color="#FFFFFF" />
                          <Text style={styles.joinLiveBtnText}>Join Live Broadcast (लाइव देखें)</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* TAB 2: RECORDED VIDEO LECTURES */}
              {chapterContentTab === 'videos' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.subSectionTitle}>📹 Chapter Video Lectures</Text>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.addActionButton}
                        onPress={() => setModalType('add_lecture')}
                      >
                        <Plus size={14} color="#FFFFFF" />
                        <Text style={styles.addActionButtonText}>Add Lecture</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {recordedLectures.length === 0 ? (
                    <View style={styles.emptyStateBox}>
                      <Video size={32} color="#94A3B8" />
                      <Text style={styles.emptyStateTitle}>No Videos Yet</Text>
                      <Text style={styles.emptyStateSub}>Lectures will be added soon.</Text>
                    </View>
                  ) : (
                    recordedLectures.map((lec, idx) => (
                      <TouchableOpacity
                        key={lec.id}
                        style={styles.lectureCard}
                        onPress={() => router.push(`/lecture/${lec.id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.playIconBox}>
                          <Play size={16} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lectureTitle}>{lec.title}</Text>
                          {lec.title_hi ? (
                            <Text style={styles.lectureTitleHi}>{lec.title_hi}</Text>
                          ) : null}
                          <Text style={styles.lectureMeta}>
                            ⏱️ {Math.round(lec.duration_seconds / 60)} Mins · High-Definition In-App Player
                          </Text>
                        </View>
                        <ChevronRight size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* TAB 3: STUDY MATERIALS / PDF NOTES */}
              {chapterContentTab === 'notes' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.subSectionTitle}>📄 Handwritten Notes & Formulas</Text>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.addActionButtonGreen}
                        onPress={() => setModalType('upload_notes')}
                      >
                        <Upload size={14} color="#FFFFFF" />
                        <Text style={styles.addActionButtonText}>Upload PDF</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {studyMaterials.length === 0 ? (
                    <View style={styles.emptyStateBox}>
                      <FileText size={32} color="#94A3B8" />
                      <Text style={styles.emptyStateTitle}>No Notes Uploaded</Text>
                      <Text style={styles.emptyStateSub}>
                        Director BADE SIR is compiling verified exam notes for this chapter.
                      </Text>
                    </View>
                  ) : (
                    studyMaterials.map((mat) => (
                      <TouchableOpacity
                        key={mat.id}
                        style={styles.pdfNoteCard}
                        onPress={() => router.push(`/pdf-viewer/${mat.id}`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.pdfIconCircle}>
                          <FileText size={18} color="#059669" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.pdfTitle}>{mat.title}</Text>
                          <Text style={styles.pdfMeta}>
                            📄 PDF · {(mat.file_size_bytes / 1024 / 1024).toFixed(1)} MB · Offline Available
                          </Text>
                        </View>
                        <View style={styles.openPill}>
                          <Text style={styles.openPillText}>Read</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADMIN INTERACTIVE MODALS */}
      {/* 1. Add Subject Modal */}
      <Modal visible={modalType === 'add_subject'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Add New Subject (नया विषय)</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Subject Name (e.g. Science / Mathematics)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hindi Name (e.g. विज्ञान / गणित)"
              value={formTitleHi}
              onChangeText={setFormTitleHi}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateSubject}>
              <Text style={styles.submitBtnText}>Save Subject (विषय जोड़ें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. Add Sub-Subject Modal */}
      <Modal visible={modalType === 'add_sub_subject'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Add Sub-Subject Discipline</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Discipline Name (e.g. Chemistry / Physics / Bio)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hindi Name (e.g. रसायन विज्ञान / भौतिकी)"
              value={formTitleHi}
              onChangeText={setFormTitleHi}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateSubSubject}>
              <Text style={styles.submitBtnText}>Add Sub-Subject (उप-विषय जोड़ें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Add Chapter Modal */}
      <Modal visible={modalType === 'add_chapter'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Add Chapter (नया पाठ)</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Chapter Title (e.g. Chemical Reactions)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hindi Title (e.g. रासायनिक अभिक्रियाएँ एवं समीकरण)"
              value={formTitleHi}
              onChangeText={setFormTitleHi}
            />
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="Key concepts or syllabus description..."
              multiline
              value={formDesc}
              onChangeText={setFormDesc}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateChapter}>
              <Text style={styles.submitBtnText}>Add Chapter (पाठ जोड़ें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 4. Add Video Lecture Modal */}
      <Modal visible={modalType === 'add_lecture'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Add Recorded Lecture</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Lecture Title (e.g. Lec 01: Balancing Equations)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="YouTube Video ID or Full Link (e.g. jfKfPfyJRdk)"
              value={formVideoId}
              onChangeText={setFormVideoId}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Duration in Minutes (e.g. 45)"
              keyboardType="numeric"
              value={formDuration}
              onChangeText={setFormDuration}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddVideoLecture}>
              <Text style={styles.submitBtnText}>Save Video Lecture (वीडियो जोड़ें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. Schedule / Go Live Modal */}
      <Modal visible={modalType === 'schedule_live'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>🔴 Start / Schedule Live Class</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Live Class Title (e.g. Live Q&A and Board Prep)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="YouTube Live Stream Link or ID"
              value={formVideoId}
              onChangeText={setFormVideoId}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Duration in Minutes (e.g. 60)"
              keyboardType="numeric"
              value={formDuration}
              onChangeText={setFormDuration}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#DC2626' }]}
              onPress={handleScheduleLiveClass}
            >
              <Text style={styles.submitBtnText}>Broadcast Live (लाइव शुरू करें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6. Upload PDF Notes Modal with Device Picker */}
      <Modal visible={modalType === 'upload_notes'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Upload PDF Notes from Device</Text>
              <TouchableOpacity onPress={() => setModalType('none')}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Document Picker Trigger */}
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handlePickAndUploadPdf}
            >
              <Upload size={22} color="#059669" />
              <Text style={styles.filePickerButtonText}>
                {formPdfName ? `📄 Selected: ${formPdfName}` : 'Select PDF from Phone Storage'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Notes Title (e.g. Handwritten Master Notes)"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Brief description for students..."
              multiline
              value={formDesc}
              onChangeText={setFormDesc}
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#059669' }]}
              onPress={handleSaveUploadedPdfNotes}
            >
              <Text style={styles.submitBtnText}>Save Notes (नोट्स सेव करें)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  navSubTitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  adminIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adminIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  scroll: {
    paddingBottom: 40,
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubHeading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addActionButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addActionButtonGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addActionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  subjectsGrid: {
    gap: 10,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subjectNameHi: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 1,
  },
  subjectMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subjectActionRight: {
    paddingLeft: 4,
  },
  trashSmallBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  subSubjectsList: {
    gap: 10,
  },
  subSubjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subSubjectBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subSubjectName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  subSubjectNameHi: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  chaptersList: {
    gap: 10,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chapterNumberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumberText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2563EB',
  },
  chapterTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  chapterTitleHiText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  chapterPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  liveTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  contentSegmentRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#0F172A',
  },
  tabContentContainer: {
    gap: 12,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyStateBox: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  emptyStateSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },
  liveClassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  liveDurationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  liveCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveCardDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    marginBottom: 12,
  },
  joinLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 10,
  },
  joinLiveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  lectureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lectureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lectureTitleHi: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  lectureMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  pdfNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pdfIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  pdfMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  openPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
  },
  filePickerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
