'use client';
import { useState } from 'react';
import { Award, Zap, Target, Brain, BookOpen, Flame, Crown, Star } from 'lucide-react';

export default function AchievementsPage() {
  const achievements = [
    { id: 1, name: 'First Quiz', description: 'Complete your first quiz', icon: Brain, earned: true, points: 50 },
    { id: 2, name: 'Quiz Master', description: 'Complete 10 quizzes', icon: Award, earned: false, points: 100 },
    { id: 3, name: 'Perfect Score', description: 'Get 100% on any quiz', icon: Star, earned: false, points: 150 },
    { id: 4, name: '7-Day Streak', description: 'Study for 7 days in a row', icon: Flame, earned: true, points: 200 },
    { id: 5, name: 'Lesson Learner', description: 'Complete 5 lessons', icon: BookOpen, earned: true, points: 75 },
    { id: 6, name: 'Past Paper Pro', description: 'Complete 10 past questions', icon: Target, earned: false, points: 100 },
    { id: 7, name: 'Speed Demon', description: 'Finish a quiz in under 5 minutes', icon: Zap, earned: false, points: 80 },
    { id: 8, name: 'Premium Member', description: 'Upgrade to Premium', icon: Crown, earned: false, points: 500 },
  ];

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🏆 Achievements</h1>
          <p className="text-gray-500 dark:text-gray-400">Earn badges and track your progress</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalPoints}</p>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{earnedCount}</p>
          <p className="text-xs text-gray-500">Badges Earned</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
          <Target className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{achievements.length - earnedCount}</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const Icon = ach.icon;
          return (
            <div key={ach.id} className={`rounded-xl p-4 border transition-all ${ach.earned ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ach.earned ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ach.name}</h3>
                  <p className="text-xs text-gray-500">{ach.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{ach.points} XP</p>
                  {ach.earned && <span className="text-xs text-green-600">✓ Earned</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}