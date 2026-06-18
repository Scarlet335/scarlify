'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Plus, Edit, Trash2, Eye, Search, X, Save, 
  Video, FileText, Crown, Clock, BookOpen, Upload, Loader2
} from 'lucide-react';

interface Lesson {
  id?: string;
  level: string;
  section: string;
  subject: string;
  subject_code: string;
  topic: string;
  title: string;
  description: string;
  video_url: string;
  notes_url: string;
  pdf_notes: string;
  duration: number;
  order_num: number;
  is_premium: boolean;
}

// Complete subject data with codes by level and section
const SUBJECTS_BY_LEVEL_SECTION: Record<string, Record<string, Array<{name: string, code: string}>>> = {
  'O-Level': {
    'Science': [
      { name: 'Mathematics', code: '4021' },
      { name: 'Additional Mathematics', code: '4022' },
      { name: 'Physics', code: '5051' },
      { name: 'Chemistry', code: '5061' },
      { name: 'Biology', code: '5081' },
      { name: 'Human Biology', code: '5082' },
    ],
    'Arts': [
      { name: 'English Language', code: '1121' },
      { name: 'English Literature', code: '1131' },
      { name: 'French Language', code: '1221' },
      { name: 'French Literature', code: '1231' },
      { name: 'History', code: '2141' },
      { name: 'Geography', code: '2151' },
      { name: 'Religious Studies', code: '3131' },
    ],
    'Commercial': [
      { name: 'Economics', code: '2281' },
      { name: 'Accounting', code: '2283' },
      { name: 'Business Studies', code: '2285' },
      { name: 'Commerce', code: '2287' },
      { name: 'Office Practice', code: '2289' },
      { name: 'Typewriting', code: '2291' },
    ],
    'Technical': [
      { name: 'Technical Drawing', code: '4301' },
      { name: 'Building Construction', code: '4303' },
      { name: 'Woodwork', code: '4305' },
      { name: 'Metalwork', code: '4307' },
      { name: 'Electronics', code: '4311' },
      { name: 'Electricity', code: '4313' },
      { name: 'Mechanics', code: '4315' },
      { name: 'Computer Science', code: '4317' },
      { name: 'Food & Nutrition', code: '4321' },
      { name: 'Textiles', code: '4323' },
    ],
    'Grammar': [
      { name: 'English Language', code: '1121' },
      { name: 'French Language', code: '1221' },
      { name: 'German', code: '1241' },
      { name: 'Spanish', code: '1251' },
      { name: 'Latin', code: '1261' },
    ],
  },
  'A-Level': {
    'Science': [
      { name: 'Mathematics', code: '7012' },
      { name: 'Further Mathematics', code: '7020' },
      { name: 'Physics', code: '7014' },
      { name: 'Chemistry', code: '7016' },
      { name: 'Biology', code: '7018' },
    ],
    'Arts': [
      { name: 'English Language', code: '8011' },
      { name: 'English Literature', code: '8012' },
      { name: 'French Language', code: '8013' },
      { name: 'French Literature', code: '8014' },
      { name: 'History', code: '8015' },
      { name: 'Geography', code: '8016' },
      { name: 'Religious Studies', code: '8017' },
      { name: 'Philosophy', code: '8018' },
    ],
    'Commercial': [
      { name: 'Economics', code: '7102' },
      { name: 'Accounting', code: '7104' },
      { name: 'Business Studies', code: '7106' },
    ],
    'Technical': [
      { name: 'Technical Drawing', code: '7151' },
      { name: 'Building Construction', code: '7153' },
      { name: 'Woodwork', code: '7155' },
      { name: 'Metalwork', code: '7157' },
      { name: 'Electronics', code: '7159' },
      { name: 'Electricity', code: '7161' },
      { name: 'Mechanics', code: '7163' },
      { name: 'Computer Science', code: '7165' },
      { name: 'Food & Nutrition', code: '7167' },
    ],
    'Grammar': [
      { name: 'English Language', code: '8011' },
      { name: 'French Language', code: '8013' },
    ],
  },
};

