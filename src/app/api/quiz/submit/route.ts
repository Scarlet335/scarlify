import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { quizId, answers, totalQuestions } = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Please login' }, { status: 401 });
    }
    
    // Get correct answers from database
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer')
      .eq('quiz_id', quizId);
    
    // Calculate score
    let score = 0;
    questions?.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score += 10;
      }
    });
    
    const percentage = Math.round((score / (totalQuestions * 10)) * 100);
    
    // Save attempt
    const { data: attempt, error } = await supabase
      .from('user_quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score: score,
        total_possible: totalQuestions * 10,
        percentage: percentage,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Also save to quiz_scores table for dashboard
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('subject')
      .eq('id', quizId)
      .single();
    
    await supabase.from('quiz_scores').insert({
      user_id: user.id,
      subject: quizData?.subject || 'General',
      score: percentage,
      total_questions: totalQuestions,
      completed_at: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, score, percentage, attempt });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}