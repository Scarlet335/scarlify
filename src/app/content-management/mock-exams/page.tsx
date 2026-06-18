'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Eye, Save, X, Crown, Clock, FileQuestion, Award } from 'lucide-react';

interface MockExam {
    id?: string;
    level: string;
    section: string;
    subject: string;
    subject_code: string;
    title: string;
    description: string;
    duration: number;
    total_questions: number;
    passing_score: number;
    instructions: string;
    is_premium: boolean;
    is_active: boolean;
}

interface Question {
    id?: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    order_num: number;
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

export default function AdminMockExamsPage() {
    const [exams, setExams] = useState<MockExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [editingExam, setEditingExam] = useState<MockExam | null>(null);
    const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Array<{name: string, code: string}>>([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [formData, setFormData] = useState<MockExam>({
        level: '',
        section: '',
        subject: '',
        subject_code: '',
        title: '',
        description: '',
        duration: 60,
        total_questions: 40,
        passing_score: 50,
        instructions: '',
        is_premium: false,
        is_active: true
    });
    
    // Question form state
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        order_num: 0
    });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
    
    const supabase = createClient();

    useEffect(() => {
        fetchExams();
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
        fetchExams();
    }, [selectedLevel, selectedSection]);

    const fetchExams = async () => {
        let query = supabase
            .from('mock_exams')
            .select('*')
            .order('created_at', { ascending: false });

        if (selectedLevel) {
            query = query.eq('level', selectedLevel);
        }
        if (selectedSection) {
            query = query.eq('section', selectedSection);
        }
        
        const { data } = await query;
        setExams(data || []);
        setLoading(false);
    };

    const fetchQuestions = async (examId: string) => {
        const { data } = await supabase
            .from('mock_exam_questions')
            .select('*')
            .eq('exam_id', examId)
            .order('order_num', { ascending: true });
        setQuestions(data || []);
    };

    const saveExam = async () => {
        if (!formData.subject || !formData.title) {
            alert('Please fill in subject and title');
            return;
        }

        if (editingExam?.id) {
            await supabase
                .from('mock_exams')
                .update({
                    level: formData.level,
                    section: formData.section,
                    subject: formData.subject,
                    subject_code: formData.subject_code,
                    title: formData.title,
                    description: formData.description,
                    duration: formData.duration,
                    total_questions: formData.total_questions,
                    passing_score: formData.passing_score,
                    instructions: formData.instructions,
                    is_premium: formData.is_premium,
                    is_active: formData.is_active
                })
                .eq('id', editingExam.id);
            alert('Exam updated successfully!');
        } else {
            const { data: newExam } = await supabase
                .from('mock_exams')
                .insert({
                    level: formData.level,
                    section: formData.section,
                    subject: formData.subject,
                    subject_code: formData.subject_code,
                    title: formData.title,
                    description: formData.description,
                    duration: formData.duration,
                    total_questions: formData.total_questions,
                    passing_score: formData.passing_score,
                    instructions: formData.instructions,
                    is_premium: formData.is_premium,
                    is_active: formData.is_active
                })
                .select()
                .single();
            
            if (newExam) {
                alert('Exam created successfully!');
            }
        }
        
        setShowModal(false);
        setEditingExam(null);
        setFormData({
            level: '',
            section: '',
            subject: '',
            subject_code: '',
            title: '',
            description: '',
            duration: 60,
            total_questions: 40,
            passing_score: 50,
            instructions: '',
            is_premium: false,
            is_active: true
        });
        fetchExams();
    };

    const deleteExam = async (examId: string) => {
        if (confirm('Delete this exam? All questions will also be deleted.')) {
            await supabase.from('mock_exam_questions').delete().eq('exam_id', examId);
            await supabase.from('mock_exams').delete().eq('id', examId);
            fetchExams();
        }
    };

    const saveQuestions = async () => {
        if (!selectedExam?.id) return;
        
        await supabase.from('mock_exam_questions').delete().eq('exam_id', selectedExam.id);
        
        for (const q of questions) {
            await supabase.from('mock_exam_questions').insert({
                exam_id: selectedExam.id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                correct_answer: q.correct_answer,
                order_num: q.order_num
            });
        }
        
        alert('Questions saved successfully!');
        setShowQuestionsModal(false);
        setQuestions([]);
        setSelectedExam(null);
        fetchExams();
    };

    const addQuestion = () => {
        if (!currentQuestion.question_text) {
            alert('Please enter the question text');
            return;
        }
        
        const newQuestion = { ...currentQuestion, order_num: questions.length + 1 };
        
        if (editingQuestionIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingQuestionIndex] = newQuestion;
            setQuestions(updatedQuestions);
        } else {
            setQuestions([...questions, newQuestion]);
        }
        
        setCurrentQuestion({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_answer: 'A',
            order_num: 0
        });
        setEditingQuestionIndex(null);
    };

