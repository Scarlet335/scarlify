// src/app/student-dashboard/components/DashboardBentoGrid.tsx

'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Flame, BookCheck, BarChart3, FileQuestion, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// ✅ Export the interface so it can be used by parent components
export interface DashboardBentoGridProps {
  streak?: number;
  topicsMastered?: number;
  quizAverage?: number;
  pastPapersDone?: number;
  subscriptionTier?: string;
}

// Cache for user stats to avoid repeated fetches
const statsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function DashboardBentoGrid({ 
  streak: propStreak,
  topicsMastered: propTopicsMastered,
  quizAverage: propQuizAverage,
  pastPapersDone: propPastPapersDone,
  subscriptionTier: propSubscriptionTier
}: DashboardBentoGridProps) {
  const [stats, setStats] = useState({
    streak: 0,
    topicsMastered: 0,
    quizAvg: 0,
    pastPapersDone: 0,
    subscriptionTier: 'Free'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const supabase = createClient();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // If props are provided from parent, use them (no fetch needed)
    if (propStreak !== undefined) {
      setStats({
        streak: propStreak,
        topicsMastered: propTopicsMastered || 0,
        quizAvg: propQuizAverage || 0,
        pastPapersDone: propPastPapersDone || 0,
        subscriptionTier: propSubscriptionTier || 'Free'
      });
      setLoading(false);
    } else {
      // Otherwise fetch from cache or Supabase
      fetchUserStats();
    }
  }, [propStreak, propTopicsMastered, propQuizAverage, propPastPapersDone, propSubscriptionTier]);

  const fetchUserStats = async () => {
    setLoading(true);
    setError(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Check cache first
    const cached = statsCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setStats(cached.stats);
      setLoading(false);
      return;
    }
    
    // Fetch all data in parallel for speed
    try {
      const [
        { data: scores },
        { data: profile },
        { data: activities },
        { count: papersCount }
      ] = await Promise.all([
        supabase.from('quiz_scores').select('score').eq('user_id', user.id),
        supabase.from('profiles').select('subscription_tier, total_quizzes, topics_mastered').eq('id', user.id).single(),
        supabase.from('user_activity').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('past_question_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);
      
      // Calculate average score
      const avgScore = scores?.length 
        ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
        : 0;
      
      // Calculate streak
      let streak = 0;
      if (activities && activities.length > 0) {
        const uniqueDays = new Set();
        activities.forEach(activity => {
          const date = new Date(activity.created_at).toDateString();
          uniqueDays.add(date);
        });
        streak = uniqueDays.size;
      }
      
      const newStats = {
        streak: streak,
        topicsMastered: profile?.topics_mastered || 0,
        quizAvg: avgScore,
        pastPapersDone: papersCount || 0,
        subscriptionTier: profile?.subscription_tier || 'Free'
      };
      
      // Update cache
      statsCache.set(user.id, { stats: newStats, timestamp: Date.now() });
      
      if (isMounted.current) {
        setStats(newStats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (isMounted.current) {
        setError(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const metrics = [
    {
      id: 'metric-streak',
      label: 'Study Streak',
      value: stats.streak.toString(),
      unit: 'days',
      change: stats.streak > 0 ? `${stats.streak} day streak` : 'Start your streak!',
      trend: stats.streak > 0 ? 'up' : 'neutral',
      icon: Flame,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      cardBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      border: 'border-amber-200',
      hero: true,
      badge: stats.streak > 0 ? `🔥 ${stats.streak} day streak!` : 'Start studying',
    },
    {
      id: 'metric-topics',
      label: 'Topics Mastered',
      value: stats.topicsMastered.toString(),
      unit: 'topics',
      change: `${stats.topicsMastered} topics completed`,
      trend: stats.topicsMastered > 0 ? 'up' : 'neutral',
      icon: BookCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-success',
      cardBg: 'bg-card',
      border: 'border-border',
      hero: false,
      badge: stats.topicsMastered === 0 ? '📚 Start learning' : null,
    },
    {
      id: 'metric-quiz-avg',
      label: 'Quiz Average',
      value: stats.quizAvg.toString(),
      unit: '%',
      change: stats.quizAvg > 0 ? `${stats.quizAvg}% average` : 'Take your first quiz',
      trend: stats.quizAvg >= 70 ? 'up' : stats.quizAvg > 0 ? 'down' : 'neutral',
      icon: BarChart3,
      iconBg: 'bg-red-100',
      iconColor: 'text-danger',
      cardBg: stats.quizAvg >= 70 ? 'bg-card' : stats.quizAvg > 0 ? 'bg-red-50/50' : 'bg-card',
      border: stats.quizAvg >= 70 ? 'border-border' : stats.quizAvg > 0 ? 'border-red-200' : 'border-border',
      hero: false,
      badge: stats.quizAvg === 0 ? '📝 Start a quiz' : stats.quizAvg < 50 ? '⚠️ Needs work' : null,
    },
    {
      id: 'metric-papers',
      label: 'Past Papers Done',
      value: stats.pastPapersDone.toString(),
      unit: 'questions',
      change: `${stats.pastPapersDone} questions answered`,
      trend: stats.pastPapersDone > 0 ? 'up' : 'neutral',
      icon: FileQuestion,
      iconBg: 'bg-blue-100',
      iconColor: 'text-info',
      cardBg: 'bg-card',
      border: 'border-border',
      hero: false,
      badge: stats.pastPapersDone === 0 ? '📄 Try a past paper' : null,
    },
    {
      id: 'metric-plan',
      label: 'Current Plan',
      value: stats.subscriptionTier,
      unit: '',
      change: stats.subscriptionTier === 'Free' ? 'Upgrade for unlimited access' : '✨ Premium benefits active',
      trend: 'neutral',
      icon: Crown,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      cardBg: stats.subscriptionTier === 'Free' 
        ? 'bg-gradient-to-br from-secondary to-primary/5' 
        : 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
      border: 'border-primary/20',
      hero: false,
      badge: stats.subscriptionTier === 'Premium' ? '🌟 Active' : null,
    },
  ];

  // Show loading skeleton (removed for faster perceived performance)
  if (loading && !stats.streak && !stats.topicsMastered) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
            <div className="w-9 h-9 bg-gray-200 rounded-xl mb-3" />
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-4 text-center py-8 text-gray-500">
          ⚠️ Unable to load stats. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics?.map((m) => {
        const Icon = m?.icon;
        const isHero = m?.hero;
        const TrendIcon = m?.trend === 'up' ? TrendingUp : m?.trend === 'down' ? TrendingDown : null;
        return (
          <div
            key={m?.id}
            className={`relative rounded-2xl border-2 ${m?.border} ${m?.cardBg} p-4 card-shadow transition-all duration-200 hover:card-shadow-hover
              ${isHero ? 'col-span-2 lg:col-span-1' : ''}
              ${m?.id === 'metric-plan' ? 'col-span-2 lg:col-span-1' : ''}
            `}
          >
            {m?.badge && (
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${
                m?.id === 'metric-plan' && stats.subscriptionTier === 'Premium' 
                  ? 'bg-amber-400 text-white' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {m?.badge}
              </span>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${m?.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${m?.iconColor}`} size={18} />
              </div>
              {isHero && stats.streak > 0 && (
                <div className="animation-streak-bounce">
                  <span className="text-3xl">🔥</span>
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{m?.label}</p>
            <div className="flex items-end gap-1.5">
              <span className={`font-extrabold tabular-nums text-foreground ${isHero ? 'text-4xl' : 'text-2xl'}`}>
                {m?.value}
              </span>
              {m?.unit && <span className="text-sm text-muted-foreground mb-1">{m?.unit}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {TrendIcon && (
                <TrendIcon className={`w-3.5 h-3.5 ${m?.trend === 'up' ? 'text-success' : 'text-danger'}`} />
              )}
              <p className={`text-xs font-medium ${m?.trend === 'up' ? 'text-success' : m?.trend === 'down' ? 'text-danger' : 'text-muted-foreground'}`}>
                {m?.change}
              </p>
            </div>
            {m?.id === 'metric-plan' && stats.subscriptionTier === 'Free' && (
              <a href="/pricing" className="mt-2 inline-flex text-xs font-bold text-primary hover:underline">
                Upgrade now →
              </a>
            )}
            {m?.id === 'metric-plan' && stats.subscriptionTier === 'Premium' && (
              <div className="mt-2 inline-flex text-xs font-bold text-amber-600">
                ✨ Unlimited access
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}