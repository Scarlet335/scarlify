'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Award, Download, Home, RotateCcw, Share2, Trophy, TrendingUp, Sparkles, BookOpen, FileQuestion, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import UpgradeMessage from '@/components/UpgradeMessage';
import PaymentModal from '@/app/components/PaymentModal';
import WelcomePremiumModal from '@/components/WelcomePremiumModal';
import { updateXP } from '@/utils/gamification';

export default function QuizResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const score = searchParams.get('score');
    const quizId = searchParams.get('quizId');
    
    const [userName, setUserName] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(true);
    const [quizTitle, setQuizTitle] = useState('');
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [weakTopics, setWeakTopics] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [showPayment, setShowPayment] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userSubscription, setUserSubscription] = useState('Free');
    const [xpEarned, setXpEarned] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
        fetchWeakTopics();
        fetchUserData();
        awardXP();
    }, []);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserEmail(user.email || '');
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();
            setUserSubscription(profile?.subscription_tier || 'Free');
        }
    };

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            setUserName(profile?.full_name || user.email?.split('@')[0] || 'Student');
        }

        if (quizId) {
            const { data: quiz } = await supabase
                .from('quizzes')
                .select('subject, title, questions')
                .eq('id', quizId)
                .single();
            
            if (quiz) {
                setSubject(quiz.subject || 'Quiz');
                setQuizTitle(quiz.title || 'Quiz');
                let questionsCount = 0;
                if (quiz.questions) {
                    if (Array.isArray(quiz.questions)) {
                        questionsCount = quiz.questions.length;
                    } else if (typeof quiz.questions === 'object') {
                        questionsCount = Object.keys(quiz.questions).length;
                    }
                }
                setTotalQuestions(questionsCount);
            }
        }

        const numScore = parseInt(score || '0');
        if (totalQuestions > 0) {
            const correct = Math.round((numScore / 100) * totalQuestions);
            setCorrectAnswers(correct);
        }

        setLoading(false);
    };

    const awardXP = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && score) {
            const numScore = parseInt(score);
            const earned = Math.round(numScore / 2); // 50 XP for 100%, 25 XP for 50%
            setXpEarned(earned);
            await updateXP(user.id, earned, 'quiz_completed');
        }
    };

    const fetchWeakTopics = async () => {
        const numScore = parseInt(score || '0');
        
        if (numScore < 70) {
            const { data: weakPerformances } = await supabase
                .from('user_topic_performance')
                .select('topics(name, subject), percentage')
                .lt('percentage', 60)
                .limit(3);
            
            if (weakPerformances && weakPerformances.length > 0) {
                const topicsList = weakPerformances.map((item: any) => ({
                    name: item.topics?.name || 'Unknown Topic',
                    subject: item.topics?.subject || 'Unknown Subject',
                    percentage: item.percentage
                }));
                setWeakTopics(topicsList);
                
                const recs = [];
                if (topicsList.length > 0) {
                    recs.push({
                        type: 'lesson',
                        title: `Review ${topicsList[0].name}`,
                        message: `You need more practice. Watch the lesson to improve.`,
                        link: '/lessons'
                    });
                    recs.push({
                        type: 'past_question',
                        title: 'Practice Past Questions',
                        message: 'Strengthen your understanding by practicing related past questions.',
                        link: '/past-questions'
                    });
                } else {
                    recs.push({
                        type: 'lesson',
                        title: 'Review the Material',
                        message: 'Go through the lesson again to strengthen your understanding.',
                        link: '/lessons'
                    });
                    recs.push({
                        type: 'quiz',
                        title: 'Try Another Quiz',
                        message: 'Practice with a different quiz on the same topic.',
                        link: '/quiz'
                    });
                }
                setRecommendations(recs);
            } else {
                setRecommendations([
                    {
                        type: 'lesson',
                        title: 'Review the Material',
                        message: 'Go through the lesson again to strengthen your understanding.',
                        link: '/lessons'
                    },
                    {
                        type: 'quiz',
                        title: 'Try Another Quiz',
                        message: 'Practice with a different quiz on the same topic.',
                        link: '/quiz'
                    }
                ]);
            }
        } else if (numScore >= 70 && numScore < 90) {
            setRecommendations([
                {
                    type: 'past_question',
                    title: 'Challenge Yourself',
                    message: 'Try more challenging past questions to master this topic.',
                    link: '/past-questions'
                }
            ]);
        }
    };

    const getScoreColor = () => {
        const numScore = parseInt(score || '0');
        if (numScore >= 80) return 'text-green-600';
        if (numScore >= 60) return 'text-blue-600';
        if (numScore >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = () => {
        const numScore = parseInt(score || '0');
        if (numScore >= 80) return 'bg-green-100';
        if (numScore >= 60) return 'bg-blue-100';
        if (numScore >= 40) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getMessage = () => {
        const numScore = parseInt(score || '0');
        if (numScore >= 90) return 'Outstanding! 🎉 You\'re a star!';
        if (numScore >= 80) return 'Excellent! 🎉 You mastered this topic!';
        if (numScore >= 70) return 'Great job! 👍 Keep up the good work!';
        if (numScore >= 60) return 'Good effort! 📚 A little more practice will make perfect.';
        if (numScore >= 50) return 'Not bad! 💪 Review and try again to improve.';
        if (numScore >= 40) return 'Keep going! 📖 You can do better with more study.';
        return 'Don\'t give up! 🌟 Review the material and try again.';
    };

    const getAdvice = () => {
        const numScore = parseInt(score || '0');
        if (numScore >= 80) return 'You have a strong grasp of this subject. Consider helping other students!';
        if (numScore >= 60) return 'Good foundation! Focus on the topics you found challenging.';
        if (numScore >= 40) return 'Review the material and try the quiz again. Practice makes perfect!';
        return 'Don\'t be discouraged. Study the topics and come back for another attempt.';
    };

    const handleShare = () => {
        const text = `I scored ${score}% on the ${subject} quiz on Scarlify! 🎓 Try it yourself!`;
        if (navigator.share) {
            navigator.share({ title: 'My Quiz Score', text: text });
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const numScore = parseInt(score || '0');
    const isPremium = userSubscription === 'Premium' || userSubscription === 'Pro';

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Main Results Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className={`${getScoreBgColor()} p-6 text-center`}>
                        <Trophy className={`w-16 h-16 mx-auto mb-3 ${getScoreColor()}`} />
                        <h1 className="text-2xl font-bold text-gray-800">Quiz Completed!</h1>
                        <p className="text-gray-600 mt-1">{quizTitle}</p>
                    </div>

                    <div className="p-6 text-center border-b">
                        <p className="text-gray-500 mb-2">Your Score</p>
                        <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-primary/10 mb-4">
                            <span className={`text-5xl font-bold ${getScoreColor()}`}>{score}%</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">{getMessage()}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {correctAnswers} out of {totalQuestions} correct
                        </p>
                    </div>

                    {/* XP Earned Display */}
                    {xpEarned > 0 && (
                        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-semibold text-amber-700">+{xpEarned} XP Earned!</span>
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-800 mb-4">Performance Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{score}%</p>
                                <p className="text-xs text-gray-500">Overall Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                                <p className="text-xs text-gray-500">Correct Answers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{totalQuestions - correctAnswers}</p>
                                <p className="text-xs text-gray-500">Incorrect</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                                <p className="text-xs text-gray-500">Total Questions</p>
                            </div>
                        </div>
                    </div>

                    {/* Weak Topics Section */}
                    {weakTopics.length > 0 && (
                        <div className="p-6 border-b bg-amber-50/30">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Areas to Improve
                            </h3>
                            <div className="space-y-2">
                                {weakTopics.map((topic, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 rounded-lg">
                                        <p className="font-semibold text-gray-800">{topic.name}</p>
                                        <p className="text-sm text-gray-500">{topic.subject}</p>
                                        <p className="text-xs text-amber-600 mt-1">Score: {topic.percentage}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <div className="p-6 border-b">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                Recommended for You
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
                                                    <Trophy className="w-4 h-4 text-primary" />
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

                    {/* Upgrade Message for low scores (not premium) */}
                    {!isPremium && numScore < 50 && (
                        <div className="p-6 border-b">
                            <UpgradeMessage 
                                onUpgrade={() => setShowPayment(true)}
                                onDismiss={() => {}}
                                location="quiz-results"
                            />
                        </div>
                    )}

                    <div className="p-6 border-b">
                        <p className="text-sm text-gray-600 italic">💡 {getAdvice()}</p>
                    </div>

                    <div className="p-6 space-y-3">
                        {numScore >= 50 && (
                            <button
                                onClick={() => alert('Certificate feature coming soon!')}
                                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <Award className="w-5 h-5" />
                                Download Certificate
                            </button>
                        )}
                        
                        <button
                            onClick={() => router.push('/quiz')}
                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Take Another Quiz
                        </button>
                        
                        <button
                            onClick={() => router.push('/student-dashboard')}
                            className="w-full py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Back to Dashboard
                        </button>

                        <button
                            onClick={handleShare}
                            className="w-full py-3 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-5 h-5" />
                            Share Your Score
                        </button>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top Performers
                    </h3>
                    <p className="text-sm text-gray-500 text-center py-4">
                        Complete more quizzes to see your rank on the leaderboard!
                    </p>
                    <button
                        onClick={() => router.push('/quiz')}
                        className="w-full text-primary font-semibold text-sm hover:underline"
                    >
                        Take more quizzes →
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => {
                        setShowPayment(false);
                        setShowWelcome(true);
                        fetchUserData();
                    }}
                    userEmail={userEmail}
                />
            )}

            {/* Welcome Premium Modal */}
            {showWelcome && (
                <WelcomePremiumModal onClose={() => setShowWelcome(false)} />
            )}
        </div>
    );
}