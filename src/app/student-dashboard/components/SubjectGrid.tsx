'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// All available subjects (master list) - each has stream and level
const allSubjects = [
  // Science Stream - O Level
  { id: 'mathematics', name: 'Mathematics', stream: 'Science', level: 'O Level', topics: 18, color: 'from-blue-500 to-blue-600', emoji: '🔢' },
  { id: 'physics', name: 'Physics', stream: 'Science', level: 'O Level', topics: 15, color: 'from-purple-500 to-purple-600', emoji: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', stream: 'Science', level: 'O Level', topics: 20, color: 'from-green-500 to-green-600', emoji: '🧪' },
  // Science Stream - A Level
  { id: 'biology', name: 'Biology', stream: 'Science', level: 'A Level', topics: 22, color: 'from-emerald-500 to-emerald-600', emoji: '🧬' },
  { id: 'further-maths', name: 'Further Mathematics', stream: 'Science', level: 'A Level', topics: 16, color: 'from-indigo-500 to-indigo-600', emoji: '📐' },
  
  // Arts Stream - O Level
  { id: 'english', name: 'English Language', stream: 'Arts', level: 'O Level', topics: 12, color: 'from-rose-500 to-rose-600', emoji: '📝' },
  { id: 'french', name: 'French Language', stream: 'Arts', level: 'O Level', topics: 14, color: 'from-pink-500 to-pink-600', emoji: '🗣️' },
  { id: 'geography', name: 'Geography', stream: 'Arts', level: 'O Level', topics: 13, color: 'from-lime-500 to-lime-600', emoji: '🌍' },
  { id: 'literature', name: 'Literature in English', stream: 'Arts', level: 'O Level', topics: 11, color: 'from-amber-500 to-amber-600', emoji: '📖' },
  // Arts Stream - A Level
  { id: 'history', name: 'History', stream: 'Arts', level: 'A Level', topics: 16, color: 'from-amber-500 to-amber-600', emoji: '📜' },
  { id: 'economics-arts', name: 'Economics', stream: 'Arts', level: 'A Level', topics: 18, color: 'from-cyan-500 to-cyan-600', emoji: '📊' },
  
  // Commercial Stream - O Level
  { id: 'accounting', name: 'Accounting', stream: 'Commercial', level: 'O Level', topics: 18, color: 'from-teal-500 to-teal-600', emoji: '💼' },
  { id: 'commerce', name: 'Commerce', stream: 'Commercial', level: 'O Level', topics: 14, color: 'from-teal-500 to-teal-600', emoji: '🏪' },
  { id: 'economics', name: 'Economics', stream: 'Commercial', level: 'O Level', topics: 16, color: 'from-cyan-500 to-cyan-600', emoji: '📊' },
  { id: 'business-studies', name: 'Business Studies', stream: 'Commercial', level: 'O Level', topics: 15, color: 'from-teal-500 to-teal-600', emoji: '📈' },
  // Commercial Stream - A Level
  { id: 'economics-a', name: 'Economics', stream: 'Commercial', level: 'A Level', topics: 20, color: 'from-cyan-500 to-cyan-600', emoji: '📊' },
  
  // Technical Stream - O Level
  { id: 'technical-drawing', name: 'Technical Drawing', stream: 'Technical', level: 'O Level', topics: 10, color: 'from-orange-500 to-orange-600', emoji: '📐' },
  { id: 'computer-science', name: 'Computer Science', stream: 'Technical', level: 'O Level', topics: 14, color: 'from-violet-500 to-violet-600', emoji: '💻' },
  // Technical Stream - A Level
  { id: 'electronics', name: 'Electronics', stream: 'Technical', level: 'A Level', topics: 12, color: 'from-orange-500 to-orange-600', emoji: '⚡' },
  { id: 'mechanical', name: 'Mechanical Engineering', stream: 'Technical', level: 'A Level', topics: 12, color: 'from-orange-500 to-orange-600', emoji: '⚙️' },
];

const streams = ['All', 'Science', 'Arts', 'Commercial', 'Technical'];

export default function SubjectGrid() {
  const [activeStream, setActiveStream] = useState('All');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userStream, setUserStream] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile - includes stream and gce_level
      const { data: profile } = await supabase
        .from('profiles')
        .select('gce_level, stream')
        .eq('id', user.id)
        .single();
      
      setUserLevel(profile?.gce_level || null);
      setUserStream(profile?.stream || null);
      
      // Get completed topics for each subject
      const { data: completedLessons } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, lessons(subject)')
        .eq('user_id', user.id);
      
      // Count completed topics per subject
      const completedCount: Record<string, number> = {};
      completedLessons?.forEach((item: any) => {
        const subject = item.lessons?.subject;
        if (subject) {
          completedCount[subject] = (completedCount[subject] || 0) + 1;
        }
      });
      
      // FILTER SUBJECTS BY USER'S STREAM AND LEVEL
      let filteredSubjects = allSubjects;
      
      // Filter by user's stream (Science, Arts, Commercial, Technical)
      if (userStream) {
        filteredSubjects = filteredSubjects.filter(s => s.stream === userStream);
        // Set active stream to user's stream for the filter display
        setActiveStream(userStream);
      }
      
      // Filter by user's level (O Level, A Level)
      if (userLevel) {
        filteredSubjects = filteredSubjects.filter(s => s.level === userLevel);
      }
      
      // Build subjects with real progress - NO LOCKS (all subjects free)
      const subjectsWithProgress = filteredSubjects.map(subject => {
        const done = completedCount[subject.name] || 0;
        const progress = subject.topics > 0 ? Math.round((done / subject.topics) * 100) : 0;
        
        return {
          ...subject,
          done: done,
          progress: progress,
          locked: false,  // ← NO SUBJECTS ARE LOCKED
        };
      });
      
      setSubjects(subjectsWithProgress);
    } else {
      setSubjects([]);
    }
    
    setLoading(false);
  };

  // Filter by the selected stream filter (if user changes it)
  const displayedSubjects = subjects.filter(s => {
    if (activeStream !== 'All' && s.stream !== activeStream) return false;
    return true;
  });

  const handleSubjectClick = (subject: any) => {
    router.push(`/subjects/${subject.id}`);
  };

  const handleViewAll = () => {
    router.push('/subjects');
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // If user has no subjects for their stream/level
  if (subjects.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
        <div className="text-center py-8">
          <p className="text-gray-500">No subjects available for your stream and level.</p>
          <p className="text-sm text-gray-400 mt-2">Please update your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Your Subjects</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {displayedSubjects.length} subjects · {userLevel || 'Level'} · {userStream || 'Stream'}
          </p>
        </div>
        <button 
          onClick={handleViewAll}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Stream filter - shows only streams that have subjects */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
        {streams.filter(s => s === 'All' || subjects.some(sub => sub.stream === s)).map((s) => (
          <button
            key={`stream-filter-${s}`}
            onClick={() => setActiveStream(s)}
            className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
              activeStream === s
                ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      
      {/* Subject cards - NO LOCK ICONS ANYWHERE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {displayedSubjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => handleSubjectClick(subject)}
            className="relative bg-muted/30 border border-border rounded-xl p-3.5 transition-all cursor-pointer hover:border-primary/30 hover:card-shadow"
          >
            <div className="flex items-start gap-2.5 mb-3">
              <div className={`w-9 h-9 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-base shrink-0`}>
                {subject.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{subject.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground">{subject.stream}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className={`text-xs font-medium ${subject.level === 'A Level' ? 'text-primary' : 'text-accent'}`}>{subject.level}</span>
                </div>
              </div>
            </div>
            
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">{subject.done}/{subject.topics} topics</span>
                <span className={`text-xs font-bold tabular-nums ${subject.progress >= 75 ? 'text-success' : subject.progress >= 50 ? 'text-accent' : 'text-danger'}`}>
                  {subject.progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-gradient-to-r ${subject.color} transition-all duration-500`}
                  style={{ width: `${subject.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}