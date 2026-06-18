'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Clock, BookOpen, CheckCircle } from 'lucide-react';

export default function LessonDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchLesson();
        checkCompletion();
    }, [id]);

    const fetchLesson = async () => {
        const { data } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', id)
            .single();
        setLesson(data);
        setLoading(false);
    };

    const checkCompletion = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('user_lesson_progress')
                .select('lesson_id')
                .eq('user_id', user.id)
                .eq('lesson_id', id)
                .single();
            setCompleted(!!data);
        }
    };

    const markComplete = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please login to track progress');
            return;
        }

        const { error } = await supabase
            .from('user_lesson_progress')
            .insert({ user_id: user.id, lesson_id: id });

        if (!error) {
            setCompleted(true);
            alert('Lesson marked as complete!');
        }
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
                <p className="text-gray-500">Lesson not found</p>
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
                    Back to Lessons
                </button>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Video Section */}
                    {lesson.video_url && (
                        <div className="aspect-video">
                            <iframe
                                src={lesson.video_url}
                                title={lesson.title}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                    Lesson {lesson.order_num}: {lesson.title}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        {lesson.subject}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {lesson.duration}
                                    </span>
                                    <span>{lesson.level}</span>
                                </div>
                            </div>
                            {completed ? (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                    Completed
                                </span>
                            ) : (
                                <button
                                    onClick={markComplete}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                                >
                                    Mark as Completed
                                </button>
                            )}
                        </div>

                        {/* Notes Section - Changed from 'notes' to 'content' */}
                        {lesson.content && (
                            <div className="prose max-w-none mt-6 pt-6 border-t">
                                <h2 className="text-xl font-bold mb-4">Study Notes</h2>
                                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}