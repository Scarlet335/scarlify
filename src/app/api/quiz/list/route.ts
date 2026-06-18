import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(count)');
  
  return NextResponse.json(quizzes || []);
}