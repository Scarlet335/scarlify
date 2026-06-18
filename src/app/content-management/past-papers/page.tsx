'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Eye, Search, Crown, Upload, X, Loader2, FileText } from 'lucide-react';

interface PastQuestion {
    id: string;
    level: string;
    section: string;
    subject: string;
    subject_code: string;
    year: number;
    session: string;
    paper_type: string;
    question_text: string;
    correct_answer: string;
    pdf_url: string;
    created_at: string;
    is_premium?: boolean;
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

const SESSIONS = ['June', 'November'];
const PAPER_TYPES = ['Paper 1', 'Paper 2', 'Paper 3'];
const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

export default function PastPapersManagement() {
    const [questions, setQuestions] = useState<PastQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PastQuestion | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Array<{name: string, code: string}>>([]);
    const [uploadingPDF, setUploadingPDF] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [formData, setFormData] = useState({
        level: '',
        section: '',
        subject: '',
        subject_code: '',
        year: new Date().getFullYear(),
        session: 'June',
        paper_type: '',
        question_text: '',
        correct_answer: '',
        pdf_url: '',
        is_premium: false
    });
    const supabase = createClient();

    useEffect(() => {
        fetchPastQuestions();
    }, []);

    useEffect(() => {
        if (formData.level && formData.section) {
            const subjects = SUBJECTS_BY_LEVEL_SECTION[formData.level]?.[formData.section] || [];
            setAvailableSubjects(subjects);
        } else {
            setAvailableSubjects([]);
        }
    }, [formData.level, formData.section]);

    useEffect(() => {
        fetchPastQuestions();
    }, [selectedLevel, selectedSection]);

    const fetchPastQuestions = async () => {
        let query = supabase
            .from('past_questions')
            .select('*')
            .order('year', { ascending: false });

        if (selectedLevel) {
            query = query.eq('level', selectedLevel);
        }
        if (selectedSection) {
            query = query.eq('section', selectedSection);
        }

        const { data } = await query;
        setQuestions(data || []);
        setLoading(false);
    };

    const uploadPDFToSupabase = async (file: File): Promise<string | null> => {
        if (!file) return null;
        
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return null;
        }
        
        if (file.size > 20 * 1024 * 1024) {
            alert('File size must be less than 20MB');
            return null;
        }

        setUploadingPDF(true);
        setUploadProgress(`Uploading ${file.name}...`);
        
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `past-questions/${timestamp}_${safeName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('past-questions')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                alert('Upload failed: ' + uploadError.message);
                setUploadingPDF(false);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from('past-questions')
                .getPublicUrl(filePath);

            setUploadProgress('Upload complete!');
            setTimeout(() => setUploadProgress(''), 2000);
            setUploadingPDF(false);
            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload PDF');
            setUploadingPDF(false);
            return null;
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this past question?')) {
            await supabase.from('past_questions').delete().eq('id', id);
            fetchPastQuestions();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.pdf_url) {
            alert('Please upload a PDF or provide a PDF URL');
            return;
        }
        
        if (editingItem) {
            await supabase
                .from('past_questions')
                .update(formData)
                .eq('id', editingItem.id);
            alert('Past question updated!');
        } else {
            await supabase
                .from('past_questions')
                .insert(formData);
            alert('Past question added!');
        }
        
        setShowModal(false);
        setEditingItem(null);
        setFormData({ 
            level: '',
            section: '',
            subject: '',
            subject_code: '',
            year: new Date().getFullYear(),
            session: 'June',
            paper_type: '',
            question_text: '',
            correct_answer: '',
            pdf_url: '',
            is_premium: false 
        });
        fetchPastQuestions();
    };

    const subjects = [...new Set(questions.map(q => q.subject))];

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading past questions...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Past Questions Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload past papers by Level → Section → Subject with codes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ 
                            level: '',
                            section: '',
                            subject: '',
                            subject_code: '',
                            year: new Date().getFullYear(),
                            session: 'June',
                            paper_type: '',
                            question_text: '',
                            correct_answer: '',
                            pdf_url: '',
                            is_premium: false 
                        });
                        setShowModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Past Question
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 border border-gray-200 dark:border-gray-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by subject or question..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Levels</option>
                    <option value="O-Level">O-Level</option>
                    <option value="A-Level">A-Level</option>
                </select>
                <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Sections</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Technical">Technical</option>
                    <option value="Grammar">Grammar</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Level</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Section</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Subject</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Code</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Year</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Session</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Paper</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Question</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Premium</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map((q) => (
                                <tr key={q.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{q.level || '-'}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{q.section || '-'}</td>
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{q.subject}</td>
                                    <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-sm">{q.subject_code || '-'}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{q.year}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{q.session || '-'}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{q.paper_type || '-'}</td>
                                    <td className="p-3 max-w-md truncate text-gray-600 dark:text-gray-400">{q.question_text}</td>
                                    <td className="p-3">
                                        {q.is_premium ? (
                                            <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                                <Crown className="w-3 h-3" /> Premium
                                            </span>
                                        ) : (
                                            <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full w-fit">
                                                Free
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(q);
                                                    setFormData({
                                                        level: q.level || '',
                                                        section: q.section || '',
                                                        subject: q.subject,
                                                        subject_code: q.subject_code || '',
                                                        year: q.year,
                                                        session: q.session || 'June',
                                                        paper_type: q.paper_type || '',
                                                        question_text: q.question_text,
                                                        correct_answer: q.correct_answer || '',
                                                        pdf_url: q.pdf_url || '',
                                                        is_premium: q.is_premium || false
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {q.pdf_url && (
                                                <a
                                                    href={q.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredQuestions.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No past questions found.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingItem ? 'Edit Past Question' : 'Add Past Question'}
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Level and Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Level *</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.level}
                                        onChange={(e) => {
                                            setFormData({ ...formData, level: e.target.value, section: '', subject: '', subject_code: '' });
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
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.section}
                                        onChange={(e) => {
                                            setFormData({ ...formData, section: e.target.value, subject: '', subject_code: '' });
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
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.subject}
                                        onChange={(e) => {
                                            const selectedSubject = availableSubjects.find(s => s.name === e.target.value);
                                            setFormData({ 
                                                ...formData, 
                                                subject: e.target.value,
                                                subject_code: selectedSubject?.code || ''
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

                            {/* Year, Session, Paper Type */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Year *</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        required
                                    >
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Session</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.session}
                                        onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                                    >
                                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Paper Type</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={formData.paper_type}
                                        onChange={(e) => setFormData({ ...formData, paper_type: e.target.value })}
                                    >
                                        <option value="">Select Paper Type</option>
                                        {PAPER_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Question Text *</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={4}
                                    value={formData.question_text}
                                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Correct Answer */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Correct Answer</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={3}
                                    value={formData.correct_answer}
                                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                                />
                            </div>

                            {/* PDF Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    📄 Upload PDF (Question Paper)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${uploadingPDF ? 'bg-gray-100 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}>
                                        <Upload className="w-4 h-4" />
                                        <span>{uploadingPDF ? 'Uploading...' : 'Choose PDF File'}</span>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            disabled={uploadingPDF}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = await uploadPDFToSupabase(file);
                                                    if (url) {
                                                        setFormData({ ...formData, pdf_url: url });
                                                        alert('PDF uploaded successfully!');
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    {uploadingPDF && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                </div>
                                {uploadProgress && <p className="text-sm text-blue-500 mt-1">{uploadProgress}</p>}
                                
                                <div className="relative my-3">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or enter URL manually</span>
                                    </div>
                                </div>

                                <input
                                    type="url"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.pdf_url}
                                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                                    placeholder="https://..."
                                    required
                                />
                                
                                {formData.pdf_url && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> PDF attached successfully!
                                    </p>
                                )}
                            </div>

                            {/* Premium Content Toggle */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div>
                                    <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        Premium Content
                                    </label>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        Only verified premium subscribers can access this past question
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.is_premium}
                                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

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
                                    disabled={uploadingPDF}
                                    className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {editingItem ? 'Update' : 'Add'} Past Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}