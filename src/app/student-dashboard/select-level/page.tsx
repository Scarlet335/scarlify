'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { GraduationCap, BookOpen, Trophy, ArrowRight } from 'lucide-react';

export default function SelectLevelPage() {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Student');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    getUserName();
  }, []);

  const getUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
      setUserName(name);
    }
  };

  const selectLevel = async (level: string) => {
    setLoading(true);
    
    // Save selected level to localStorage and profile
    localStorage.setItem('student_level', level);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ selected_level: level })
        .eq('id', user.id);
    }
    
    // Navigate to section selection
    router.push('/student-dashboard/select-section');
  };

  const levels = [
    {
      id: 'O-Level',
      title: 'O-Level',
      description: 'Ordinary Level (Forms 1-5)',
      icon: GraduationCap,
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      id: 'A-Level',
      title: 'A-Level',
      description: 'Advanced Level (Lower/Upper Sixth)',
      icon: Trophy,
      color: 'from-purple-600 to-purple-800',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Welcome to Scarlify</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Hello, {userName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            Select your examination level to personalize your learning experience
          </p>
        </div>

        {/* Level Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {levels.map((level) => {
            const Icon = level.icon;
            return (
              <button
                key={level.id}
                onClick={() => selectLevel(level.id)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-2xl border-2 ${level.borderColor} ${level.bgColor} p-6 text-left transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-r ${level.color} items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {level.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-3 h-3 bg-primary rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
          <p className="text-xs text-gray-400 mt-3">Step 1 of 3: Select Level</p>
        </div>
      </div>
    </div>
  );
}