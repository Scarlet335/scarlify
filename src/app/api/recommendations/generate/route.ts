import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's weak topics (below 60%)
        const { data: weakTopics } = await supabase
            .from('user_topic_performance')
            .select('topic_id, percentage')
            .lt('percentage', 60)
            .order('percentage', { ascending: true })
            .limit(5);

        // Get completed lessons count
        const { count: completedLessons } = await supabase
            .from('user_lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // Get quiz average
        const { data: quizScores } = await supabase
            .from('quiz_scores')
            .select('score')
            .eq('user_id', user.id);
        
        const avgScore = quizScores?.length 
            ? Math.round(quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length)
            : 0;

        const recommendations = [];

        // 1. Recommend lessons for weak topics
        for (const topic of weakTopics || []) {
            recommendations.push({
                user_id: user.id,
                recommendation_type: 'lesson',
                title: `Master Your Weak Topic`,
                message: `You need more practice. Watch lessons to improve.`,
                priority: 2,
                created_at: new Date().toISOString()
            });
        }

        // 2. Recommend past questions for weak topics
        for (const topic of weakTopics || []) {
            recommendations.push({
                user_id: user.id,
                recommendation_type: 'past_question',
                title: `Practice More Questions`,
                message: `Practice GCE questions to strengthen your understanding.`,
                priority: 1,
                created_at: new Date().toISOString()
            });
        }

        // 3. Recommend quiz if lessons completed
        if (completedLessons && completedLessons > 0) {
            recommendations.push({
                user_id: user.id,
                recommendation_type: 'quiz',
                title: 'Test Your Knowledge',
                message: `Take a quiz to see what you've learned!`,
                priority: 1,
                created_at: new Date().toISOString()
            });
        }

        // 4. Recommend mock exam if ready
        if (avgScore >= 70 && completedLessons && completedLessons >= 5) {
            recommendations.push({
                user_id: user.id,
                recommendation_type: 'mock_exam',
                title: 'Ready for a Mock Exam?',
                message: `Challenge yourself with a full mock exam!`,
                priority: 2,
                created_at: new Date().toISOString()
            });
        }

        // 5. AI Tutor recommendation
        recommendations.push({
            user_id: user.id,
            recommendation_type: 'ai_tutor',
            title: 'Need Help? Ask Scarlify AI',
            message: 'Stuck on a concept? AI tutor is available 24/7.',
            priority: 0,
            created_at: new Date().toISOString()
        });

        // Delete old recommendations
        await supabase
            .from('recommendations')
            .delete()
            .eq('user_id', user.id);

        // Insert new recommendations
        if (recommendations.length > 0) {
            await supabase
                .from('recommendations')
                .insert(recommendations);
        }

        return NextResponse.json({ 
            success: true, 
            recommendations_count: recommendations.length
        });

    } catch (error) {
        console.error('Recommendation error:', error);
        return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
    }
}