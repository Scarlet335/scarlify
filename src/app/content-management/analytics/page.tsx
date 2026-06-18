'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, Users, FileQuestion, Brain, Award, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalQuizzes: 0,
        totalQuestions: 0,
        premiumUsers: 0,
        totalLessons: 0,
        activeToday: 0
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        // Get total users
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get quiz scores
        const { count: totalQuizzes } = await supabase
            .from('quiz_scores')
            .select('*', { count: 'exact', head: true });

        // Get past questions
        const { count: totalQuestions } = await supabase
            .from('past_questions')
            .select('*', { count: 'exact', head: true });

        // Get premium users
        const { count: premiumUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('subscription_tier', 'Premium');

        // Get lessons
        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true });

        // Get active users today (simplified)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: activeToday } = await supabase
            .from('user_activity')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        setStats({
            totalUsers: totalUsers || 0,
            totalQuizzes: totalQuizzes || 0,
            totalQuestions: totalQuestions || 0,
            premiumUsers: premiumUsers || 0,
            totalLessons: totalLessons || 0,
            activeToday: activeToday || 0
        });
        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading analytics...</div>;

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Platform Analytics</h1>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registered students</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Quizzes Taken</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuizzes.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total quiz completions</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <FileQuestion className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Past Questions</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available questions</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Premium Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.premiumUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Paying subscribers</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Active Today</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeToday.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Users active in last 24h</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Lessons</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLessons.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total video lessons</p>
                </div>
            </div>
        </div>
    );
}