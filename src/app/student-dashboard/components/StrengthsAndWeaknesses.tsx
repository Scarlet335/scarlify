'use client';
import { BookOpen, Brain, FileText, ChevronRight, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
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
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strong Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-green-200 dark:border-green-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">💪 Strong Topics</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">You're excelling here!</p>
                    </div>
                </div>
                
                {strongTopics.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">Complete more quizzes to identify strengths</p>
                ) : (
                    <div className="space-y-2">
                        {strongTopics.map((topic) => (
                            <div key={topic.name} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                                <span className="font-medium text-gray-900 dark:text-white">{topic.name}</span>
                                <span className="text-green-600 dark:text-green-400 font-bold">{topic.score}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Weak Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">⚠️ Areas to Improve</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Focus on these topics</p>
                    </div>
                </div>
                
                {weakTopics.length === 0 ? (
                    <p className="text-center text-green-600 dark:text-green-400 py-4">🎉 No weak areas detected!</p>
                ) : (
                    <div className="space-y-3">
                        {weakTopics.map((topic) => (
                            <div key={topic.name} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{topic.name}</span>
                                    <span className="text-red-600 dark:text-red-400 font-bold">{topic.score}%</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Link href={`/student-dashboard/lessons?topic=${topic.name}`} className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Lesson
                                    </Link>
                                    <Link href={`/student-dashboard/quizzes?topic=${topic.name}`} className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                        <Brain className="w-3 h-3" /> Quiz
                                    </Link>
                                    <Link href={`/past-questions?topic=${topic.name}`} className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Practice
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}