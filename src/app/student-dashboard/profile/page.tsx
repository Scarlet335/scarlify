'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    User, Mail, Calendar, Award, BookOpen, Brain, 
    Target, TrendingUp, Edit2, Save, X, Crown,
    Zap, Clock, CheckCircle, Medal, Star, Flame, Phone 
} from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
    bio: string;
    school: string;
    phone: string;
    subscription_tier: string;
    selected_level: string;
    selected_section: string;
    selected_subject: string;
    selected_subject_code: string;
    created_at: string;
}

interface UserStats {
    totalLessonsCompleted: number;
    totalQuizzesTaken: number;
    averageQuizScore: number;
    totalPastPapersDone: number;
    currentStreak: number;
    longestStreak: number;
    totalXPEarned: number;
    rank: number;
    badges: Array<{ name: string; icon: string; earned: boolean }>;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        bio: '',
        school: '',
        phone: '',
    });
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/sign-up-login-screen');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            setProfile(profile);
            setEditForm({
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                school: profile.school || '',
                phone: profile.phone || '',
            });
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get completed lessons
        const { count: lessonsCompleted } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('completed', true);

        // Get quiz scores
        const { data: quizScores } = await supabase
            .from('quiz_scores')
            .select('score')
            .eq('user_id', user.id);

        const avgScore = quizScores && quizScores.length > 0
            ? Math.round(quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length)
            : 0;

        // Get past papers done
        const { count: pastPapersDone } = await supabase
            .from('past_question_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Get activity streak
        const { data: activities } = await supabase
            .from('user_activity')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        let currentStreak = 0;
        let longestStreak = 0;
        if (activities && activities.length > 0) {
            const uniqueDays = new Set();
            activities.forEach(activity => {
                const date = new Date(activity.created_at).toDateString();
                uniqueDays.add(date);
            });
            currentStreak = uniqueDays.size;
            longestStreak = uniqueDays.size;
        }

        // Calculate XP (example: 10 XP per lesson, 5 XP per quiz)
        const totalXP = (lessonsCompleted || 0) * 10 + (quizScores?.length || 0) * 5;

        // Badges based on achievements
        const badges = [
            { name: 'First Lesson', icon: '📚', earned: (lessonsCompleted || 0) >= 1 },
            { name: 'Lesson Master', icon: '🎓', earned: (lessonsCompleted || 0) >= 10 },
            { name: 'Quiz Taker', icon: '📝', earned: (quizScores?.length || 0) >= 1 },
            { name: 'Quiz Champion', icon: '🏆', earned: (quizScores?.length || 0) >= 20 },
            { name: 'Past Paper Pro', icon: '📄', earned: (pastPapersDone || 0) >= 10 },
            { name: '7-Day Streak', icon: '🔥', earned: currentStreak >= 7 },
            { name: 'Perfect Score', icon: '💯', earned: avgScore >= 90 },
            { name: 'Premium Member', icon: '👑', earned: profile?.subscription_tier !== 'Free' },
        ];

        setStats({
            totalLessonsCompleted: lessonsCompleted || 0,
            totalQuizzesTaken: quizScores?.length || 0,
            averageQuizScore: avgScore,
            totalPastPapersDone: pastPapersDone || 0,
            currentStreak: currentStreak,
            longestStreak: longestStreak,
            totalXPEarned: totalXP,
            rank: 0, // Would need separate query for ranking
            badges: badges,
        });
    };

    const updateProfile = async () => {
        setSaving(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: editForm.full_name,
                bio: editForm.bio,
                school: editForm.school,
                phone: editForm.phone,
            })
            .eq('id', user?.id);

        if (!error) {
            setProfile(prev => ({
                ...prev!,
                full_name: editForm.full_name,
                bio: editForm.bio,
                school: editForm.school,
                phone: editForm.phone,
            }));
            setEditing(false);
            alert('Profile updated successfully!');
        } else {
            alert('Error updating profile');
        }
        
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isPremium = profile?.subscription_tier === 'Premium' || profile?.subscription_tier === 'Pro';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your account and track your progress</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-24">
                            <div className="bg-gradient-to-r from-primary to-purple-600 h-24"></div>
                            <div className="px-6 pb-6">
                                <div className="flex justify-center -mt-12 mb-4">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-white">
                                                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {profile?.full_name || 'Student'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                                    <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                        {isPremium ? (
                                            <>
                                                <Crown className="w-3 h-3 text-amber-600" />
                                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Premium Member</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Free Member</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {!editing ? (
                                    <div className="space-y-3 text-sm">
                                        {profile?.school && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{profile.school}</span>
                                            </div>
                                        )}
                                        {profile?.phone && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <Phone className="w-4 h-4" />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                        {profile?.bio && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400 italic">"{profile.bio}"</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">School</label>
                                            <input
                                                type="text"
                                                value={editForm.school}
                                                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                                            <textarea
                                                value={editForm.bio}
                                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => setEditing(false)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={updateProfile}
                                                disabled={saving}
                                                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Save className="w-4 h-4" />
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Achievements */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalLessonsCompleted || 0}</p>
                                <p className="text-xs text-gray-500">Lessons Completed</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalQuizzesTaken || 0}</p>
                                <p className="text-xs text-gray-500">Quizzes Taken</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.averageQuizScore || 0}%</p>
                                <p className="text-xs text-gray-500">Average Score</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.currentStreak || 0}</p>
                                <p className="text-xs text-gray-500">Day Streak</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalXPEarned || 0}</p>
                                <p className="text-xs text-gray-500">Total XP</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mb-2">
                                    <Award className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.badges.filter(b => b.earned).length || 0}</p>
                                <p className="text-xs text-gray-500">Badges Earned</p>
                            </div>
                        </div>

                        {/* Subject Selection Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Current Focus
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm">
                                    <span className="font-medium">Level:</span> {profile?.selected_level || 'Not selected'}
                                </span>
                                <span className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm">
                                    <span className="font-medium">Section:</span> {profile?.selected_section || 'Not selected'}
                                </span>
                                <span className="px-3 py-1.5 bg-primary/10 rounded-lg text-sm">
                                    <span className="font-medium">Subject:</span> {profile?.selected_subject || 'Not selected'} {profile?.selected_subject_code && `(${profile.selected_subject_code})`}
                                </span>
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Medal className="w-5 h-5 text-amber-500" />
                                Achievements & Badges
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {stats?.badges.map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-center p-3 rounded-xl transition-all ${
                                            badge.earned
                                                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800'
                                                : 'bg-gray-50 dark:bg-gray-700/50 opacity-50'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">{badge.icon}</div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.name}</p>
                                        {badge.earned && <CheckCircle className="w-3 h-3 text-green-500 mx-auto mt-1" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Learning Progress
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Lessons Progress</span>
                                        <span>{Math.round((stats?.totalLessonsCompleted || 0) / 50 * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-primary rounded-full h-2 transition-all"
                                            style={{ width: `${Math.min(100, (stats?.totalLessonsCompleted || 0) / 50 * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Quiz Performance</span>
                                        <span>{stats?.averageQuizScore || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 rounded-full h-2 transition-all"
                                            style={{ width: `${stats?.averageQuizScore || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}