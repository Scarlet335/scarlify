'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, Video, FileText, HelpCircle, ChevronRight, 
  CheckCircle, Clock, Play, Download, Brain, Award,
  TrendingUp, Target, Sparkles, ChevronDown, ChevronUp,
  WifiOff, Trash2, GraduationCap, Layers
} from 'lucide-react';
import UpgradeMessage from '@/components/UpgradeMessage';
import PaymentModal from '@/app/components/PaymentModal';

interface Lesson {
  id: string;
  level: string;
  section: string;
  subject: string;
  subject_code: string;
  topic: string;
  title: string;
  description: string;
  video_url: string | null;
  notes_url: string | null;
  pdf_notes: string | null;
  duration: number;
  order_num: number;
  is_premium: boolean;
  completed?: boolean;
}

interface Topic {
  name: string;
  lessons: Lesson[];
  progress: number;
  isExpanded: boolean;
}

interface SubjectData {
  name: string;
  code: string;
  icon: string;
  color: string;
  topics: Topic[];
  overallProgress: number;
  isExpanded: boolean;
}

interface OfflineLesson {
  id: string;
  lesson_id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  video_url: string;
  notes_url: string;
  pdf_notes: string;
  duration: number;
  downloaded_at: string;
}

// Subject icons mapping
const subjectIcons: Record<string, string> = {
  Mathematics: '📐',
  Physics: '⚡',
  Chemistry: '🧪',
  Biology: '🧬',
  English: '📖',
  ICT: '💻',
  History: '📜',
  Geography: '🌍',
  Economics: '💰',
  Accounting: '📊',
  'French Language': '🇫🇷',
  'Technical Drawing': '✏️',
  'Computer Science': '💻',
};

// Subject colors
const subjectColors: Record<string, string> = {
  Mathematics: 'from-blue-600 to-blue-800',
  Physics: 'from-purple-600 to-purple-800',
  Chemistry: 'from-green-600 to-green-800',
  Biology: 'from-emerald-600 to-emerald-800',
  English: 'from-amber-600 to-amber-800',
  ICT: 'from-cyan-600 to-cyan-800',
  History: 'from-orange-600 to-orange-800',
  Geography: 'from-teal-600 to-teal-800',
  Economics: 'from-indigo-600 to-indigo-800',
  Accounting: 'from-rose-600 to-rose-800',
};

