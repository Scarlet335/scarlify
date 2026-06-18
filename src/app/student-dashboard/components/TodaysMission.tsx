'use client';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

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

    const toggleComplete = (id: number) => {
        if (completed.includes(id)) {
            setCompleted(completed.filter(i => i !== id));
        } else {
            setCompleted([...completed, id]);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        }
    };

    const getLink = (type: string) => {
        switch (type) {
            case 'lesson': return '/student-dashboard/lessons';
            case 'quiz': return '/student-dashboard/quizzes';
            case 'past_paper': return '/past-questions';
            case 'mock_exam': return '/student-dashboard/mock-exams';
            default: return '#';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Today's Mission</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on your weak areas</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {completed.length}/{missions.length} done
                </span>
            </div>

            <div className="space-y-3">
                {missions.map((mission) => {
                    const isCompleted = completed.includes(mission.id);
                    return (
                        <div 
                            key={mission.id}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                isCompleted 
                                    ? 'bg-green-50 dark:bg-green-950/20' 
                                    : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            <button onClick={() => toggleComplete(mission.id)} className="flex-shrink-0">
                                {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-400 hover:text-primary transition-colors" />
                                )}
                            </button>
                            
                            <div className="flex-1">
                                <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                    {mission.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(mission.priority)}`}>
                                        {mission.priority}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {mission.duration}
                                    </span>
                                </div>
                            </div>
                            
                            {!isCompleted && (
                                <Link
                                    href={getLink(mission.type)}
                                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                                >
                                    Start
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}