// src/app/student-dashboard/components/StudentDashboardScreen.tsx

'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DashboardBentoGrid from './DashboardBentoGrid';
import StudyActivityChart from './StudyActivityChart';
import RecentActivityFeed from './RecentActivityFeed';
import Footer from '@/components/Footer';
import PaymentModal from '../../components/PaymentModal';
import ScarlifyTwinCard from './ScarlifyTwinCard';
import TodaysMission from './TodaysMission';
import StrengthsAndWeaknesses from './StrengthsAndWeaknesses';
import QuickQuestion from './QuickQuestion';
import QuizScoreChart from './QuizScoreChart';
import WelcomePremiumModal from '@/components/WelcomePremiumModal';
import OfflineManager from '@/components/OfflineManager';
import { 
    BookOpen, GraduationCap, Layers, ChevronRight, RefreshCw, 
    FileText, Brain, Target, Calendar, AlertCircle,
    Crown, Zap, CreditCard, Lock
} from 'lucide-react';
import Link from 'next/link';
import UpgradeMessage from '@/components/UpgradeMessage';

export default function StudentDashboardScreen() {
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('Student');
    const [userSelection, setUserSelection] = useState({
        level: '',
        section: '',
        subject: '',
        subjectCode: '',
    });
    const [userStats, setUserStats] = useState({
        streak: 0,
        topicsMastered: 0,
        quizAverage: 0,
        pastPapersDone: 0,
        subscriptionTier: 'Free',
        isPremium: false,
        subscriptionEndDate: null as string | null,
        daysRemaining: null as number | null,
    });
    const [readinessScore, setReadinessScore] = useState(0);
    const [predictedGrade, setPredictedGrade] = useState('C');
    const [targetGrade, setTargetGrade] = useState('A');
    const [examCountdown, setExamCountdown] = useState(47);
    const [dailyMessage, setDailyMessage] = useState('');
    const [todayMissions, setTodayMissions] = useState<any[]>([]);
    const [strongTopics, setStrongTopics] = useState<any[]>([]);
    const [weakTopics, setWeakTopics] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkUserSelection();
        loadUserStats();
        loadScarlifyTwinData();
        loadTodaysMissions();
        loadStrengthsAndWeaknesses();
        loadPaymentHistory();
    }, []);

    const checkUserSelection = async () => {
        let level = localStorage.getItem('student_level');
        let section = localStorage.getItem('student_section');
        let subject = localStorage.getItem('student_subject');
        let subjectCode = localStorage.getItem('student_subject_code');

        if (!level || !section || !subject) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('selected_level, selected_section, selected_subject, selected_subject_code, full_name')
                    .eq('id', user.id)
                    .single();
                
                if (profile?.selected_level) {
                    level = profile.selected_level;
                    section = profile.selected_section;
                    subject = profile.selected_subject;
                    subjectCode = profile.selected_subject_code;
                    if (profile.full_name) setUserName(profile.full_name);
                    
                    if (level) localStorage.setItem('student_level', level);
                    if (section) localStorage.setItem('student_section', section);
                    if (subject) localStorage.setItem('student_subject', subject);
                    if (subjectCode) localStorage.setItem('student_subject_code', subjectCode);
                }
            }
        }

        if (!level || !section || !subject) {
            router.push('/student-dashboard/select-level');
            return;
        }

        setUserSelection({
            level: level as string,
            section: section as string,
            subject: subject as string,
            subjectCode: subjectCode || '',
        });
    };

    const loadUserStats = async () => {
        setLoading(true);
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            window.location.href = '/sign-up-login-screen';
            return;
        }

        setUserEmail(user.email || '');
        if (user.user_metadata?.full_name) setUserName(user.user_metadata.full_name);

        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, is_premium, subscription_type, subscription_end_date')
            .eq('id', user.id)
            .single();

        let daysRemaining = null;
        if (profile?.subscription_end_date) {
            const endDate = new Date(profile.subscription_end_date);
            const now = new Date();
            const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            daysRemaining = diff > 0 ? diff : 0;
        }

        const isPremium = profile?.is_premium || false;
        const subscriptionTier = profile?.subscription_type || 'Free';

        const { data: quizScores } = await supabase
            .from('quiz_scores')
            .select('score')
            .eq('user_id', user.id);

        const avgScore = quizScores && quizScores.length > 0
            ? Math.round(quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length)
            : 0;

        const { count: completedLessons } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const { count: papersCount } = await supabase
            .from('past_question_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const { data: activities } = await supabase
            .from('user_activity')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        let streak = 0;
        if (activities && activities.length > 0) {
            const uniqueDays = new Set();
            activities.forEach(activity => {
                const date = new Date(activity.created_at).toDateString();
                uniqueDays.add(date);
            });
            streak = uniqueDays.size;
        }

        setUserStats({
            streak: streak,
            topicsMastered: completedLessons || 0,
            quizAverage: avgScore,
            pastPapersDone: papersCount || 0,
            subscriptionTier: subscriptionTier,
            isPremium: isPremium,
            subscriptionEndDate: profile?.subscription_end_date || null,
            daysRemaining: daysRemaining,
        });

        setLoading(false);
    };

    const loadPaymentHistory = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('payment_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (data) {
            setPaymentHistory(data);
        }
    };

    const loadScarlifyTwinData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const lessonScore = Math.min(100, (userStats.topicsMastered / 20) * 100);
        const quizScore = userStats.quizAverage;
        const papersScore = Math.min(100, (userStats.pastPapersDone / 30) * 100);
        const streakScore = Math.min(100, (userStats.streak / 30) * 100);
        
        const readiness = Math.round(
            (lessonScore * 0.3) + (quizScore * 0.3) + (papersScore * 0.2) + (streakScore * 0.2)
        );
        setReadinessScore(readiness);

        if (readiness >= 85) setPredictedGrade('A');
        else if (readiness >= 70) setPredictedGrade('B');
        else if (readiness >= 55) setPredictedGrade('C');
        else if (readiness >= 40) setPredictedGrade('D');
        else setPredictedGrade('E');

        const examDate = new Date(new Date().getFullYear(), 5, 1);
        const today = new Date();
        const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        setExamCountdown(Math.max(0, daysLeft));

        const messages = [
            `You improved ${userStats.quizAverage > 70 ? 'amazingly' : 'steadily'} this week. Complete one lesson today to stay on track for your target grade ${targetGrade}.`,
            `Great job! You've completed ${userStats.topicsMastered} lessons. Keep pushing toward your target grade ${targetGrade}!`,
            `Your consistency is paying off! ${userStats.streak} day streak - don't break it now!`,
            `Focus on your weak topics today. Even 20 minutes of practice makes a difference.`,
        ];
        setDailyMessage(messages[Math.floor(Math.random() * messages.length)]);
    };

    const loadTodaysMissions = async () => {
        setTodayMissions([
            { id: 1, type: 'lesson', title: 'Complete Trigonometry lesson', duration: '15 min', priority: 'high' },
            { id: 2, type: 'quiz', title: 'Take Trigonometry practice quiz', duration: '10 min', priority: 'medium' },
            { id: 3, type: 'past_paper', title: 'Try 2023 Mathematics past paper', duration: '20 min', priority: 'medium' },
        ]);
    };

    const loadStrengthsAndWeaknesses = async () => {
        setStrongTopics([
            { name: 'Algebra', score: 92 },
            { name: 'Biology', score: 88 },
            { name: 'English', score: 85 },
        ]);
        setWeakTopics([
            { name: 'Trigonometry', score: 45 },
            { name: 'Calculus', score: 52 },
            { name: 'Mechanics', score: 48 },
        ]);
    };

    const resetSelection = () => {
        localStorage.removeItem('student_level');
        localStorage.removeItem('student_section');
        localStorage.removeItem('student_subject');
        localStorage.removeItem('student_subject_code');
        router.push('/student-dashboard/select-level');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handlePaymentComplete = () => {
        setShowPayment(false);
        // Refresh all data
        Promise.all([
            loadUserStats(),
            loadPaymentHistory()
        ]).then(() => {
            if (userStats.isPremium) {
                setShowWelcome(true);
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading your Scarlify Twin...</p>
                </div>
            </div>
        );
    }

    const isPremium = userStats.isPremium || userStats.subscriptionTier === 'Premium' || userStats.subscriptionTier === 'Pro';
    const isExpiring = userStats.daysRemaining !== null && userStats.daysRemaining <= 3 && userStats.daysRemaining > 0;
    const isExpired = userStats.daysRemaining !== null && userStats.daysRemaining <= 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Premium Status Banner */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {isPremium ? (
                                <>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                        isExpiring ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                                    }`}>
                                        <Crown className="w-4 h-4" />
                                        Premium Active
                                    </div>
                                    {userStats.subscriptionTier && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {userStats.subscriptionTier === 'Premium' ? 'Monthly Plan' : 'Annual Plan'}
                                        </span>
                                    )}
                                    {userStats.daysRemaining !== null && userStats.daysRemaining > 0 && (
                                        <span className={`text-sm ${isExpiring ? 'text-orange-600 font-semibold dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {isExpiring ? `⚠️ Expires in ${userStats.daysRemaining} days` : `${userStats.daysRemaining} days remaining`}
                                        </span>
                                    )}
                                    {isExpired && (
                                        <span className="text-sm text-red-600 font-semibold dark:text-red-400">⚠️ Subscription Expired</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                                        <Lock className="w-4 h-4" />
                                        Free Plan
                                    </div>
                                    <Link href="/subscription-plans">
                                        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all">
                                            <Zap className="w-4 h-4" />
                                            Upgrade Now
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isPremium && (
                                <Link href="/payment-history">
                                    <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
                                        <CreditCard className="w-4 h-4" />
                                        History
                                    </button>
                                </Link>
                            )}
                            <button 
                                onClick={() => setShowPayment(true)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header with User Info */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">
                                {getGreeting()}, {userName}! 👋
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>{userSelection.level}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                    <Layers className="w-4 h-4" />
                                    <span>{userSelection.section}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{userSelection.subject} ({userSelection.subjectCode})</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={resetSelection}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Change Subject
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-6">
                
                {/* Upgrade Message */}
                {!isPremium && (
                    <div className="mb-5">
                        <UpgradeMessage 
                            onUpgrade={() => setShowPayment(true)}
                            onDismiss={() => {}}
                            location="dashboard"
                        />
                    </div>
                )}

                {/* Expiring Warning */}
                {isExpiring && isPremium && (
                    <div className="mb-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-orange-800 dark:text-orange-300">Your Premium subscription is expiring soon!</p>
                                <p className="text-sm text-orange-700 dark:text-orange-400">
                                    Your subscription will expire in {userStats.daysRemaining} days. 
                                    <Link href="/subscription-plans" className="font-semibold underline ml-1">
                                        Renew now to keep your premium access.
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment History Quick View */}
                {isPremium && paymentHistory.length > 0 && (
                    <div className="mb-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                Recent Payments
                            </h3>
                            <Link href="/payment-history" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {paymentHistory.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {payment.amount.toLocaleString()} FCFA
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                            {payment.payment_method === 'fapshi_mtn' ? 'MTN Money' : 
                                             payment.payment_method === 'fapshi_orange' ? 'Orange Money' : 
                                             'Manual Payment'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        }`}>
                                            {payment.status}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 text-xs">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scarlify Twin Card */}
                <div className="mb-6">
                    <ScarlifyTwinCard 
                        examCountdown={examCountdown}
                        readinessScore={readinessScore}
                        targetGrade={targetGrade}
                        predictedGrade={predictedGrade}
                        dailyMessage={dailyMessage}
                    />
                </div>

                {/* Today's Mission */}
                <div className="mb-6">
                    <TodaysMission missions={todayMissions} />
                </div>

                {/* Stats Grid - Updated to match DashboardBentoGrid props */}
                <div className="mb-6">
                    <DashboardBentoGrid 
                        streak={userStats.streak}
                        topicsMastered={userStats.topicsMastered}
                        quizAverage={userStats.quizAverage}
                        pastPapersDone={userStats.pastPapersDone}
                        subscriptionTier={userStats.subscriptionTier}
                    />
                </div>

                {/* Strengths & Weaknesses */}
                <div className="mb-6">
                    <StrengthsAndWeaknesses 
                        strongTopics={strongTopics}
                        weakTopics={weakTopics}
                    />
                </div>

                {/* Charts Row */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                    <div className="lg:col-span-2">
                        <StudyActivityChart />
                    </div>
                    <div>
                        <QuizScoreChart />
                    </div>
                </div>

                {/* Quick Access Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                    <Link href="/student-dashboard/lessons" className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Lessons</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Study {userSelection.subject} lessons</p>
                        <div className="flex items-center gap-1 text-primary text-sm group-hover:gap-2 transition-all">
                            Continue Learning <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    <Link href="/past-questions" className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Past Questions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Practice past papers</p>
                        <div className="flex items-center gap-1 text-primary text-sm group-hover:gap-2 transition-all">
                            Start Practicing <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    <Link href="/student-dashboard/quizzes" className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3">
                            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Quizzes</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Test your knowledge</p>
                        <div className="flex items-center gap-1 text-primary text-sm group-hover:gap-2 transition-all">
                            Take a Quiz <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    <Link href="/student-dashboard/mock-exams" className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-3">
                            <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Mock Exams</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Simulate real exams</p>
                        <div className="flex items-center gap-1 text-primary text-sm group-hover:gap-2 transition-all">
                            Start Mock Exam <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>

                {/* Quick Question Box */}
                <div className="mb-6">
                    <QuickQuestion />
                </div>

                {/* Recent Activity Feed */}
                <div className="mt-6">
                    <RecentActivityFeed />
                </div>
            </main>
            <Footer />

            <OfflineManager />

            {/* Payment Modal - FIXED */}
            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentComplete}
                    userEmail={userEmail}   // ✅ Added this
                    userId={userEmail}      // ✅ Keep this
                    planId="premium" 
                />
            )}

            {/* Welcome Premium Modal - FIXED */}
            {showWelcome && (
                <WelcomePremiumModal 
                    isOpen={showWelcome}
                    onClose={() => setShowWelcome(false)}
                    userName={userName}  // ✅ Only this prop is needed
                />
            )}
        </div>      
    );
}