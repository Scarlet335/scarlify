import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get recommendations
        const { data: recommendations } = await supabase
            .from('recommendations')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_viewed', false)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        // Get weak topics
        const { data: weakTopics } = await supabase
            .from('user_topic_performance')
            .select('percentage, correct_count, total_count')
            .lt('percentage', 60)
            .order('percentage', { ascending: true })
            .limit(5);

        // Calculate study streak from activity log
        const { data: activities } = await supabase
            .from('user_activity_log')
            .select('completed_at')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false });

        let streak = 0;
        if (activities && activities.length > 0) {
            const uniqueDays = new Set();
            activities.forEach(activity => {
                const date = new Date(activity.completed_at).toDateString();
                uniqueDays.add(date);
            });
            streak = uniqueDays.size;
        }

        // Calculate overall progress
        const { data: allPerformances } = await supabase
            .from('user_topic_performance')
            .select('percentage')
            .eq('user_id', user.id);

        const avgProgress = allPerformances?.length 
            ? Math.round(allPerformances.reduce((a, b) => a + b.percentage, 0) / allPerformances.length)
            : 0;

        return NextResponse.json({
            recommendations: recommendations || [],
            weakTopics: weakTopics || [],
            streak: streak,
            overallProgress: avgProgress
        });

    } catch (error) {
        console.error('Get recommendations error:', error);
        return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }
}