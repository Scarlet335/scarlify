import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateXP, checkAndAwardBadges } from '@/utils/gamification';

export async function POST(request: NextRequest) {
    try {
        const { activityType, score, details } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        let xpEarned = 0;
        switch (activityType) {
            case 'lesson_completed':
                xpEarned = 50;
                break;
            case 'quiz_completed':
                xpEarned = Math.round(score / 2);
                break;
            case 'past_question_correct':
                xpEarned = 10;
                break;
            case 'mock_exam_completed':
                xpEarned = 100;
                break;
            case 'ai_query':
                xpEarned = 5;
                break;
            default:
                xpEarned = 10;
        }
        
        await updateXP(user.id, xpEarned, activityType);
        
        const newBadges = await checkAndAwardBadges(user.id);
        
        return NextResponse.json({ 
            success: true, 
            xpEarned,
            newBadges: newBadges.length,
            badges: newBadges
        });
        
    } catch (error) {
        console.error('Gamification error:', error);
        return NextResponse.json({ error: 'Failed to track activity' }, { status: 500 });
    }
}