    const editQuestion = (index: number) => {
        setCurrentQuestion(questions[index]);
        setEditingQuestionIndex(index);
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading mock exams...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 Mock Exams Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage full exam simulations by Level → Section → Subject</p>
                </div>
                <button
                    onClick={() => {
                        setEditingExam(null);
                        setFormData({
                            level: '',
                            section: '',
                            subject: '',
                            subject_code: '',
                            title: '',
                            description: '',
                            duration: 60,
                            total_questions: 40,
                            passing_score: 50,
                            instructions: '',
                            is_premium: false,
                            is_active: true
                        });
                        setShowModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Add New Mock Exam
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <FileQuestion className="w-5 h-5 text-primary mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.length}</p>
                    <p className="text-sm text-gray-500">Total Exams</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <Crown className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.filter(e => e.is_premium).length}</p>
                    <p className="text-sm text-gray-500">Premium Exams</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <Award className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.filter(e => e.is_active).length}</p>
                    <p className="text-sm text-gray-500">Active Exams</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <Clock className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.reduce((sum, e) => sum + e.duration, 0)}</p>
                    <p className="text-sm text-gray-500">Total Minutes</p>
                </div>
            </div>

            {/* Exams List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Level</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Section</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Subject</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Code</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Title</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Duration</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Questions</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Passing</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Premium</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Status</th>
                                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.map((exam) => (
                                <tr key={exam.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{exam.level || '-'}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{exam.section || '-'}</td>
                                    <td className="p-3 font-medium text-gray-900 dark:text-white">{exam.subject}</td>
                                    <td className="p-3 text-gray-500 dark:text-gray-400 font-mono text-sm">{exam.subject_code || '-'}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{exam.title}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{exam.duration} min</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{exam.total_questions}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-400">{exam.passing_score}%</td>
                                    <td className="p-3">
                                        {exam.is_premium ? (
                                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                                <Crown className="w-3 h-3" /> Premium
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full w-fit">Free</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`text-xs px-2 py-1 rounded-full ${exam.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {exam.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    setSelectedExam(exam);
                                                    await fetchQuestions(exam.id!);
                                                    setShowQuestionsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Manage Questions"
                                            >
                                                <FileQuestion className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingExam(exam);
                                                    setFormData({
                                                        level: exam.level || '',
                                                        section: exam.section || '',
                                                        subject: exam.subject,
                                                        subject_code: exam.subject_code || '',
                                                        title: exam.title,
                                                        description: exam.description || '',
                                                        duration: exam.duration,
                                                        total_questions: exam.total_questions,
                                                        passing_score: exam.passing_score,
                                                        instructions: exam.instructions || '',
                                                        is_premium: exam.is_premium,
                                                        is_active: exam.is_active
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteExam(exam.id!)}
                                                className="text-red-600 hover:text-red-800"
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
                
                {exams.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No mock exams found. Click "Add New Mock Exam" to create one.
                    </div>
                )}
            </div>

            {/* Add/Edit Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingExam ? 'Edit Mock Exam' : 'Create New Mock Exam'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {/* Level and Section */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Level *</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Exam Title *</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Mathematics Mock Exam 2024"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the exam"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total Questions</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.total_questions}
                                        onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Passing Score (%)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.passing_score}
                                        onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.is_active ? 'active' : 'inactive'}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Instructions</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Exam instructions for students..."
                                />
                            </div>
                            
                            {/* Premium Toggle */}
                            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div>
                                    <label className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        Premium Exam
                                    </label>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        Only verified premium subscribers can access this exam
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
                            
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300">
                                    Cancel
                                </button>
                                <button onClick={saveExam} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90">
                                    {editingExam ? 'Update Exam' : 'Create Exam'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Questions Modal */}
            {showQuestionsModal && selectedExam && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Questions: {selectedExam.title}</h2>
                                <p className="text-sm text-gray-500">{selectedExam.subject} ({selectedExam.subject_code}) • {selectedExam.level} • {selectedExam.section}</p>
                            </div>
                            <button onClick={() => setShowQuestionsModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Question Form */}
                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                                    {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                                </h3>
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        rows={2}
                                        placeholder="Question text"
                                        value={currentQuestion.question_text}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input type="text" placeholder="Option A" className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={currentQuestion.option_a} onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_a: e.target.value })} />
                                        <input type="text" placeholder="Option B" className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={currentQuestion.option_b} onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_b: e.target.value })} />
                                        <input type="text" placeholder="Option C" className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={currentQuestion.option_c} onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_c: e.target.value })} />
                                        <input type="text" placeholder="Option D" className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={currentQuestion.option_d} onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_d: e.target.value })} />
                                    </div>
                                    <div className="flex gap-3">
                                        <select
                                            className="border rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={currentQuestion.correct_answer}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })}
                                        >
                                            <option value="A">Correct: A</option>
                                            <option value="B">Correct: B</option>
                                            <option value="C">Correct: C</option>
                                            <option value="D">Correct: D</option>
                                        </select>
                                        <button onClick={addQuestion} className="bg-primary text-white px-4 py-2 rounded-lg">
                                            {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                                        </button>
                                        {editingQuestionIndex !== null && (
                                            <button onClick={() => { setCurrentQuestion({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', order_num: 0 }); setEditingQuestionIndex(null); }} className="border rounded-lg px-4 py-2">
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Questions List */}
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Questions ({questions.length})</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                            <p className="text-xs text-gray-500 mt-1">Correct: {q.correct_answer}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => editQuestion(idx)} className="text-green-600"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => removeQuestion(idx)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Save Button */}
                            <div className="mt-6 flex gap-3">
                                <button onClick={() => { setShowQuestionsModal(false); setQuestions([]); }} className="flex-1 border rounded-lg py-2">
                                    Cancel
                                </button>
                                <button onClick={saveQuestions} className="flex-1 bg-primary text-white rounded-lg py-2">
                                    Save All Questions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}