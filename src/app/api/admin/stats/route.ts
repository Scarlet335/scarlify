import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: totalQuizzes },
    { count: totalQuestions },
    { count: premiumUsers },
    { data: recentUsers },
    { data: subjectScores }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_scores').select('*', { count: 'exact', head: true }),
    supabase.from('past_questions').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'Premium'),
    supabase.from('profiles').select('id, email, full_name, created_at, subscription_tier').order('created_at', { ascending: false }).limit(10),
    supabase.from('quiz_scores').select('subject, score')
  ]);

  // Calculate average score per subject
  const subjectPerformance: Record<string, { total: number; count: number }> = {};
  subjectScores?.forEach(s => {
    if (!subjectPerformance[s.subject]) {
      subjectPerformance[s.subject] = { total: 0, count: 0 };
    }
    subjectPerformance[s.subject].total += s.score;
    subjectPerformance[s.subject].count += 1;
  });

  const subjectAverages = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    avgScore: Math.round(data.total / data.count),
    studentCount: data.count
  }));

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalQuizzes: totalQuizzes || 0,
    totalQuestions: totalQuestions || 0,
    premiumUsers: premiumUsers || 0,
    recentUsers: recentUsers || [],
    subjectAverages
  });
}