export default function LessonsPage() {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [userSubscription, setUserSubscription] = useState('Free');
  const [showPayment, setShowPayment] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [offlineLessons, setOfflineLessons] = useState<Set<string>>(new Set());
  const [downloadingLessons, setDownloadingLessons] = useState<Set<string>>(new Set());
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [downloadedLessonsList, setDownloadedLessonsList] = useState<OfflineLesson[]>([]);
  const [userLevel, setUserLevel] = useState('');
  const [userSection, setUserSection] = useState('');
  const [userSubject, setUserSubject] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUserSelection();
    fetchUserData();
    loadOfflineLessons();
  }, []);

  const checkUserSelection = () => {
    const level = localStorage.getItem('student_level');
    const section = localStorage.getItem('student_section');
    const subject = localStorage.getItem('student_subject');
    
    if (!level || !section || !subject) {
      router.push('/student-dashboard/select-level');
      return;
    }
    
    setUserLevel(level);
    setUserSection(section);
    setUserSubject(subject);
  };

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      setUserSubscription(profile?.subscription_tier || 'Free');
    }
  };

  const fetchCompletedLessons = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);
      
      const completedSet = new Set(data?.map(d => d.lesson_id) || []);
      setCompletedLessons(completedSet);
    }
  };

  const loadOfflineLessons = () => {
    const saved = localStorage.getItem('offline_lessons');
    if (saved) {
      const lessons = JSON.parse(saved);
      setDownloadedLessonsList(lessons);
      const offlineSet = new Set<string>(lessons.map((l: OfflineLesson) => l.lesson_id));
      setOfflineLessons(offlineSet);
    }
  };

  const fetchLessons = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('level', userLevel)
      .eq('section', userSection)
      .eq('subject', userSubject)
      .order('topic', { ascending: true })
      .order('order_num', { ascending: true });

    if (data) {
      // Group lessons by topic
      const topicsMap: Record<string, Topic> = {};
      
      data.forEach((lesson: Lesson) => {
        if (!topicsMap[lesson.topic]) {
          topicsMap[lesson.topic] = {
            name: lesson.topic,
            lessons: [],
            progress: 0,
            isExpanded: false
          };
        }
        topicsMap[lesson.topic].lessons.push({
          ...lesson,
          completed: completedLessons.has(lesson.id)
        });
      });

      // Calculate progress for each topic
      Object.values(topicsMap).forEach(topic => {
        const completedCount = topic.lessons.filter(l => l.completed).length;
        topic.progress = topic.lessons.length > 0 
          ? Math.round((completedCount / topic.lessons.length) * 100)
          : 0;
      });

      // Calculate overall progress
      const totalLessons = data.length;
      const completedCount = data.filter(l => completedLessons.has(l.id)).length;
      const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Create subject data
      const subjectData: SubjectData = {
        name: userSubject,
        code: data[0]?.subject_code || '',
        icon: subjectIcons[userSubject] || '📚',
        color: subjectColors[userSubject] || 'from-primary to-purple-600',
        topics: Object.values(topicsMap),
        overallProgress: overallProgress,
        isExpanded: true
      };

      setSubjects([subjectData]);
    }
    setLoading(false);
    fetchCompletedLessons();
  };

  useEffect(() => {
    if (userLevel && userSection && userSubject) {
      fetchLessons();
    }
  }, [userLevel, userSection, userSubject, completedLessons]);

  const downloadLessonForOffline = async (lesson: Lesson) => {
    setDownloadingLessons(prev => new Set(prev).add(lesson.id));
    
    try {
      const offlineLesson: OfflineLesson = {
        id: crypto.randomUUID(),
        lesson_id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        topic: lesson.topic,
        description: lesson.description || '',
        video_url: lesson.video_url || '',
        notes_url: lesson.notes_url || '',
        pdf_notes: lesson.pdf_notes || '',
        duration: lesson.duration,
        downloaded_at: new Date().toISOString(),
      };
      
      const existing = JSON.parse(localStorage.getItem('offline_lessons') || '[]');
      if (!existing.find((l: OfflineLesson) => l.lesson_id === lesson.id)) {
        existing.push(offlineLesson);
        localStorage.setItem('offline_lessons', JSON.stringify(existing));
        setOfflineLessons(prev => new Set(prev).add(lesson.id));
        setDownloadedLessonsList(existing);
        alert(`✓ "${lesson.title}" saved for offline viewing!`);
      } else {
        alert('This lesson is already saved offline');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download lesson');
    } finally {
      setDownloadingLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lesson.id);
        return newSet;
      });
    }
  };

  const removeOfflineLesson = (lessonId: string) => {
    const updated = downloadedLessonsList.filter(l => l.lesson_id !== lessonId);
    setDownloadedLessonsList(updated);
    localStorage.setItem('offline_lessons', JSON.stringify(updated));
    setOfflineLessons(new Set(updated.map(l => l.lesson_id)));
    alert('Lesson removed from offline library');
  };

  const clearAllOffline = () => {
    if (confirm('Remove all downloaded lessons? This will free up storage space.')) {
      setDownloadedLessonsList([]);
      localStorage.removeItem('offline_lessons');
      setOfflineLessons(new Set());
      alert('Offline library cleared');
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isPremium = userSubscription === 'Premium' || userSubscription === 'Pro';
    const lesson = getLessonById(lessonId);
    
    if (lesson?.is_premium && !isPremium) {
      setShowPayment(true);
      return;
    }

    await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString()
      });

    setCompletedLessons(prev => new Set(prev).add(lessonId));
    
    // Update local state
    setSubjects(prev => prev.map(subject => ({
      ...subject,
      topics: subject.topics.map(topic => ({
        ...topic,
        lessons: topic.lessons.map(lesson => 
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        ),
        progress: topic.lessons.length > 0 
          ? Math.round((topic.lessons.filter(l => l.completed || l.id === lessonId).length / topic.lessons.length) * 100)
          : 0
      })),
      overallProgress: subject.topics.reduce((acc, t) => {
        const total = t.lessons.length;
        const completed = t.lessons.filter(l => l.completed || l.id === lessonId).length;
        return acc + (total > 0 ? completed / total : 0);
      }, 0) / subject.topics.length * 100
    })));

    await fetch('/api/xp/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, amount: 20, reason: 'lesson_completed' })
    });
  };

  const getLessonById = (id: string): Lesson | null => {
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        const lesson = topic.lessons.find(l => l.id === id);
        if (lesson) return lesson;
      }
    }
    return null;
  };

  const toggleTopic = (topicName: string) => {
    setSubjects(prev => prev.map(subject => ({
      ...subject,
      topics: subject.topics.map(topic => 
        topic.name === topicName ? { ...topic, isExpanded: !topic.isExpanded } : topic
      )
    })));
  };

  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const isPremium = userSubscription === 'Premium' || userSubscription === 'Pro';
  const totalOfflineSize = downloadedLessonsList.length * 15;
  const totalOfflineMinutes = downloadedLessonsList.reduce((sum, l) => sum + (l.duration || 30), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (subjects.length === 0 || !subjects[0]?.topics.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Lessons Available</h2>
          <p className="text-gray-500 dark:text-gray-400">
            No lessons found for {userSubject} at {userLevel} {userSection} level.
          </p>
          <button
            onClick={() => router.push('/student-dashboard/select-level')}
            className="mt-4 text-primary hover:underline"
          >
            Change Subject
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{subjects[0]?.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold">{subjects[0]?.name}</h1>
                  <p className="text-white/80 text-sm">{subjects[0]?.code} • {userLevel} • {userSection}</p>
                </div>
              </div>
              <p className="text-white/80">Master each topic with video lessons, notes, and practice activities</p>
            </div>
            <button
              onClick={() => setShowOfflineModal(true)}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Offline Library ({downloadedLessonsList.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Banner */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">Your Progress</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{subjects[0]?.name} • {userLevel} {userSection}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{subjects[0]?.overallProgress}%</p>
                <p className="text-xs text-gray-500">Completion</p>
              </div>
              <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${subjects[0]?.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          {subjects[0]?.topics.map((topic) => (
            <div key={topic.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Topic Header */}
              <button
                onClick={() => toggleTopic(topic.name)}
                className="w-full p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{topic.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{topic.progress}% complete</span>
                    </div>
                  </div>
                </div>
                {topic.isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {/* Lessons */}
              {topic.isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {topic.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h4>
                            {lesson.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                            {offlineLessons.has(lesson.id) && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <WifiOff className="w-3 h-3" /> Offline
                              </span>
                            )}
                            {lesson.is_premium && !isPremium && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Premium</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration} min</span>
                            <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>
                            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Notes</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => downloadLessonForOffline(lesson)}
                            disabled={downloadingLessons.has(lesson.id) || offlineLessons.has(lesson.id)}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <Download className="w-3 h-3" />
                            {downloadingLessons.has(lesson.id) ? 'Saving...' : offlineLessons.has(lesson.id) ? 'Saved' : 'Save Offline'}
                          </button>
                          <button
                            onClick={() => openLesson(lesson)}
                            className="px-4 py-1.5 text-sm border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                          >
                            View Lesson
                          </button>
                          {!lesson.completed && (
                            <button
                              onClick={() => markLessonComplete(lesson.id)}
                              className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Change Subject Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/student-dashboard/select-level')}
            className="text-primary hover:underline text-sm flex items-center gap-1 mx-auto"
          >
            <Layers className="w-4 h-4" />
            Change Subject
          </button>
        </div>
      </div>

      {/* Offline Library Modal */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Download className="w-5 h-5" /> Offline Library
                </h2>
                <p className="text-sm text-gray-500">Lessons saved for offline viewing</p>
              </div>
              <button onClick={() => setShowOfflineModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{downloadedLessonsList.length}</p>
                  <p className="text-xs text-gray-500">Lessons</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalOfflineMinutes}</p>
                  <p className="text-xs text-gray-500">Minutes</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalOfflineSize} MB</p>
                  <p className="text-xs text-gray-500">Storage</p>
                </div>
              </div>

              {downloadedLessonsList.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No offline lessons saved</p>
                  <p className="text-sm text-gray-400">Click "Save Offline" on any lesson to download it</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-3">
                    <button onClick={clearAllOffline} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {downloadedLessonsList.map((lesson) => (
                      <div key={lesson.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-primary">{lesson.subject} • {lesson.topic}</span>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{lesson.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Saved: {new Date(lesson.downloaded_at).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => removeOfflineLesson(lesson.lesson_id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && selectedLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLesson.title}</h2>
                <p className="text-sm text-gray-500">{selectedLesson.subject} • {selectedLesson.topic}</p>
              </div>
              <button onClick={() => setShowLessonModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedLesson.video_url ? (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video src={selectedLesson.video_url} controls className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Play className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-500 ml-3">Video lesson coming soon</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Lesson Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedLesson.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📚 Learning Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(selectedLesson.notes_url || selectedLesson.pdf_notes) && (
                    <a href={selectedLesson.notes_url || selectedLesson.pdf_notes || '#'} target="_blank" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">PDF Notes</p>
                        <p className="text-xs text-gray-400">Download</p>
                      </div>
                    </a>
                  )}
                  <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Practice Quiz</p>
                      <p className="text-xs text-gray-400">Test yourself</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Brain className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Study Coach</p>
                      <p className="text-xs text-gray-400">Ask questions</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Recommended Next Steps
                </h3>
                <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                  <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Take the {selectedLesson.topic} practice quiz</li>
                  <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Review related past questions for {selectedLesson.subject}</li>
                  <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3" /> Try a mock exam on {selectedLesson.subject}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            fetchUserData();
          }}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}