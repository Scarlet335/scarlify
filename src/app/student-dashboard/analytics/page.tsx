'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TrendingUp, Award, Brain, Target, Calendar, Clock, BookOpen, FileText } from 'lucide-react';

export default function StudentAnalyticsPage() {
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    avgScore: 0,
    lessonsCompleted: 0,
    studyStreak: 0,
    totalMinutes: 0,
    pastPapersDone: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get quiz scores
    const { data: quizScores } = await supabase
      .from('quiz_scores')
      .select('score')
      .eq('user_id', user.id);
    
    const avgScore = quizScores && quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b.score, 0) / quizScores.length)
      : 0;

    // Get completed lessons
    const { count: lessonsCompleted } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    // Get past papers done
    const { count: pastPapersDone } = await supabase
      .from('past_question_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setStats({
      quizzesTaken: quizScores?.length || 0,
      avgScore: avgScore,
      lessonsCompleted: lessonsCompleted || 0,
      studyStreak: 5, // Placeholder
      totalMinutes: (lessonsCompleted || 0) * 30, // Estimate
      pastPapersDone: pastPapersDone || 0
    });
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Your Learning Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <Brain className="w-6 h-6 text-primary mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.quizzesTaken}</p>
          <p className="text-sm text-gray-500">Quizzes Taken</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <Target className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgScore}%</p>
          <p className="text-sm text-gray-500">Average Quiz Score</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lessonsCompleted}</p>
          <p className="text-sm text-gray-500">Lessons Completed</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <Calendar className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studyStreak} days</p>
          <p className="text-sm text-gray-500">Current Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <Clock className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMinutes} min</p>
          <p className="text-sm text-gray-500">Total Study Time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <FileText className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pastPapersDone}</p>
          <p className="text-sm text-gray-500">Past Papers Done</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Performance Insight
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {stats.avgScore >= 70 
            ? `Great job! You're scoring above 70%. Keep up the consistency to reach 85%+.`
            : `You're making progress! Focus on your weak areas and take more quizzes to improve.`}
        </p>
      </div>
    </div>
  );
}