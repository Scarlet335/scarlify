'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Eye, Save, X, Crown, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface Question {
    id?: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    order_num: number;
    image_url?: string;
}

interface Quiz {
    id?: string;
    level: string;
    section: string;
    subject: string;
    subject_code: string;
    title: string;
    description: string;
    time_limit: number;
    questions: Question[];
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

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState<Array<{name: string, code: string}>>([]);
    const [formData, setFormData] = useState<Quiz>({
        level: '',
        section: '',
        subject: '',
        subject_code: '',
        title: '',
        description: '',
        time_limit: 15,
        questions: [],
        is_premium: false
    });
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        order_num: 0,
        image_url: ''
    });
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchQuizzes();
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
        fetchQuizzes();
    }, [selectedLevel, selectedSection]);

    const fetchQuizzes = async () => {
        let query = supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });

        if (selectedLevel) {
            query = query.eq('level', selectedLevel);
        }
        if (selectedSection) {
            query = query.eq('section', selectedSection);
        }
        
        const { data } = await query;
        
        if (data) {
            const quizzesWithQuestions = await Promise.all(
                data.map(async (quiz) => {
                    const { data: questions } = await supabase
                        .from('quiz_questions')
                        .select('*')
                        .eq('quiz_id', quiz.id)
                        .order('order_num');
                    return { ...quiz, questions: questions || [] };
                })
            );
            setQuizzes(quizzesWithQuestions);
        }
        setLoading(false);
    };

    const uploadImageToSupabase = async (file: File): Promise<string | null> => {
        if (!file) return null;
        
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPEG, PNG, GIF)');
            return null;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return null;
        }

        setUploadingImage(true);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `quiz-images/${timestamp}_${safeName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('content-files')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                alert('Upload failed: ' + uploadError.message);
                setUploadingImage(false);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from('content-files')
                .getPublicUrl(filePath);

            setUploadingImage(false);
            return urlData.publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
            setUploadingImage(false);
            return null;
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const url = await uploadImageToSupabase(file);
        if (url) {
            setCurrentQuestion({ ...currentQuestion, image_url: url });
            alert('Image uploaded successfully!');
        }
    };

    const saveQuiz = async () => {
        if (!formData.subject || !formData.title) {
            alert('Please fill in subject and title');
            return;
        }

        if (editingQuiz?.id) {
            await supabase
                .from('quizzes')
                .update({
                    level: formData.level,
                    section: formData.section,
                    subject: formData.subject,
                    subject_code: formData.subject_code,
                    title: formData.title,
                    description: formData.description,
                    time_limit: formData.time_limit,
                    is_premium: formData.is_premium
                })
                .eq('id', editingQuiz.id);
            
            await supabase.from('quiz_questions').delete().eq('quiz_id', editingQuiz.id);
            
            for (const q of formData.questions) {
                await supabase.from('quiz_questions').insert({
                    quiz_id: editingQuiz.id,
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    order_num: q.order_num,
                    image_url: q.image_url || null
                });
            }
            alert('Quiz updated successfully!');
        } else {
            const { data: newQuiz } = await supabase
                .from('quizzes')
                .insert({
                    level: formData.level,
                    section: formData.section,
                    subject: formData.subject,
                    subject_code: formData.subject_code,
                    title: formData.title,
                    description: formData.description,
                    time_limit: formData.time_limit,
                    is_premium: formData.is_premium
                })
                .select()
                .single();
            
            if (newQuiz) {
                for (const q of formData.questions) {
                    await supabase.from('quiz_questions').insert({
                        quiz_id: newQuiz.id,
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        order_num: q.order_num,
                        image_url: q.image_url || null
                    });
                }
                alert('Quiz created successfully!');
            }
        }
        
        setShowModal(false);
        setEditingQuiz(null);
        setFormData({ level: '', section: '', subject: '', subject_code: '', title: '', description: '', time_limit: 15, questions: [], is_premium: false });
        fetchQuizzes();
    };

    const deleteQuiz = async (quizId: string) => {
        if (confirm('Delete this quiz? All questions will also be deleted.')) {
            await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);
            await supabase.from('quizzes').delete().eq('id', quizId);
            fetchQuizzes();
        }
    };

    const addQuestion = () => {
        if (!currentQuestion.question_text) {
            alert('Please enter the question text');
            return;
        }
        
        const newQuestion = { ...currentQuestion, order_num: formData.questions.length + 1 };
        
        if (editingQuestionIndex !== null) {
            const updatedQuestions = [...formData.questions];
            updatedQuestions[editingQuestionIndex] = newQuestion;
            setFormData({ ...formData, questions: updatedQuestions });
        } else {
            setFormData({ ...formData, questions: [...formData.questions, newQuestion] });
        }
        
        setCurrentQuestion({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A',
            order_num: 0,
            image_url: ''
        });
        setShowQuestionModal(false);
        setEditingQuestionIndex(null);
    };

    if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading quizzes...</div>;

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Quiz Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create quizzes by Level → Section → Subject with codes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingQuiz(null);
                        setFormData({ level: '', section: '', subject: '', subject_code: '', title: '', description: '', time_limit: 15, questions: [], is_premium: false });
                        setShowModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Add New Quiz
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 border border-gray-200 dark:border-gray-700">
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

            <div className="space-y-4">
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-5 flex justify-between items-start">
                            <div className="flex-1 cursor-pointer" onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id!)}>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        {quiz.level} • {quiz.section}
                                    </span>
                                    <span className="text-xs font-mono text-gray-500">{quiz.subject_code}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">⏱️ {quiz.time_limit} min</span>
                                    {quiz.is_premium && (
                                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Premium
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{quiz.title} ({quiz.subject})</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{quiz.questions?.length || 0} questions</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setEditingQuiz(quiz);
                                    setFormData(quiz);
                                    setShowModal(true);
                                }} className="text-green-600 dark:text-green-400 hover:text-green-800">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteQuiz(quiz.id!)} className="text-red-600 dark:text-red-400 hover:text-red-800">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        {expandedQuiz === quiz.id && (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Questions</h4>
                                <div className="space-y-3">
                                    {quiz.questions?.map((q, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                            <div className="flex gap-3">
                                                {q.image_url && (
                                                    <img src={q.image_url} alt="Question" className="w-16 h-16 object-cover rounded-lg" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                        <p className={q.correct_answer === 'A' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>A. {q.option_a}</p>
                                                        <p className={q.correct_answer === 'B' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>B. {q.option_b}</p>
                                                        <p className={q.correct_answer === 'C' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>C. {q.option_c}</p>
                                                        <p className={q.correct_answer === 'D' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>D. {q.option_d}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Quiz Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingQuiz ? 'Edit Quiz' : 'Add New Quiz'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Level and Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Level *</label>
                                    <select 
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                        value={formData.level} 
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value, section: '', subject: '', subject_code: '' })}
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
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value, subject: '', subject_code: '' })}
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

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quiz Title *</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={formData.title} 
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                                <textarea 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    rows={2} 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Time Limit (minutes)</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={formData.time_limit} 
                                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })} 
                                />
                            </div>

                            {/* Premium Toggle */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div>
                                    <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        Premium Content
                                    </label>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        Only verified premium subscribers can access this quiz
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.is_premium}
                                        onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Questions ({formData.questions.length})</h3>
                                    <button onClick={() => { 
                                        setCurrentQuestion({ 
                                            question_text: '', 
                                            option_a: '', 
                                            option_b: '', 
                                            option_c: '', 
                                            option_d: '', 
                                            correct_answer: 'A', 
                                            order_num: 0,
                                            image_url: ''
                                        }); 
                                        setEditingQuestionIndex(null); 
                                        setShowQuestionModal(true); 
                                    }} className="text-primary text-sm flex items-center gap-1">
                                        <Plus className="w-4 h-4" /> Add Question
                                    </button>
                                </div>
                                {formData.questions.map((q, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            {q.image_url && <ImageIcon className="w-4 h-4 text-gray-500" />}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Correct: {q.correct_answer}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setCurrentQuestion(q); setEditingQuestionIndex(idx); setShowQuestionModal(true); }} className="text-green-600 dark:text-green-400">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { const updated = formData.questions.filter((_, i) => i !== idx); setFormData({ ...formData, questions: updated }); }} className="text-red-600 dark:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button onClick={saveQuiz} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90">
                                    {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Question Modal */}
            {showQuestionModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h2>
                            <button onClick={() => setShowQuestionModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    <ImageIcon className="w-4 h-4 inline mr-1" /> Question Image (Optional)
                                </label>
                                <div className="flex gap-3 items-center">
                                    <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingImage}
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                </div>
                                {currentQuestion.image_url && (
                                    <div className="mt-2">
                                        <img src={currentQuestion.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentQuestion({ ...currentQuestion, image_url: '' })}
                                            className="text-xs text-red-500 mt-1"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="url"
                                    className="w-full mt-2 border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={currentQuestion.image_url}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, image_url: e.target.value })}
                                    placeholder="Or paste image URL directly"
                                />
                            </div>

                            <textarea 
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                rows={3} 
                                placeholder="Question Text" 
                                value={currentQuestion.question_text} 
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })} 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Option A" 
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={currentQuestion.option_a} 
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_a: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Option B" 
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={currentQuestion.option_b} 
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_b: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Option C" 
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={currentQuestion.option_c} 
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_c: e.target.value })} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Option D" 
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={currentQuestion.option_d} 
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_d: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Correct Answer</label>
                                <select 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                                    value={currentQuestion.correct_answer} 
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowQuestionModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300">
                                    Cancel
                                </button>
                                <button onClick={addQuestion} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90">
                                    {editingQuestionIndex !== null ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}