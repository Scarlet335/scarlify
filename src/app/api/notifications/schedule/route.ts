import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    const supabase = await createClient();

    if (type === 'study_reminder') {
      // Send study reminders to users who haven't studied today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: inactiveUsers } = await supabase
        .from('user_activity')
        .select('user_id')
        .lt('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      const uniqueUsers = [...new Set(inactiveUsers?.map(u => u.user_id) || [])];

      for (const userId of uniqueUsers) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: 'Study Reminder 📚',
            message: 'Don\'t forget to complete your daily study goals!',
            type: 'reminder',
            data: { link: '/student-dashboard' }
          }),
        });
      }
    }

    if (type === 'quiz_alert') {
      // Send quiz recommendations based on weak topics
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      for (const user of users || []) {
        // Get user's weak topics from quiz scores
        const { data: quizScores } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('user_id', user.id)
          .lt('score', 60);

        if (quizScores && quizScores.length > 0) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              title: 'Quiz Recommendation 🎯',
              message: 'We noticed you might need practice. Try this quiz to improve!',
              type: 'quiz_alert',
              data: { link: '/quiz' }
            }),
          });
        }
      }
    }

    if (type === 'streak_reminder') {
      // Send streak reminders to users with active streaks
      const { data: users } = await supabase
        .from('profiles')
        .select('id');

      for (const user of users || []) {
        const { data: activities } = await supabase
          .from('user_activity')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7);

        const uniqueDays = new Set();
        activities?.forEach(activity => {
          const date = new Date(activity.created_at).toDateString();
          uniqueDays.add(date);
        });
        
        const streak = uniqueDays.size;
        
        if (streak === 5) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              title: '🔥 5-Day Streak!',
              message: 'You\'re on fire! Keep studying to reach 7 days!',
              type: 'streak',
              data: { link: '/student-dashboard' }
            }),
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json({ error: 'Failed to schedule notifications' }, { status: 500 });
  }
}