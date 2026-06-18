'use client';
import { useEffect, useState } from 'react';
import { BookOpen, Video, FileText, Trash2, Download, Clock, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface OfflineLesson {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string;
  duration: number;
  downloaded_at: string;
}

export default function OfflinePage() {
  const [offlineLessons, setOfflineLessons] = useState<OfflineLesson[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadOfflineLessons();
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const loadOfflineLessons = () => {
    const saved = localStorage.getItem('offline_lessons');
    if (saved) {
      setOfflineLessons(JSON.parse(saved));
    }
  };

  const removeOfflineLesson = (lessonId: string) => {
    const updated = offlineLessons.filter(l => l.id !== lessonId);
    setOfflineLessons(updated);
    localStorage.setItem('offline_lessons', JSON.stringify(updated));
  };

  const clearAllOffline = () => {
    if (confirm('Remove all downloaded lessons?')) {
      setOfflineLessons([]);
      localStorage.removeItem('offline_lessons');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📱 Offline Library</h1>
          <p className="text-gray-500 dark:text-gray-400">Lessons saved for offline viewing</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isOnline ? '● Online' : '● Offline Mode'}
        </div>
      </div>

      {offlineLessons.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Offline Lessons</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Save lessons while online to view them here offline.</p>
          <Link href="/student-dashboard/lessons" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
            <BookOpen className="w-4 h-4" /> Browse Lessons
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={clearAllOffline} className="text-sm text-red-600 hover:underline">Clear All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs text-primary">{lesson.subject} • {lesson.topic}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-1">{lesson.title}</h3>
                  </div>
                  <button onClick={() => removeOfflineLesson(lesson.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{lesson.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration} min</span>
                  <span>Saved: {new Date(lesson.downloaded_at).toLocaleDateString()}</span>
                </div>
                <button className="mt-3 w-full bg-primary text-white py-2 rounded-lg text-sm">View Offline</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}