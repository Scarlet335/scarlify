import { createClient } from './supabase/client';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at?: string;
}

export async function updateXP(userId: string, xpGained: number, activityType: string): Promise<void> {
    const supabase = createClient();
    
    const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    let currentXP = levelData?.xp || 0;
    let currentLevel = levelData?.level || 1;
    let newXP = currentXP + xpGained;
    let newLevel = currentLevel;
    let nextLevelXP = levelData?.next_level_xp || 100;
    
    while (newXP >= nextLevelXP) {
        newLevel++;
        newXP -= nextLevelXP;
        nextLevelXP = Math.floor(nextLevelXP * 1.2);
    }
    
    if (levelData) {
        await supabase
            .from('user_levels')
            .update({
                xp: newXP,
                level: newLevel,
                next_level_xp: nextLevelXP,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
    } else {
        await supabase
            .from('user_levels')
            .insert({
                user_id: userId,
                xp: newXP,
                level: newLevel,
                next_level_xp: nextLevelXP
            });
    }
    
    await checkAndAwardBadges(userId);
    
    if (newLevel > currentLevel) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('levelUp', { 
                detail: { oldLevel: currentLevel, newLevel: newLevel }
            }));
        }
    }
}

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const supabase = createClient();
    const awardedBadges: Badge[] = [];
    
    // Get user stats
    const lessonsResult = await supabase
        .from('user_lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    const quizzesResult = await supabase
        .from('quiz_scores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    const pastQuestionsResult = await supabase
        .from('past_question_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    const mockExamsResult = await supabase
        .from('user_mock_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    const aiQueriesResult = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
    
    const lessonsCount = lessonsResult.count || 0;
    const quizzesCount = quizzesResult.count || 0;
    const pastQuestionsCount = pastQuestionsResult.count || 0;
    const mockExamsCount = mockExamsResult.count || 0;
    const aiQueriesCount = aiQueriesResult.count || 0;
    
    const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);
    
    const existingBadgeIds = new Set(existingBadges?.map((b: any) => b.badge_id) || []);
    
    const { data: allBadges } = await supabase
        .from('badges')
        .select('*');
    
    const streak = await calculateStreak(userId);
    
    for (const badge of (allBadges || [])) {
        if (existingBadgeIds.has(badge.id)) continue;
        
        let earned = false;
        switch (badge.requirement_type) {
            case 'lessons':
                earned = lessonsCount >= badge.requirement_value;
                break;
            case 'quizzes':
                earned = quizzesCount >= badge.requirement_value;
                break;
            case 'past_questions':
                earned = pastQuestionsCount >= badge.requirement_value;
                break;
            case 'mock_exams':
                earned = mockExamsCount >= badge.requirement_value;
                break;
            case 'streak':
                earned = streak >= badge.requirement_value;
                break;
            case 'ai_queries':
                earned = aiQueriesCount >= badge.requirement_value;
                break;
        }
        
        if (earned) {
            await supabase
                .from('user_badges')
                .insert({ user_id: userId, badge_id: badge.id, earned_at: new Date().toISOString() });
            
            if (badge.xp_reward > 0) {
                await updateXP(userId, badge.xp_reward, 'badge');
            }
            
            awardedBadges.push({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earned_at: new Date().toISOString()
            });
        }
    }
    
    return awardedBadges;
}

export async function calculateStreak(userId: string): Promise<number> {
    const supabase = createClient();
    
    const { data: activities } = await supabase
        .from('user_activity')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (!activities || activities.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(activities[0].created_at);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < activities.length; i++) {
        const prevDate = new Date(activities[i].created_at);
        prevDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
        } else if (diffDays > 1) {
            break;
        }
    }
    
    return streak;
}

export async function getUserLevel(userId: string): Promise<{ level: number; xp: number; nextLevelXp: number; progress: number }> {
    const supabase = createClient();
    
    const { data } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (!data) {
        return { level: 1, xp: 0, nextLevelXp: 100, progress: 0 };
    }
    
    const progress = Math.round((data.xp / data.next_level_xp) * 100);
    
    return {
        level: data.level,
        xp: data.xp,
        nextLevelXp: data.next_level_xp,
        progress: Math.min(progress, 100)
    };
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
    const supabase = createClient();
    
    const { data } = await supabase
        .from('user_badges')
        .select('badges(*), earned_at')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
    
    if (!data) return [];
    
    return data.map((item: any) => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon,
        earned_at: item.earned_at
    }));
}