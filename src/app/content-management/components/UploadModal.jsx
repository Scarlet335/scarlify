import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

// Icons as simple SVG components
const Icons = {
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Loader: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  ),
};

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics',
  'English Language', 'French Language', 'History', 'Geography', 'Literature in English',
  'Accounting', 'Economics', 'Commerce', 'Business Studies',
  'Technical Drawing', 'Computer Science', 'Electronics', 'Mechanical Engineering',
];

const SESSIONS = ['June', 'November', 'N/A'];
const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

const supabase = createClient();

export default function UploadModal({ onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    contentType: '',
    subject: '',
    stream: '',
    level: '',
    year: '2026',
    session: 'N/A',
    description: '',
    status: 'Draft',
  });

  const [errors, setErrors] = useState({});

  const showToastMessage = (message, type = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!formData.contentType) newErrors.contentType = 'Select a content type';
    if (!formData.subject) newErrors.subject = 'Select a subject';
    if (!formData.stream) newErrors.stream = 'Select a stream';
    if (!formData.level) newErrors.level = 'Select a level';
    if (formData.contentType === 'Past Paper' && !selectedFile) {
      newErrors.file = 'Please attach a PDF for past papers';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      if (file.size > 20 * 1024 * 1024) {
        showToastMessage('File size must be less than 20MB', 'error');
        return;
      }
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: undefined }));
    } else {
      showToastMessage('Only PDF and image files accepted', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToastMessage('File size must be less than 20MB', 'error');
        return;
      }
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      if (selectedFile) {
        const timestamp = Date.now();
        const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${formData.stream}/${formData.subject}/${timestamp}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('content-files')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('content-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      const { error: insertError } = await supabase
        .from('content_uploads')
        .insert([
          {
            title: formData.title,
            content_type: formData.contentType,
            subject: formData.subject,
            stream: formData.stream,
            level: formData.level,
            year: formData.year,
            session: formData.session,
            description: formData.description,
            status: formData.status,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
          }
        ]);

      if (insertError) throw insertError;

      setUploadSuccess(true);
      showToastMessage(`"${formData.title}" uploaded successfully!`);
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      showToastMessage(error.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-5 right-5 z-[1000] px-5 py-3 rounded-lg font-semibold text-sm shadow-lg border
          ${showToast.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' 
            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
          }`}>
          {showToast.message}
        </div>
      )}

      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-[650px] max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-2xl px-5 py-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900 dark:text-white m-0">
                  Upload Content
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Add to Supabase Storage & Database
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <Icons.X />
              </button>
            </div>
          </div>

          {/* Success State */}
          {uploadSuccess ? (
            <div className="text-center py-12 px-5">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Icons.CheckCircle />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                Content Uploaded to Supabase!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                File stored in Supabase Storage · Metadata saved to database
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5">
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  Content Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. GCE Chemistry Paper 2 June 2024"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all
                    ${errors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {errors.title && (
                  <div className="text-red-600 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                    <Icons.AlertCircle /> {errors.title}
                  </div>
                )}
              </div>

              {/* Content Type + Status Row */}
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Content Type
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={e => handleChange('contentType', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary
                      ${errors.contentType ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select type...</option>
                    <option value="Lesson">Lesson</option>
                    <option value="Past Paper">Past Paper</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                  {errors.contentType && <div className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.contentType}</div>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Draft">Save as Draft</option>
                    <option value="Published">Publish Immediately</option>
                  </select>
                </div>
              </div>

              {/* Subject + Stream Row */}
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary
                      ${errors.subject ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <div className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.subject}</div>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Stream
                  </label>
                  <select
                    value={formData.stream}
                    onChange={e => handleChange('stream', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary
                      ${errors.stream ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select stream...</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Technical">Technical</option>
                  </select>
                  {errors.stream && <div className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.stream}</div>}
                </div>
              </div>

              {/* Level + Year + Session Row */}
              <div className="grid grid-cols-3 gap-3.5 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={e => handleChange('level', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary
                      ${errors.level ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    <option value="">Select level...</option>
                    <option value="O Level">O Level</option>
                    <option value="A Level">A Level</option>
                    <option value="Both">Both</option>
                  </select>
                  {errors.level && <div className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.level}</div>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={e => handleChange('year', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Session
                  </label>
                  <select
                    value={formData.session}
                    onChange={e => handleChange('session', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the content, topics covered..."
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  Attach File {formData.contentType === 'Past Paper' && <span className="text-red-500">*</span>}
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${dragOver ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                      errors.file ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'}
                  `}
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Icons.FileText />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white m-0">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 m-0">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                        className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        <Icons.X />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center mx-auto mb-3 border border-gray-200 dark:border-gray-500">
                        <Icons.Upload />
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white m-0">
                        Drag & drop your file here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        PDF or images · Max 20MB · Stored in Supabase Storage
                      </p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
                </div>
                {errors.file && <div className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.file}</div>}
              </div>

              {/* Payment Note */}
              <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-4 items-start">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
                <p className="text-xs text-amber-800 dark:text-amber-300 m-0 leading-relaxed">
                  <strong>Payment verification:</strong> Premium content requires verified MTN Mobile Money or Orange Money subscription.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-lg border-none bg-[#1B6B3A] dark:bg-[#1B6B3A] font-semibold text-sm text-white hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <><Icons.Loader /> Uploading to Supabase...</>
                  ) : (
                    <><Icons.Upload /> Upload Content</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}