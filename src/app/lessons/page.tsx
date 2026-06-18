'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Play, Clock, BookOpen, CheckCircle, Download, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { saveOffline, isOnline, getAllOfflineByType } from '@/utils/offlineStorage';
import { updateXP } from '@/utils/gamification';

interface Lesson {
    id: string;
    subject: string;
    title: string;
    video_url: string;
    content: string;
    duration: string;
    order_num: number;
    level: string;
}

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [selectedLevel, setSelectedLevel] = useState<string>('O Level');
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [offlineIds, setOfflineIds] = useState<Set<string>>(new Set());
    const [xpEarned, setXpEarned] = useState<number | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchLessons();
        fetchCompletedLessons();
        loadOfflineStatus();
    }, []);

    const fetchLessons = async () => {
        const { data } = await supabase
            .from('lessons')
            .select('*')
            .order('order_num');
        
        setLessons(data || []);
        
        const uniqueSubjects = ['All', ...new Set(data?.map(l => l.subject) || [])];
        setSubjects(uniqueSubjects);
        setLoading(false);
    };

    const fetchCompletedLessons = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('user_lesson_progress')
                .select('lesson_id')
                .eq('user_id', user.id);
            setCompletedLessons(data?.map(p => p.lesson_id) || []);
        }
    };

    const loadOfflineStatus = async () => {
        const offlineLessons = await getAllOfflineByType('lesson');
        const ids = new Set(offlineLessons.map(l => l.id));
        setOfflineIds(ids);
    };

    const handleDownload = async (lesson: Lesson) => {
        if (!isOnline()) {
            alert('You are offline. Connect to internet to download.');
            return;
        }
        
        setDownloading(lesson.id);
        
        const contentSize = JSON.stringify(lesson).length;
        
        await saveOffline({
            id: lesson.id,
            type: 'lesson',
            title: lesson.title,
            content: lesson,
            downloadedAt: new Date(),
            size: contentSize
        });
        
        setDownloading(null);
        await loadOfflineStatus();
        alert('Lesson downloaded for offline study!');
    };

    const awardXP = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const earned = 50; // 50 XP per lesson completed
            setXpEarned(earned);
            await updateXP(user.id, earned, 'lesson_completed');
            setTimeout(() => setXpEarned(null), 3000);
        }
    };

    const handleMarkComplete = async (lessonId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_lesson_progress').insert({
                user_id: user.id,
                lesson_id: lessonId
            });
            setCompletedLessons([...completedLessons, lessonId]);
            await awardXP();
            alert('Lesson marked as completed! +50 XP earned!');
        }
    };

    const filteredLessons = lessons.filter(lesson => {
        if (selectedSubject !== 'All' && lesson.subject !== selectedSubject) return false;
        if (lesson.level !== selectedLevel) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-primary text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">📚 Video Lessons</h1>
                    <p className="text-white/80">Learn at your own pace with our GCE video lessons</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* XP Earned Notification */}
                {xpEarned && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg flex items-center justify-center gap-2 animate-bounce">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-700">+{xpEarned} XP Earned!</span>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4">
                    <div>
                        <label className="text-sm text-gray-500 block mb-1">Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 block mb-1">Level</label>
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="O Level">O Level</option>
                            <option value="A Level">A Level</option>
                        </select>
                    </div>
                </div>

                {/* Lessons List */}
                <div className="grid gap-4">
                    {filteredLessons.map((lesson) => (
                        <div key={lesson.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                {lesson.subject}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {lesson.duration}
                                            </span>
                                            <span className="text-xs text-gray-500">{lesson.level}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Lesson {lesson.order_num}: {lesson.title}
                                        </h3>
                                        <div className="flex gap-3 mt-3">
                                            {lesson.video_url && (
                                                <a
                                                    href={lesson.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                                                >
                                                    <Play className="w-4 h-4" />
                                                    Watch Lesson
                                                </a>
                                            )}
                                            <Link
                                                href={`/lessons/${lesson.id}`}
                                                className="flex items-center gap-2 text-gray-600 text-sm hover:text-primary"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                                Read Notes
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDownload(lesson)}
                                            disabled={downloading === lesson.id}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            title={offlineIds.has(lesson.id) ? 'Downloaded' : 'Download for offline'}
                                        >
                                            {downloading === lesson.id ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                            ) : (
                                                <Download className={`w-5 h-5 ${offlineIds.has(lesson.id) ? 'text-green-500' : 'text-gray-400'}`} />
                                            )}
                                        </button>
                                        {completedLessons.includes(lesson.id) ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <CheckCircle className="w-5 h-5" />
                                                Completed
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleMarkComplete(lesson.id)}
                                                className="text-sm text-gray-400 hover:text-green-600"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLessons.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-gray-500">No lessons found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}