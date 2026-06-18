'use client';
import { CheckCircle, Circle, BookOpen, Brain, FileText, Target, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Mission {
    id: number;
    type: 'lesson' | 'quiz' | 'past_paper' | 'mock_exam';
    title: string;
    duration: string;
    priority: 'high' | 'medium' | 'low';
}

interface TodaysMissionProps {
    missions: Mission[];
}

export default function TodaysMission({ missions }: TodaysMissionProps) {
    const [completed, setCompleted] = useState<number[]>([]);

    // Get icon based on mission type
    const getMissionIcon = (type: string) => {
        switch (type) {
            case 'lesson': return <BookOpen className="w-5 h-5 text-blue-500" />;
            case 'quiz': return <Brain className="w-5 h-5 text-purple-500" />;
            case 'past_paper': return <FileText className="w-5 h-5 text-green-500" />;
            case 'mock_exam': return <Target className="w-5 h-5 text-amber-500" />;
            default: return <BookOpen className="w-5 h-5 text-gray-500" />;
        }
    };

    // Get link based on mission type
    const getMissionLink = (type: string) => {
        switch (type) {
            case 'lesson': return '/student-dashboard/lessons';
            case 'quiz': return '/student-dashboard/quizzes';
            case 'past_paper': return '/past-questions';
            case 'mock_exam': return '/student-dashboard/mock-exams';
            default: return '#';
        }
    };

    // Get priority badge color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const toggleComplete = (id: number) => {
        if (completed.includes(id)) {
            setCompleted(completed.filter(i => i !== id));
        } else {
            setCompleted([...completed, id]);
        }
    };

    const progress = (completed.length / missions.length) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Today's Mission</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Based on your weak areas, here's your personalized study plan
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {completed.length}/{missions.length} completed
                    </p>
                    <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div 
                            className="h-1.5 bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mission List */}
            <div className="space-y-3">
                {missions.map((mission) => {
                    const isCompleted = completed.includes(mission.id);
                    const Icon = getMissionIcon(mission.type);
                    const link = getMissionLink(mission.type);
                    
                    return (
                        <div 
                            key={mission.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                isCompleted 
                                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                                    : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600 hover:border-primary/50'
                            }`}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleComplete(mission.id)}
                                className="flex-shrink-0"
                            >
                                {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400 hover:text-primary transition-colors" />
                                )}
                            </button>

                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm flex-shrink-0">
                                {Icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                                        {mission.title}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(mission.priority)}`}>
                                        {mission.priority} priority
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {mission.duration}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {!isCompleted && (
                                <Link
                                    href={link}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
                                >
                                    Start
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Encouragement Message */}
            {completed.length === missions.length && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">
                        🎉 Amazing! You've completed all your missions for today!
                    </p>
                </div>
            )}
        </div>
    );
}