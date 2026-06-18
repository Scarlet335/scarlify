'use client';
import { TrendingUp, TrendingDown, BookOpen, Brain, FileText, Target, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Topic {
    name: string;
    score: number;
}

interface StrengthsAndWeaknessesProps {
    strongTopics: Topic[];
    weakTopics: Topic[];
}

export default function StrengthsAndWeaknesses({ strongTopics, weakTopics }: StrengthsAndWeaknessesProps) {
    
    // Get recommendation for a weak topic
    const getRecommendations = (topicName: string) => {
        return [
            { type: 'lesson', label: 'Watch video lesson', link: `/student-dashboard/lessons?topic=${topicName}` },
            { type: 'quiz', label: 'Take practice quiz', link: `/student-dashboard/quizzes?topic=${topicName}` },
            { type: 'past_paper', label: 'Review past questions', link: `/past-questions?topic=${topicName}` },
            { type: 'ai', label: 'Ask Scarlify Twin for help', link: '#' },
        ];
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
        return 'bg-red-100 dark:bg-red-900/30';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Topics Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">💪 Strong Topics</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">You're excelling in these areas</p>
                    </div>
                </div>

                {strongTopics.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Complete more quizzes to identify your strengths</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {strongTopics.map((topic) => (
                            <div key={topic.name} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{topic.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreBg(topic.score)} ${getScoreColor(topic.score)}`}>
                                            {topic.score}% average
                                        </span>
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                    </div>
                                </div>
                                <Link
                                    href={`/student-dashboard/lessons?topic=${topic.name}`}
                                    className="text-primary text-sm hover:underline flex items-center gap-1"
                                >
                                    Review <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Weak Topics Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">⚠️ Areas to Improve</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Focus on these topics to boost your grade</p>
                    </div>
                </div>

                {weakTopics.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">Great job! No weak areas detected.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {weakTopics.map((topic) => {
                            const recommendations = getRecommendations(topic.name);
                            return (
                                <div key={topic.name} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{topic.name}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getScoreBg(topic.score)} ${getScoreColor(topic.score)} mt-1 inline-block`}>
                                                {topic.score}% average
                                            </span>
                                        </div>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    </div>
                                    
                                    {/* Recommendations for weak topic */}
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Recommended Actions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendations.map((rec, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={rec.link}
                                                    className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                                >
                                                    {rec.type === 'lesson' && <BookOpen className="w-3 h-3" />}
                                                    {rec.type === 'quiz' && <Brain className="w-3 h-3" />}
                                                    {rec.type === 'past_paper' && <FileText className="w-3 h-3" />}
                                                    {rec.type === 'ai' && <AlertCircle className="w-3 h-3" />}
                                                    {rec.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}