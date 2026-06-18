import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { questionId, questionType, topicId, isCorrect, timeSpent, subject } = await request.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update user_topic_performance
        const { data: existing } = await supabase
            .from('user_topic_performance')
            .select('*')
            .eq('user_id', user.id)
            .eq('topic_id', topicId)
            .single();

        if (existing) {
            const newCorrectCount = existing.correct_count + (isCorrect ? 1 : 0);
            const newTotalCount = existing.total_count + 1;
            const newPercentage = Math.round((newCorrectCount / newTotalCount) * 100);
            
            let masteryLevel = 'Not Started';
            if (newPercentage >= 90) masteryLevel = 'Mastered';
            else if (newPercentage >= 75) masteryLevel = 'Proficient';
            else if (newPercentage >= 50) masteryLevel = 'Developing';
            else if (newPercentage >= 25) masteryLevel = 'Beginner';
            
            await supabase
                .from('user_topic_performance')
                .update({
                    correct_count: newCorrectCount,
                    total_count: newTotalCount,
                    percentage: newPercentage,
                    mastery_level: masteryLevel,
                    last_practiced: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            const newPercentage = isCorrect ? 100 : 0;
            await supabase
                .from('user_topic_performance')
                .insert({
                    user_id: user.id,
                    topic_id: topicId,
                    correct_count: isCorrect ? 1 : 0,
                    total_count: 1,
                    percentage: newPercentage,
                    mastery_level: newPercentage >= 90 ? 'Proficient' : 'Beginner',
                    last_practiced: new Date().toISOString()
                });
        }

        // Log activity
        await supabase
            .from('user_activity_log')
            .insert({
                user_id: user.id,
                activity_type: 'past_question_attempted',
                subject: subject,
                topic_id: topicId,
                score: isCorrect ? 100 : 0,
                total_questions: 1,
                time_spent: timeSpent || 0,
                completed_at: new Date().toISOString()
            });

        // Trigger recommendation regeneration
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/recommendations/generate`, {
            method: 'POST',
        }).catch(err => console.error('Failed to regenerate recommendations:', err));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Track performance error:', error);
        return NextResponse.json({ error: 'Failed to track performance' }, { status: 500 });
    }
}