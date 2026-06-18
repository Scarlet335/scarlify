'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUserBadges, getUserLevel, calculateStreak } from '@/utils/gamification';
import { Trophy, Award, Star, Zap, TrendingUp, Target, Crown } from 'lucide-react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at?: string;
}

export default function BadgesDisplay() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [level, setLevel] = useState({ level: 1, xp: 0, nextLevelXp: 100, progress: 0 });
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadData();
        
        window.addEventListener('levelUp', handleLevelUp);
        return () => window.removeEventListener('levelUp', handleLevelUp);
    }, []);

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const [userBadges, userLevel, userStreak] = await Promise.all([
                getUserBadges(user.id),
                getUserLevel(user.id),
                calculateStreak(user.id)
            ]);
            setBadges(userBadges);
            setLevel(userLevel);
            setStreak(userStreak);
        }
        setLoading(false);
    };

    const handleLevelUp = (event: any) => {
        const { oldLevel, newLevel } = event.detail;
        alert(`🎉 LEVEL UP! You reached level ${newLevel}! 🎉`);
        loadData();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Level Card */}
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-5 text-white">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <p className="text-sm opacity-80">Your Level</p>
                        <p className="text-3xl font-bold">Level {level.level}</p>
                    </div>
                    <Crown className="w-10 h-10 opacity-80" />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span>XP Progress</span>
                        <span>{level.xp} / {level.nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                        <div className="bg-white rounded-full h-2" style={{ width: `${level.progress}%` }} />
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{level.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{streak} day streak 🔥</span>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Achievements
                    <span className="text-sm font-normal text-gray-500">({badges.length} earned)</span>
                </h3>
                
                {badges.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No badges yet. Complete activities to earn badges!</p>
                    </div>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {badges.map((badge) => (
                        <div key={badge.id} className="text-center p-3 bg-gray-50 rounded-xl">
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <p className="font-semibold text-sm">{badge.name}</p>
                            <p className="text-xs text-gray-500">{badge.description}</p>
                            {badge.earned_at && (
                                <p className="text-xs text-green-600 mt-1">
                                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}