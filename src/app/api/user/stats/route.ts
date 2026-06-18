import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get average score
  const { data: scores } = await supabase
    .from('quiz_scores')
    .select('score')
    .eq('user_id', user.id);

  const avgScore = scores?.length 
    ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
    : 0;

  // Get total quizzes
  const totalQuizzes = scores?.length || 0;

  // Get study streak (simplified - you can expand this)
  const studyStreak = 42; // You can calculate this from daily activity

  return NextResponse.json({
    avgScore,
    totalQuizzes,
    studyStreak,
    xp: 2840
  });
}