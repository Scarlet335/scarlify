'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, FileQuestion, Brain, Trophy, Sparkles, ArrowRight, TrendingUp, Target, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SmartRecommendations() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [weakTopics, setWeakTopics] = useState<any[]>([]);
    const [streak, setStreak] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchRecommendations();
        // Generate recommendations on component load
        fetch('/api/recommendations/generate', { method: 'POST' });
    }, []);

    const fetchRecommendations = async () => {
        try {
            const res = await fetch('/api/recommendations/get');
            const data = await res.json();
            setRecommendations(data.recommendations || []);
            setWeakTopics(data.weakTopics || []);
            setStreak(data.streak || 0);
            setOverallProgress(data.overallProgress || 0);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'lesson': return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'quiz': return <Brain className="w-5 h-5 text-purple-500" />;
            case 'past_question': return <FileQuestion className="w-5 h-5 text-green-500" />;
            case 'mock_exam': return <Trophy className="w-5 h-5 text-amber-500" />;
            case 'ai_tutor': return <Sparkles className="w-5 h-5 text-violet-500" />;
            default: return <Sparkles className="w-5 h-5 text-primary" />;
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority === 2) return 'border-l-4 border-red-500 bg-red-50/30';
        if (priority === 1) return 'border-l-4 border-amber-500 bg-amber-50/30';
        return 'border-l-4 border-blue-500 bg-blue-50/30';
    };

    const markAsClicked = async (id: string) => {
        await supabase
            .from('recommendations')
            .update({ is_clicked: true, is_viewed: true })
            .eq('id', id);
        fetchRecommendations();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                <div className="space-y-3">
                    <div className="h-20 bg-gray-100 rounded" />
                    <div className="h-20 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{overallProgress}%</span>
                    </div>
                    <p className="text-sm opacity-90">Overall Progress</p>
                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{streak}</span>
                    </div>
                    <p className="text-sm opacity-90">Study Streak</p>
                    {streak > 0 && <p className="text-xs opacity-75 mt-1">🔥 Keep it up!</p>}
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-6 h-6 opacity-80" />
                        <span className="text-2xl font-bold">{weakTopics.length}</span>
                    </div>
                    <p className="text-sm opacity-90">Topics to Improve</p>
                </div>
            </div>

            {/* Weak Topics Section */}
            {weakTopics.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        Topics Needing Attention
                    </h3>
                    <div className="space-y-3">
                        {weakTopics.map((topic: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-800">Topic {idx + 1}</p>
                                    <p className="text-xs text-gray-500">Score: {topic.percentage || 0}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-red-600">{topic.percentage || 0}%</p>
                                    <p className="text-xs text-gray-400">{topic.correct_count || 0}/{topic.total_count || 0} correct</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                        💡 Focus on these topics to improve your overall score
                    </p>
                </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Recommended for You
                    </h3>
                    {recommendations.map((rec: any) => {
                        let href = '#';
                        if (rec.recommendation_type === 'lesson') href = '/lessons';
                        else if (rec.recommendation_type === 'quiz') href = '/quiz';
                        else if (rec.recommendation_type === 'past_question') href = '/past-questions';
                        else if (rec.recommendation_type === 'mock_exam') href = '/mock-exams';
                        else if (rec.recommendation_type === 'ai_tutor') href = '/ai-tutor';
                        
                        return (
                            <Link
                                key={rec.id}
                                href={href}
                                onClick={() => markAsClicked(rec.id)}
                                className={`block p-4 rounded-xl transition-all hover:shadow-md ${getPriorityColor(rec.priority)}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        {getIcon(rec.recommendation_type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Motivational Message */}
            {weakTopics.length === 0 && recommendations.length === 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                    <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-700">You're Doing Great! 🎉</h3>
                    <p className="text-gray-600 mt-2">
                        You've mastered all your topics. Keep practicing to maintain your streak!
                    </p>
                </div>
            )}
        </div>
    );
}