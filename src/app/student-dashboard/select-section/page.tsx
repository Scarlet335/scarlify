'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  FlaskConical, Palette, Briefcase, Wrench, Languages, 
  ArrowRight, ArrowLeft, BookOpen 
} from 'lucide-react';

export default function SelectSectionPage() {
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get selected level from localStorage
    const level = localStorage.getItem('student_level');
    if (!level) {
      router.push('/student-dashboard/select-level');
      return;
    }
    setSelectedLevel(level);
  }, []);

  const selectSection = async (section: string) => {
    setLoading(true);
    
    // Save selected section
    localStorage.setItem('student_section', section);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ selected_section: section })
        .eq('id', user.id);
    }
    
    // Navigate to subject selection
    router.push('/student-dashboard/select-subject');
  };

  const sections = [
    {
      id: 'Science',
      title: 'Science',
      description: 'Mathematics, Physics, Chemistry, Biology',
      icon: FlaskConical,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
    },
    {
      id: 'Arts',
      title: 'Arts',
      description: 'English, History, Geography, Literature',
      icon: Palette,
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      subjects: ['English Language', 'History', 'Geography', 'Literature'],
    },
    {
      id: 'Commercial',
      title: 'Commercial',
      description: 'Economics, Accounting, Business Studies',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      subjects: ['Economics', 'Accounting', 'Business Studies'],
    },
    {
      id: 'Technical',
      title: 'Technical',
      description: 'Technical Drawing, Computer Science, Electronics',
      icon: Wrench,
      color: 'from-red-600 to-rose-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      subjects: ['Technical Drawing', 'Computer Science', 'Electronics'],
    },
    {
      id: 'Grammar',
      title: 'Grammar',
      description: 'Languages and Linguistics',
      icon: Languages,
      color: 'from-purple-600 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      subjects: ['English Language', 'French Language'],
    },
  ];

  const goBack = () => {
    router.push('/student-dashboard/select-level');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">{selectedLevel} Level</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Section
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
            Select the section that matches your academic focus
          </p>
        </div>

        {/* Section Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => selectSection(section.id)}
                disabled={loading}
                className={`group relative overflow-hidden rounded-2xl border-2 ${section.borderColor} ${section.bgColor} p-5 text-left transition-all hover:shadow-xl hover:-translate-y-1 disabled:opacity-50`}
              >
                <div className="flex items-start gap-4">
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.subjects.map((subject) => (
                        <span key={subject} className="text-xs px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded-full text-gray-600 dark:text-gray-400">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0 mt-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Level
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="w-3 h-3 bg-primary rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
          <div className="w-24"></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Step 2 of 3: Select Section</p>
      </div>
    </div>
  );
}