const TOPICS = {
  Mathematics: ['Algebra', 'Trigonometry', 'Geometry', 'Calculus', 'Statistics', 'Probability', 'Number Theory'],
  Physics: ['Mechanics', 'Electricity', 'Magnetism', 'Thermodynamics', 'Waves', 'Optics', 'Nuclear Physics'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry', 'Analytical Chemistry'],
  Biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy', 'Plant Biology', 'Microbiology'],
  English: ['Grammar', 'Literature', 'Composition', 'Poetry', 'Prose', 'Drama'],
  ICT: ['Hardware', 'Software', 'Networking', 'Databases', 'Programming', 'Web Development'],
  History: ['Ancient History', 'Modern History', 'African History', 'World Wars', 'Colonialism'],
  Geography: ['Physical Geography', 'Human Geography', 'Map Reading', 'Climate', 'Population'],
  Economics: ['Microeconomics', 'Macroeconomics', 'Development Economics', 'International Trade'],
  Accounting: ['Financial Accounting', 'Cost Accounting', 'Management Accounting', 'Auditing']
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedTopicOptions, setSelectedTopicOptions] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Array<{name: string, code: string}>>([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formData, setFormData] = useState<Lesson>({
    level: '',
    section: '',
    subject: '',
    subject_code: '',
    topic: '',
    title: '',
    description: '',
    video_url: '',
    notes_url: '',
    pdf_notes: '',
    duration: 30,
    order_num: 1,
    is_premium: false
  });

  const supabase = createClient();

  useEffect(() => {
    fetchLessons();
  }, []);

  // Update available subjects when level/section changes
  useEffect(() => {
    if (formData.level && formData.section) {
      const subjects = SUBJECTS_BY_LEVEL_SECTION[formData.level]?.[formData.section] || [];
      setAvailableSubjects(subjects);
    } else {
      setAvailableSubjects([]);
    }
  }, [formData.level, formData.section]);

  // Update topics when subject changes
  useEffect(() => {
    if (formData.subject) {
      setSelectedTopicOptions(TOPICS[formData.subject as keyof typeof TOPICS] || []);
    } else {
      setSelectedTopicOptions([]);
    }
  }, [formData.subject]);

  useEffect(() => {
    fetchLessons();
  }, [selectedLevel, selectedSection]);

  const fetchLessons = async () => {
    let query = supabase
      .from('lessons')
      .select('*')
      .order('level', { ascending: true })
      .order('section', { ascending: true })
      .order('subject', { ascending: true })
      .order('order_num', { ascending: true });

    if (selectedLevel) {
      query = query.eq('level', selectedLevel);
    }
    if (selectedSection) {
      query = query.eq('section', selectedSection);
    }

    const { data } = await query;
    setLessons(data || []);
    setLoading(false);
  };

  const uploadFileToSupabase = async (file: File, folder: string): Promise<string | null> => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['mp4', 'webm', 'pdf', 'docx', 'txt'];
    if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
      alert(`File type .${fileExt} not supported. Allowed: mp4, webm, pdf, docx, txt`);
      return null;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return null;
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `lessons/${folder}/${timestamp}_${safeName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('content-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket')) {
          alert('Storage bucket "content-files" not found. Please create it in Supabase dashboard first.');
        } else {
          alert('Upload failed: ' + uploadError.message);
        }
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('content-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
      return null;
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingVideo(true);
    setUploadProgress('Uploading video...');
    
    const url = await uploadFileToSupabase(file, 'videos');
    if (url) {
      setFormData({ ...formData, video_url: url });
      alert('Video uploaded successfully!');
    }
    
    setUploadingVideo(false);
    setUploadProgress('');
  };

  const handleNotesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingNotes(true);
    setUploadProgress('Uploading notes...');
    
    const url = await uploadFileToSupabase(file, 'notes');
    if (url) {
      setFormData({ ...formData, pdf_notes: url });
      alert('Notes uploaded successfully!');
    }
    
    setUploadingNotes(false);
    setUploadProgress('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lesson? This action cannot be undone.')) {
      await supabase.from('lessons').delete().eq('id', id);
      fetchLessons();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLesson) {
      await supabase
        .from('lessons')
        .update(formData)
        .eq('id', editingLesson.id);
      alert('Lesson updated successfully!');
    } else {
      await supabase
        .from('lessons')
        .insert(formData);
      alert('Lesson created successfully!');
    }
    
    setShowModal(false);
    setEditingLesson(null);
    setFormData({
      level: '',
      section: '',
      subject: '',
      subject_code: '',
      topic: '',
      title: '',
      description: '',
      video_url: '',
      notes_url: '',
      pdf_notes: '',
      duration: 30,
      order_num: 1,
      is_premium: false
    });
    fetchLessons();
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Lessons Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage video lessons for students by Level → Section → Subject</p>
        </div>
        <button
          onClick={() => {
            setEditingLesson(null);
            setFormData({
              level: '',
              section: '',
              subject: '',
              subject_code: '',
              topic: '',
              title: '',
              description: '',
              video_url: '',
              notes_url: '',
              pdf_notes: '',
              duration: 30,
              order_num: lessons.length + 1,
              is_premium: false
            });
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Lesson
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title, subject, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Levels</option>
            <option value="O-Level">O-Level</option>
            <option value="A-Level">A-Level</option>
          </select>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sections</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Commercial">Commercial</option>
            <option value="Technical">Technical</option>
            <option value="Grammar">Grammar</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lessons.length}</p>
          <p className="text-sm text-gray-500">Total Lessons</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lessons.filter(l => l.level === 'O-Level').length}</p>
          <p className="text-sm text-gray-500">O-Level</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lessons.filter(l => l.level === 'A-Level').length}</p>
          <p className="text-sm text-gray-500">A-Level</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{lessons.filter(l => l.is_premium).length}</p>
          <p className="text-sm text-gray-500">Premium Lessons</p>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Level</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Section</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Subject</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Code</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Topic</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Title</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Duration</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Premium</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3 text-gray-600 dark:text-gray-400">{lesson.level || '-'}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{lesson.section || '-'}</td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{lesson.subject}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-sm">{lesson.subject_code || '-'}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{lesson.topic}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 max-w-md truncate">{lesson.title}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{lesson.duration} min</td>
                  <td className="p-3">
                    {lesson.is_premium ? (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full w-fit">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setFormData(lesson);
                          setShowModal(true);
                        }}
                        className="text-green-600 dark:text-green-400 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id!)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLessons.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No lessons found. Click "Add New Lesson" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Lesson Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Level and Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Level *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.level}
                    onChange={(e) => {
                      setFormData({ ...formData, level: e.target.value, section: '', subject: '', subject_code: '', topic: '' });
                    }}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="O-Level">O-Level</option>
                    <option value="A-Level">A-Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Section *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.section}
                    onChange={(e) => {
                      setFormData({ ...formData, section: e.target.value, subject: '', subject_code: '', topic: '' });
                    }}
                    disabled={!formData.level}
                    required
                  >
                    <option value="">Select Section</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Technical">Technical</option>
                    <option value="Grammar">Grammar</option>
                  </select>
                </div>
              </div>

              {/* Subject with Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject *</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.subject}
                    onChange={(e) => {
                      const selectedSubject = availableSubjects.find(s => s.name === e.target.value);
                      setFormData({ 
                        ...formData, 
                        subject: e.target.value,
                        subject_code: selectedSubject?.code || '',
                        topic: ''
                      });
                    }}
                    disabled={!formData.section}
                    required
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => (
                      <option key={s.code} value={s.name}>{s.name} (Code: {s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    value={formData.subject_code}
                    disabled
                  />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Topic *</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  disabled={!formData.subject}
                >
                  <option value="">Select Topic</option>
                  {selectedTopicOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Lesson Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Algebra"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what students will learn..."
                />
              </div>

              {/* VIDEO UPLOAD */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  <Video className="w-4 h-4 inline mr-1" /> Upload Video
                </label>
                <div className="flex gap-3 items-center">
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingVideo ? 'Uploading...' : 'Choose Video File'}
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      disabled={uploadingVideo}
                      onChange={handleVideoUpload}
                    />
                  </label>
                  {uploadingVideo && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
                {uploadProgress && <p className="text-sm text-blue-500 mt-1">{uploadProgress}</p>}
                <p className="text-xs text-gray-500 mt-1">MP4 or WebM, max 100MB</p>
                <input
                  type="url"
                  className="w-full mt-2 border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="Or paste video URL directly"
                />
              </div>

              {/* NOTES UPLOAD */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4 inline mr-1" /> Upload Notes (PDF)
                </label>
                <div className="flex gap-3 items-center">
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingNotes ? 'Uploading...' : 'Choose PDF File'}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      disabled={uploadingNotes}
                      onChange={handleNotesUpload}
                    />
                  </label>
                  {uploadingNotes && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">PDF file, max 20MB</p>
                <input
                  type="url"
                  className="w-full mt-2 border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.pdf_notes}
                  onChange={(e) => setFormData({ ...formData, pdf_notes: e.target.value })}
                  placeholder="Or paste notes URL directly"
                />
              </div>

              {/* Duration & Order Number Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 inline mr-1" /> Duration (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min={1}
                    max={180}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Number</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.order_num}
                    onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              {/* Premium Toggle */}
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <div>
                  <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Premium Content
                  </label>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Only verified premium subscribers can access this lesson
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingVideo || uploadingNotes}
                  className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}