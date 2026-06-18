'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Award, TrendingUp, BookOpen, FileQuestion, ChevronRight, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function MockExamResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const score = searchParams.get('score');
    const examId = searchParams.get('examId');
    
    const [exam, setExam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchExam();
    }, []);

    const fetchExam = async () => {
        if (examId) {
            const { data } = await supabase
                .from('mock_exams')
                .select('*')
                .eq('id', examId)
                .single();
            setExam(data);
        }
        setLoading(false);
    };

    const getMessage = () => {
        const numScore = parseInt(score || '0');
        if (numScore >= 90) return 'Outstanding! 🎉 You\'re fully prepared for the real exam!';
        if (numScore >= 80) return 'Excellent! 🎉 You\'re well prepared!';
        if (numScore >= 70) return 'Great job! 👍 You passed! Keep practicing to improve further.';
        if (numScore >= 60) return 'Good effort! 📚 You need a bit more practice.';
        if (numScore >= 50) return 'Not bad! 💪 Review and try again.';
        return 'Keep going! 🌟 Don\'t give up. Review the material and try again.';
    };

    const getRecommendations = () => {
        const numScore = parseInt(score || '0');
        const recs = [];
        
        if (numScore < 70) {
            recs.push({
                type: 'lesson',
                title: 'Review Your Weak Areas',
                message: 'Go through the lessons again to strengthen your understanding.',
                link: '/lessons'
            });
            recs.push({
                type: 'past_question',
                title: 'Practice Past Questions',
                message: 'Practice more past questions on the same subject.',
                link: '/past-questions'
            });
        } else if (numScore >= 70 && numScore < 90) {
            recs.push({
                type: 'quiz',
                title: 'Challenge Yourself',
                message: 'Try topic-specific quizzes to deepen your knowledge.',
                link: '/quiz'
            });
        } else {
            recs.push({
                type: 'mock_exam',
                title: 'Try Another Mock Exam',
                message: 'Take another mock exam to maintain your readiness.',
                link: '/mock-exams'
            });
        }
        
        return recs;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const numScore = parseInt(score || '0');
    const passed = numScore >= (exam?.passing_score || 50);
    const recommendations = getRecommendations();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className={`p-6 text-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                        {passed ? (
                            <Award className="w-16 h-16 text-green-600 mx-auto mb-3" />
                        ) : (
                            <TrendingUp className="w-16 h-16 text-red-600 mx-auto mb-3" />
                        )}
                        <h1 className="text-2xl font-bold text-gray-800">
                            {passed ? 'Mock Exam Passed! 🎉' : 'Mock Exam Completed'}
                        </h1>
                        <p className="text-gray-600 mt-1">{exam?.title}</p>
                    </div>

                    <div className="p-6 text-center border-b">
                        <p className="text-gray-500 mb-2">Your Score</p>
                        <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-primary/10 mb-4">
                            <span className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                {score}%
                            </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{getMessage()}</p>
                        {!passed && exam && (
                            <p className="text-sm text-gray-500 mt-2">
                                Passing score: {exam.passing_score}%
                            </p>
                        )}
                    </div>

                    {recommendations.length > 0 && (
                        <div className="p-6 border-b">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Recommended Next Steps
                            </h3>
                            <div className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <Link
                                        key={idx}
                                        href={rec.link}
                                        className="flex items-center justify-between p-3 border rounded-xl hover:shadow-md transition-all"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                {rec.type === 'lesson' ? (
                                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                                ) : rec.type === 'past_question' ? (
                                                    <FileQuestion className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Award className="w-4 h-4 text-primary" />
                                                )}
                                                <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">{rec.message}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-6 space-y-3">
                        <button
                            onClick={() => router.push('/mock-exams')}
                            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Take Another Mock Exam
                        </button>
                        <button
                            onClick={() => router.push('/student-dashboard')}
                            className="w-full py-3 border rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {passed && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm p-6 text-center">
                        <Award className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-2">Achievement Unlocked! 🏆</h3>
                        <p className="text-gray-600 mb-4">You passed the {exam?.title} mock exam!</p>
                        <button
                            onClick={() => alert('Certificate download coming soon!')}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90"
                        >
                            Download Certificate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}