'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen, Users, CreditCard, TrendingUp, TrendingDown, AlertTriangle, Upload, Crown, FileQuestion } from 'lucide-react';

interface FullStats {
  totalUsers: number;
  totalQuizzes: number;
  totalQuestions: number;
  premiumUsers: number;
  recentUsers: any[];
  subjectAverages: { subject: string; avgScore: number; studentCount: number }[];
  weeklyGrowth: number;
}

export default function AdminDashboardStats({ onUpload }: { onUpload?: () => void }) {
  const [stats, setStats] = useState<FullStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card dark:bg-gray-800 border-2 border-border dark:border-gray-700 rounded-2xl p-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      id: 'stat-users',
      label: 'Total Students',
      value: stats?.totalUsers.toString() || '0',
      sub: `${stats?.weeklyGrowth || 0} new this week`,
      change: `+${stats?.weeklyGrowth || 0}%`,
      trend: 'up',
      icon: Users,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-success dark:text-green-400',
      border: 'border-border dark:border-gray-700',
      bg: 'bg-card dark:bg-gray-800',
    },
    {
      id: 'stat-premium',
      label: 'Premium Users',
      value: stats?.premiumUsers.toString() || '0',
      sub: `${Math.round(((stats?.premiumUsers || 0) / (stats?.totalUsers || 1)) * 100)}% conversion rate`,
      change: '+12%',
      trend: 'up',
      icon: Crown,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-border dark:border-gray-700',
      bg: 'bg-card dark:bg-gray-800',
    },
    {
      id: 'stat-quizzes',
      label: 'Quizzes Taken',
      value: stats?.totalQuizzes.toString() || '0',
      sub: 'Total completions',
      change: '+47 this week',
      trend: 'up',
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-border dark:border-gray-700',
      bg: 'bg-card dark:bg-gray-800',
    },
    {
      id: 'stat-questions',
      label: 'Past Questions',
      value: stats?.totalQuestions.toString() || '0',
      sub: 'Available for practice',
      change: '+12 added',
      trend: 'up',
      icon: FileQuestion,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-border dark:border-gray-700',
      bg: 'bg-card dark:bg-gray-800',
    },
  ];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Admin Analytics Dashboard</h2>
        {onUpload && (
          <button
            onClick={onUpload}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
          >
            <Upload className="w-4 h-4" />
            Upload Question
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className={`${s.bg} border-2 ${s.border} rounded-2xl p-4 card-shadow transition-all hover:card-shadow-hover`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${s.iconColor}`} size={18} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success dark:text-green-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{s.change}</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground dark:text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-foreground dark:text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Subject Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📚 Subject Performance</h3>
        <div className="space-y-4">
          {stats?.subjectAverages && stats.subjectAverages.length > 0 ? (
            stats.subjectAverages.map((subject) => (
              <div key={subject.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{subject.subject}</span>
                  <span className="text-gray-600 dark:text-gray-400">{subject.avgScore}% ({subject.studentCount} students)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${subject.avgScore}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No quiz data yet</p>
          )}
        </div>
      </div>

      {/* Recent Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">👥 Recent Signups</h3>
        <div className="space-y-3">
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            stats.recentUsers.map((user) => (
              <div key={user.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.subscription_tier === 'Premium' 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {user.subscription_tier || 'Free'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
}