'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Crown } from 'lucide-react';

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

interface Quiz {
    id?: string;
    subject: string;
    title: string;
    description: string;
    time_limit: number;
    questions: Question[];
    is_premium?: boolean;
}

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Accounting', 'Computer Science'];

export default function AdminQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
    const [formData, setFormData] = useState<Quiz>({
        subject: '',
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
        order_num: 0
    });
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        const { data } = await supabase
            .from('quizzes')
            .select('*')
            .order('created_at', { ascending: false });
        
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

    const saveQuiz = async () => {
        if (!formData.subject || !formData.title) {
            alert('Please fill in subject and title');
            return;
        }

        if (editingQuiz?.id) {
            const { error: quizError } = await supabase
                .from('quizzes')
                .update({
                    subject: formData.subject,
                    title: formData.title,
                    description: formData.description,
                    time_limit: formData.time_limit,
                    is_premium: formData.is_premium
                })
                .eq('id', editingQuiz.id);
            
            if (quizError) {
                alert('Error updating quiz');
                return;
            }

            await supabase
                .from('quiz_questions')
                .delete()
                .eq('quiz_id', editingQuiz.id);
            
            for (const q of formData.questions) {
                await supabase.from('quiz_questions').insert({
                    quiz_id: editingQuiz.id,
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    order_num: q.order_num
                });
            }
            alert('Quiz updated successfully!');
        } else {
            const { data: newQuiz, error: quizError } = await supabase
                .from('quizzes')
                .insert({
                    subject: formData.subject,
                    title: formData.title,
                    description: formData.description,
                    time_limit: formData.time_limit,
                    is_premium: formData.is_premium
                })
                .select()
                .single();
            
            if (quizError) {
                alert('Error creating quiz');
                return;
            }

            for (const q of formData.questions) {
                await supabase.from('quiz_questions').insert({
                    quiz_id: newQuiz.id,
                    question_text: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    order_num: q.order_num
                });
            }
            alert('Quiz created successfully!');
        }
        
        setShowModal(false);
        setEditingQuiz(null);
        setFormData({ subject: '', title: '', description: '', time_limit: 15, questions: [], is_premium: false });
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
            order_num: 0
        });
        setShowQuestionModal(false);
        setEditingQuestionIndex(null);
    };

    const editQuestion = (index: number) => {
        setCurrentQuestion(formData.questions[index]);
        setEditingQuestionIndex(index);
        setShowQuestionModal(true);
    };

    const removeQuestion = (index: number) => {
        const updatedQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: updatedQuestions });
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading quizzes...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Quiz Management</h1>
                <button
                    onClick={() => {
                        setEditingQuiz(null);
                        setFormData({ subject: '', title: '', description: '', time_limit: 15, questions: [], is_premium: false });
                        setShowModal(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Quiz
                </button>
            </div>

            {/* Quizzes List */}
            <div className="space-y-4">
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-5 flex justify-between items-start">
                            <div className="flex-1 cursor-pointer" onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id!)}>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        {quiz.subject}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">⏱️ {quiz.time_limit} min</span>
                                    {quiz.is_premium && (
                                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Crown className="w-3 h-3" /> Premium
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{quiz.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.description}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{quiz.questions?.length || 0} questions</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingQuiz(quiz);
                                        setFormData(quiz);
                                        setShowModal(true);
                                    }}
                                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteQuiz(quiz.id!)}
                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
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
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                <p className={q.correct_answer === 'A' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                                                    A. {q.option_a}
                                                </p>
                                                <p className={q.correct_answer === 'B' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                                                    B. {q.option_b}
                                                </p>
                                                <p className={q.correct_answer === 'C' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                                                    C. {q.option_c}
                                                </p>
                                                <p className={q.correct_answer === 'D' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
                                                    D. {q.option_d}
                                                </p>
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
                            <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject *</label>
                                <select
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quiz Title *</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Newton's Laws Quiz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the quiz"
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

                            {/* Premium Content Toggle */}
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
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Questions ({formData.questions.length})</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentQuestion({
                                                question_text: '',
                                                option_a: '',
                                                option_b: '',
                                                option_c: '',
                                                option_d: '',
                                                correct_answer: 'A',
                                                order_num: formData.questions.length + 1
                                            });
                                            setEditingQuestionIndex(null);
                                            setShowQuestionModal(true);
                                        }}
                                        className="text-primary text-sm flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Question
                                    </button>
                                </div>
                                {formData.questions.length === 0 ? (
                                    <p className="text-gray-400 dark:text-gray-500 text-center py-4">No questions added yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.questions.map((q, idx) => (
                                            <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correct: {q.correct_answer}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => editQuestion(idx)} className="text-green-600 dark:text-green-400">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => removeQuestion(idx)} className="text-red-600 dark:text-red-400">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                            <button onClick={() => setShowQuestionModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Question Text *</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                    value={currentQuestion.question_text}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                                    placeholder="Enter the question"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Option A *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={currentQuestion.option_a}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_a: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Option B *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={currentQuestion.option_b}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_b: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Option C *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={currentQuestion.option_c}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_c: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Option D *</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={currentQuestion.option_d}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, option_d: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Correct Answer *</label>
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
                                <button onClick={() => setShowQuestionModal(false)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button onClick={addQuestion} className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90">
                                    {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}