'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Brain, Clock, FileQuestion, ChevronRight, Layers, Crown } from 'lucide-react';

interface Quiz {
    id: string;
    subject: string;
    subject_code: string;
    level: string;
    section: string;
    title: string;
    description: string;
    time_limit: number;
    questions_count: number;
    is_premium: boolean;
}

export default function QuizListPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLevel, setUserLevel] = useState('');
    const [userSection, setUserSection] = useState('');
    const [userSubject, setUserSubject] = useState('');
    const [userSubjectCode, setUserSubjectCode] = useState('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkUserSelection();
    }, []);

    useEffect(() => {
        if (userLevel && userSection && userSubject) {
            fetchQuizzes();
        }
    }, [userLevel, userSection, userSubject]);

    const checkUserSelection = () => {
        const level = localStorage.getItem('student_level');
        const section = localStorage.getItem('student_section');
        const subject = localStorage.getItem('student_subject');
        const subjectCode = localStorage.getItem('student_subject_code');
        
        if (!level || !section || !subject) {
            router.push('/student-dashboard/select-level');
            return;
        }
        
        setUserLevel(level);
        setUserSection(section);
        setUserSubject(subject);
        setUserSubjectCode(subjectCode || '');
    };

    const fetchQuizzes = async () => {
        setLoading(true);
        
        const { data } = await supabase
            .from('quizzes')
            .select('*, quiz_questions(count)')
            .eq('level', userLevel)
            .eq('section', userSection)
            .eq('subject', userSubject)
            .order('created_at', { ascending: false });
        
        const quizzesWithCount = (data || []).map(quiz => ({
            ...quiz,
            questions_count: quiz.quiz_questions?.[0]?.count || 0
        }));
        
        setQuizzes(quizzesWithCount);
        setLoading(false);
    };

    const startQuiz = (quizId: string) => {
        router.push(`/quiz/${quizId}`);
    };

    const getSubjectIcon = () => {
        const icons: Record<string, string> = {
            Mathematics: '📐',
            Physics: '⚡',
            Chemistry: '🧪',
            Biology: '🧬',
            English: '📖',
            History: '📜',
            Geography: '🌍',
            Economics: '💰',
            Accounting: '📊',
        };
        return icons[userSubject] || '📚';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">{getSubjectIcon()}</span>
                                <div>
                                    <h1 className="text-3xl font-bold">{userSubject}</h1>
                                    <p className="text-white/80 text-sm">{userSubjectCode} • {userLevel} • {userSection}</p>
                                </div>
                            </div>
                            <p className="text-white/80">Test your knowledge with topic-based quizzes</p>
                        </div>
                        <button
                            onClick={() => router.push('/student-dashboard/select-level')}
                            className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                        >
                            <Layers className="w-4 h-4" />
                            Change Subject
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <Brain className="w-5 h-5 text-primary mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.length}</p>
                        <p className="text-sm text-gray-500">Available Quizzes</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <Clock className="w-5 h-5 text-primary mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quizzes.reduce((sum, q) => sum + q.time_limit, 0)} min
                        </p>
                        <p className="text-sm text-gray-500">Total Time</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <FileQuestion className="w-5 h-5 text-primary mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quizzes.reduce((sum, q) => sum + (q.questions_count || 0), 0)}
                        </p>
                        <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <Crown className="w-5 h-5 text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quizzes.filter(q => q.is_premium).length}
                        </p>
                        <p className="text-sm text-gray-500">Premium Quizzes</p>
                    </div>
                </div>

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Quizzes Available</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            No quizzes found for {userSubject} at {userLevel} {userSection} level.
                        </p>
                        <button
                            onClick={() => router.push('/student-dashboard/select-level')}
                            className="mt-4 text-primary hover:underline flex items-center gap-1 mx-auto"
                        >
                            <Layers className="w-4 h-4" />
                            Change Subject
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {quizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {quiz.is_premium && (
                                                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Crown className="w-3 h-3" /> Premium
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {quiz.time_limit} min
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {quiz.title}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                        {quiz.description || 'Test your knowledge with this quiz'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FileQuestion className="w-3 h-3" />
                                                {quiz.questions_count || 0} questions
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => startQuiz(quiz.id)}
                                        className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                                    >
                                        Start Quiz
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}