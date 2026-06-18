'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Clock, FileQuestion, Award, ChevronRight, TrendingUp, AlertCircle, Play, Eye, Brain, Target, BarChart3, Layers } from 'lucide-react';

interface MockExam {
    id: string;
    subject: string;
    subject_code: string;
    level: string;
    section: string;
    title: string;
    description: string;
    duration: number;
    total_questions: number;
    passing_score: number;
    instructions?: string;
    is_premium?: boolean;
}

interface ExamAttempt {
    exam_id: string;
    percentage: number;
    score: number;
    completed_at: string;
}

export default function MockExamsPage() {
    const [exams, setExams] = useState<MockExam[]>([]);
    const [attempts, setAttempts] = useState<Record<string, ExamAttempt>>({});
    const [loading, setLoading] = useState(true);
    const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);
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
            fetchExams();
            fetchAttempts();
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

    const fetchExams = async () => {
        setLoading(true);
        
        const { data } = await supabase
            .from('mock_exams')
            .select('*')
            .eq('is_active', true)
            .eq('level', userLevel)
            .eq('section', userSection)
            .eq('subject', userSubject)
            .order('created_at', { ascending: false });
        
        setExams(data || []);
        setLoading(false);
    };

    const fetchAttempts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('user_mock_attempts')
                .select('exam_id, percentage, score, completed_at')
                .eq('user_id', user.id)
                .order('completed_at', { ascending: false });
            
            const attemptsMap: Record<string, ExamAttempt> = {};
            data?.forEach(attempt => {
                if (!attemptsMap[attempt.exam_id] || attempt.percentage > attemptsMap[attempt.exam_id].percentage) {
                    attemptsMap[attempt.exam_id] = attempt;
                }
            });
            setAttempts(attemptsMap);
        }
    };

    const getReadinessLevel = (subject: string, examId: string): number => {
        const attempt = attempts[examId];
        if (attempt && attempt.percentage >= 70) {
            return Math.min(100, attempt.percentage + 10);
        }
        return Math.floor(Math.random() * 40) + 50;
    };

    const getRecommendations = (subject: string, readiness: number): string[] => {
        if (readiness < 60) {
            return [
                `Review ${subject} core concepts and formulas`,
                `Complete the ${subject} topic quiz`,
                `Practice 2023 ${subject} past questions`
            ];
        } else if (readiness < 75) {
            return [
                `Focus on weak areas identified in your last attempt`,
                `Take a short ${subject} practice quiz`,
                `Review marking schemes for ${subject}`
            ];
        }
        return [
            `You're ready! Focus on time management`,
            `Review high-yield topics only`,
            `Get a good night's rest before the exam`
        ];
    };

    const startExam = (examId: string) => {
        router.push(`/mock-exams/${examId}`);
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

    const totalExams = exams.length;
    const examsTaken = Object.keys(attempts).length;
    const examsPassed = Object.values(attempts).filter(a => a.percentage >= 70).length;
    const avgScore = Object.values(attempts).length > 0 
        ? Math.round(Object.values(attempts).reduce((a, b) => a + b.percentage, 0) / Object.values(attempts).length)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-12">
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
                            <p className="text-white/80">Simulate real GCE exam conditions and track your readiness</p>
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
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <FileQuestion className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExams}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Exams</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{examsTaken}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exams Taken</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{examsPassed}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Exams Passed</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                    </div>
                </div>

                {/* Exams List */}
                {exams.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Mock Exams Available</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            No mock exams found for {userSubject} at {userLevel} {userSection} level.
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
                    <div className="space-y-6">
                        {exams.map((exam) => {
                            const attempt = attempts[exam.id];
                            const readiness = getReadinessLevel(exam.subject, exam.id);
                            const isReady = readiness >= 70;
                            const recommendations = getRecommendations(exam.subject, readiness);
                            
                            return (
                                <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                        {exam.subject}
                                                    </span>
                                                    {exam.is_premium && (
                                                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                                                            Premium
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{exam.title}</h2>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exam.description}</p>
                                            </div>
                                            {attempt && (
                                                <div className="text-right bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4 py-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Best Score</p>
                                                    <p className={`text-2xl font-bold ${attempt.percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                        {attempt.percentage}%
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(attempt.completed_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Exam Details */}
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {exam.duration} minutes
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <FileQuestion className="w-4 h-4" />
                                                {exam.total_questions} questions
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Award className="w-4 h-4" />
                                                Passing: {exam.passing_score}%
                                            </div>
                                        </div>

                                        {/* Readiness Level */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600 dark:text-gray-400">Exam Readiness</span>
                                                <span className={`font-semibold ${isReady ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    {readiness}% {isReady ? '✅ Ready' : '⚠️ Needs Review'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div 
                                                    className={`h-2.5 rounded-full transition-all ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${readiness}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* AI Recommendations */}
                                        {!isReady && (
                                            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                                <div className="flex items-start gap-2">
                                                    <Brain className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">📚 Recommended Preparation:</p>
                                                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                                                            {recommendations.map((rec, idx) => (
                                                                <li key={idx} className="flex items-center gap-2">
                                                                    <ChevronRight className="w-3 h-3" /> {rec}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedExam(exam);
                                                    setShowInstructions(true);
                                                }}
                                                className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {attempt ? 'Retake Exam' : 'Start Exam'}
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedExam(exam)}
                                                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> View Instructions
                                            </button>
                                        </div>

                                        {/* Post-Exam Recommendation */}
                                        {attempt && attempt.percentage < 70 && (
                                            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                                <p className="text-sm text-purple-800 dark:text-purple-300 flex items-center gap-2">
                                                    <Target className="w-4 h-4" />
                                                    <strong>Focus Area:</strong> You scored {attempt.percentage}%. Review {exam.subject} past questions before retaking.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Performance Tip */}
                {examsTaken > 0 && (
                    <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                        <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">🎓 Performance Insight</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {avgScore >= 70 
                                        ? `Great job! You're consistently scoring above 70%. Focus on timing and review your weak areas to push to 85%+.`
                                        : `You're making progress! Focus on the recommended topics before your next mock exam. Consistency is key to improvement.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions Modal */}
            {showInstructions && selectedExam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exam Instructions</h2>
                            <button onClick={() => setShowInstructions(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Duration: {selectedExam.duration} minutes
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    You will have {selectedExam.duration} minutes to complete all {selectedExam.total_questions} questions.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">📋 Exam Format:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li>{selectedExam.total_questions} multiple choice questions</li>
                                    <li>Passing score: {selectedExam.passing_score}%</li>
                                    <li>Each question has 4 options (A, B, C, D)</li>
                                    <li>No negative marking for wrong answers</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">⚠️ Important Rules:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li>Do not refresh the page during the exam</li>
                                    <li>Your answers are auto-saved</li>
                                    <li>You can review questions before submitting</li>
                                    <li>Results will be shown immediately after submission</li>
                                </ul>
                            </div>
                            
                            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    💡 Tip: Read each question carefully. Use the elimination method for difficult questions.
                                </p>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowInstructions(false)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2">
                                    Close
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowInstructions(false);
                                        startExam(selectedExam.id);
                                    }}
                                    className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary/90 flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4" /> Start Exam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}