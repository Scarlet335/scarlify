'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllOfflineByType } from '@/utils/offlineStorage';
import { BookOpen, Clock, Trash2 } from 'lucide-react';

interface OfflineLesson {
    id: string;
    title: string;
    subject: string;
    duration: string;
    content: any;
}

export default function OfflineLessonsPage() {
    const [lessons, setLessons] = useState<OfflineLesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOfflineLessons();
    }, []);

    const loadOfflineLessons = async () => {
        const offlineItems = await getAllOfflineByType('lesson');
        setLessons(offlineItems.map(item => ({
            id: item.id,
            title: item.title,
            subject: item.content.subject,
            duration: item.content.duration,
            content: item.content
        })));
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-2">📚 Offline Lessons</h1>
                <p className="text-gray-600 mb-8">Study anytime, anywhere — no internet needed</p>

                {lessons.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-gray-500">No offline lessons found.</p>
                        <p className="text-sm text-gray-400 mt-2">Download lessons to study offline.</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {lessons.map((lesson) => (
                        <div key={lesson.id} className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {lesson.subject}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{lesson.title}</h3>
                            <Link
                                href={`/offline/lessons/${lesson.id}`}
                                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                            >
                                <BookOpen className="w-4 h-4" />
                                Read Offline
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}