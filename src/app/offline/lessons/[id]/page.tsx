'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOfflineContent } from '@/utils/offlineStorage';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';

export default function OfflineLessonDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLesson();
    }, [id]);

    const loadLesson = async () => {
        const offlineContent = await getOfflineContent('lesson', id as string);
        if (offlineContent) {
            setLesson(offlineContent.content);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Lesson not available offline.</p>
                    <button onClick={() => router.back()} className="text-primary mt-4">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 mb-4 hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            {lesson.title}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {lesson.subject}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration}
                            </span>
                            <span>{lesson.level}</span>
                        </div>

                        <div className="prose max-w-none mt-6 pt-6 border-t">
                            <h2 className="text-xl font-bold mb-4">Study Notes</h2>
                            <div className="text-gray-700 leading-relaxed" 
                                 dangerouslySetInnerHTML={{ __html: lesson.content || 'No notes available for offline mode.' }} 
                            />
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-center">
                            <p className="text-sm text-yellow-700">
                                📴 You are in offline mode. Connect to internet to access videos and additional content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}