'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/AdminHeader';
import { useLanguage } from '@/components/LanguageContext';
import { AdminApi } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { StudyMaterial, SubjectItem, ClassItem } from '@icc/shared-types';
import { formatBytes } from '@icc/shared-utils';
import {
  UploadCloud,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export default function StudyMaterialsPage() {
  const { lang, t } = useLanguage();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudyMaterial | null>(null);
  const [previewItem, setPreviewItem] = useState<StudyMaterial | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(2150000);

  const [formData, setFormData] = useState({
    title: '',
    title_hi: '',
    board_id: 'b0000000-0000-0000-0000-000000000001',
    class_id: 'c0000000-0000-0000-0000-000000000010',
    subject_id: 'sub00000-0000-0000-0000-000000000002',
    material_type: 'chapter_notes' as const,
    file_name: 'notes.pdf',
    is_free: false,
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    title_hi: '',
    material_type: 'chapter_notes' as const,
    is_free: false,
  });

  const loadMaterials = () => {
    AdminApi.getStudyMaterials().then((data) => setMaterials(data));
  };

  useEffect(() => {
    loadMaterials();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('admin-study-materials-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
          loadMaterials();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSizeBytes(file.size);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      setFormData((prev) => ({
        ...prev,
        file_name: file.name,
        title: prev.title || cleanName,
        title_hi: prev.title_hi || cleanName,
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await AdminApi.uploadStudyMaterial({
      title: formData.title || formData.file_name,
      title_hi: formData.title_hi || formData.title || formData.file_name,
      board_id: formData.board_id,
      class_id: formData.class_id,
      subject_id: formData.subject_id,
      material_type: formData.material_type,
      file_path: `bseb/class10/science/${formData.file_name}`,
      file_size_bytes: fileSizeBytes,
      is_free: formData.is_free,
    });
    setMaterials((prev) => [created, ...prev]);
    setIsUploadOpen(false);
    setSelectedFile(null);
    setFileSizeBytes(2150000);
    setFormData({
      title: '',
      title_hi: '',
      board_id: 'b0000000-0000-0000-0000-000000000001',
      class_id: 'c0000000-0000-0000-0000-000000000010',
      subject_id: 'sub00000-0000-0000-0000-000000000002',
      material_type: 'chapter_notes',
      file_name: 'notes.pdf',
      is_free: false,
    });
  };

  const openEditModal = (mat: StudyMaterial) => {
    setEditingItem(mat);
    setEditFormData({
      title: mat.title,
      title_hi: mat.title_hi || mat.title,
      material_type: (mat.material_type as any) || 'chapter_notes',
      is_free: mat.is_free,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = await AdminApi.updateStudyMaterial(editingItem.id, {
      title: editFormData.title,
      title_hi: editFormData.title_hi,
      material_type: editFormData.material_type,
      is_free: editFormData.is_free,
    });

    if (updated) {
      setMaterials((prev) => prev.map((m) => (m.id === editingItem.id ? updated : m)));
    }
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (mat: StudyMaterial) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this study material:\n"${mat.title}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    await AdminApi.deleteStudyMaterial(mat.id);
    setMaterials((prev) => prev.filter((m) => m.id !== mat.id));
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.title_hi && m.title_hi.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !filterType || m.material_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        titleHi="स्वचालित पीडीएफ नोट्स एवं अध्ययन सामग्री"
        titleEn="Automatic PDF & Study Materials Hub"
        subtitleHi="शैक्षणिक मैपिंग द्वारा नामांकित छात्रों को स्वतः पीडीएफ आवंटन"
        subtitleEn="Automatic student document mapping via Class and Subject hierarchy"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Automatic PDF Assignment Feature Explanation Banner */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-blue-900">
              {t(
                'स्वचालित पीडीएफ आवंटन प्रणाली (Automatic PDF Assignment System)',
                'Zero-Manual Student Assignment Guarantee'
              )}
            </h4>
            <p className="text-blue-800 leading-relaxed">
              {t(
                'जब आप किसी पीडीएफ को कक्षा, विषय और अध्याय से जोड़ते हैं, तो उस कक्षा के सभी नामांकित विद्यार्थियों को यह पीडीएफ मोबाइल ऐप एवं पोर्टल में स्वतः मिल जाता है। किसी विद्यार्थी को अलग से असाइन करने की आवश्यकता नहीं है।',
                'When you upload a PDF mapped to Class, Subject & Chapter, enrolled students automatically receive instant access in their student app. Zero manual assignment required.'
              )}
            </p>
          </div>
        </div>

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('पीडीएफ शीर्षक से खोजें...', 'Search PDF title...')}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">{t('सभी प्रकार (All Types)', 'All Types')}</option>
              <option value="chapter_notes">{t('अध्याय नोट्स (Chapter Notes)', 'Chapter Notes')}</option>
              <option value="formula_sheet">{t('सूत्र पुस्तिका (Formula Sheet)', 'Formula Sheet')}</option>
              <option value="pyq">{t('पिछले वर्ष के प्रश्न (PYQ)', 'PYQ')}</option>
              <option value="worksheet">{t('कार्यपत्रक (Worksheet)', 'Worksheet')}</option>
            </select>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition w-full sm:w-auto justify-center"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('नया पीडीएफ अपलोड करें', 'Upload New PDF')}</span>
          </button>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('दस्तावेज़ एवं शीर्षक', 'Document & Title')}</th>
                <th className="py-3 px-4">{t('शैक्षणिक मैपिंग', 'Academic Mapping')}</th>
                <th className="py-3 px-4">{t('प्रकार', 'Type')}</th>
                <th className="py-3 px-4">{t('साइज़', 'Size')}</th>
                <th className="py-3 px-4">{t('एक्सेस स्तर', 'Access Level')}</th>
                <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">
                          {lang === 'hi' ? mat.title_hi || mat.title : mat.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{mat.file_path}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-700 font-medium">{t('कक्षा 10 · विज्ञान', 'Class 10 · Science')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {mat.material_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{formatBytes(mat.file_size_bytes)}</td>
                  <td className="py-3 px-4">
                    {mat.is_free ? (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <Unlock className="w-3 h-3 mr-1" /> {t('सार्वजनिक (Free)', 'Public Free')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                        <Lock className="w-3 h-3 mr-1" /> {t('सशुल्क (Enrolled)', 'Enrolled Only')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setPreviewItem(mat)}
                        title="Preview Details"
                        className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(mat)}
                        title="Edit Details"
                        className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mat)}
                        title="Delete Material"
                        className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload Modal with Academic Mapping */}
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('पीडीएफ अध्ययन सामग्री अपलोड करें', 'Upload Study Material PDF')}
                </h3>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('शीर्षक (English)', 'Title (English)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chemical Reactions Topper Handwritten Notes"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('शीर्षक (हिंदी)', 'Title (Hindi)')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_hi}
                    onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })}
                    placeholder="उदा. रासायनिक अभिक्रियाएँ - संपूर्ण हस्तलिखित नोट्स"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('कक्षा (Class)', 'Class')}
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="c0000000-0000-0000-0000-000000000010">कक्षा 10 (Class 10)</option>
                    <option value="c0000000-0000-0000-0000-000000000012">कक्षा 12 (Class 12)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('सामग्री का प्रकार (Type)', 'Material Type')}
                    </label>
                    <select
                      value={formData.material_type}
                      onChange={(e) => setFormData({ ...formData, material_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="chapter_notes">अध्याय नोट्स (Chapter Notes)</option>
                      <option value="formula_sheet">सूत्र पुस्तिका (Formula Sheet)</option>
                      <option value="pyq">पिछले वर्षों के प्रश्न (PYQ)</option>
                      <option value="worksheet">अभ्यास कार्यपत्रक (Worksheet)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('फ़ाइल नाम (PDF File)', 'File Name')}
                    </label>
                    <input
                      type="text"
                      value={formData.file_name}
                      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                      placeholder="ch01_notes.pdf"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Real PDF File Upload Input & Drag Area */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('पीडीएफ दस्तावेज़ अपलोड करें (Upload PDF Document)', 'Upload PDF Document')}
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-3 text-emerald-600">
                        <FileText className="w-8 h-8 flex-shrink-0 text-red-500" />
                        <div className="text-left">
                          <p className="font-bold text-slate-900 text-xs truncate max-w-xs">{selectedFile.name}</p>
                          <p className="text-[11px] text-slate-500">{formatBytes(fileSizeBytes)} • Ready for Auto Map</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">
                          {t('पीडीएफ फ़ाइल चुनें अथवा यहाँ छोड़ें', 'Click or drag PDF document here')}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {t('अध्याय नोट्स, सूत्र पुस्तिका या प्रश्न पत्र (PDF format)', 'PDF format up to 25MB')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="mat_is_free"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="mat_is_free" className="font-semibold text-slate-700">
                    {t('सभी के लिए निःशुल्क उपलब्ध कराएं', 'Make accessible for free')}
                  </label>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold transition"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    {t('अपलोड एवं स्वतः मैप करें', 'Upload & Auto Map')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Material Modal */}
        {isEditOpen && editingItem && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {t('अध्ययन सामग्री संशोधित करें', 'Edit Study Material')}
                </h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('शीर्षक (English)', 'Title (English)')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('शीर्षक (हिंदी)', 'Title (Hindi)')}</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title_hi}
                    onChange={(e) => setEditFormData({ ...editFormData, title_hi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('प्रकार', 'Type')}</label>
                  <select
                    value={editFormData.material_type}
                    onChange={(e) => setEditFormData({ ...editFormData, material_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="chapter_notes">अध्याय नोट्स (Chapter Notes)</option>
                    <option value="formula_sheet">सूत्र पुस्तिका (Formula Sheet)</option>
                    <option value="pyq">पिछले वर्षों के प्रश्न (PYQ)</option>
                    <option value="worksheet">अभ्यास कार्यपत्रक (Worksheet)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit_mat_free"
                    checked={editFormData.is_free}
                    onChange={(e) => setEditFormData({ ...editFormData, is_free: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="edit_mat_free" className="font-semibold text-slate-700">
                    {t('सभी के लिए निःशुल्क उपलब्ध कराएं', 'Make accessible for free')}
                  </label>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold"
                  >
                    {t('रद्द करें', 'Cancel')}
                  </button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
                    {t('परिवर्तन सहेजें', 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Secure PDF Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === 'hi' ? previewItem.title_hi || previewItem.title : previewItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('सुरक्षित प्राइवेट बकेट:', 'Secure Private Bucket:')}</span>
                  <span className="font-mono text-slate-800 font-semibold">study-materials</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('फ़ाइल पथ:', 'File Path:')}</span>
                  <span className="font-mono text-slate-800">{previewItem.file_path}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('फ़ाइल साइज़:', 'File Size:')}</span>
                  <span className="font-mono text-slate-800">{formatBytes(previewItem.file_size_bytes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{t('हस्ताक्षरित यूआरएल वैधता (Signed URL):', 'Signed URL Token Expiry:')}</span>
                  <span className="text-emerald-600 font-bold">15 मिनट (15 mins short-lived)</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                {t(
                  'सुरक्षा नीति: यह पीडीएफ सार्वजनिक रूप से उपलब्ध नहीं है। ऐप में छात्र को 15 मिनट की समय-सीमा वाला हस्ताक्षरित यूआरएल (Signed URL) जनरेट करके दिया जाता है।',
                  'Security Policy: Unauthenticated access is blocked. Authorized students receive a time-limited 15-minute signed URL token.'
                )}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  {t('बंद करें', 'Close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
