'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, ChevronRight } from 'lucide-react';

const subjects = [
  { id: 'mathematics', name: 'Mathematics', stream: 'Science', level: 'O Level', progress: 72, topics: 18, done: 13, locked: false, color: 'from-blue-500 to-blue-600', emoji: '🔢' },
  { id: 'physics', name: 'Physics', stream: 'Science', level: 'O Level', progress: 45, topics: 15, done: 7, locked: false, color: 'from-purple-500 to-purple-600', emoji: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', stream: 'Science', level: 'O Level', progress: 81, topics: 20, done: 16, locked: false, color: 'from-green-500 to-green-600', emoji: '🧪' },
  { id: 'biology', name: 'Biology', stream: 'Science', level: 'A Level', progress: 60, topics: 22, done: 13, locked: true, color: 'from-emerald-500 to-emerald-600', emoji: '🧬' },
  { id: 'english', name: 'English Language', stream: 'Arts', level: 'O Level', progress: 88, topics: 12, done: 11, locked: false, color: 'from-rose-500 to-rose-600', emoji: '📝' },
  { id: 'french', name: 'French Language', stream: 'Arts', level: 'O Level', progress: 44, topics: 14, done: 6, locked: false, color: 'from-pink-500 to-pink-600', emoji: '🗣️' },
  { id: 'history', name: 'History', stream: 'Arts', level: 'A Level', progress: 33, topics: 16, done: 5, locked: true, color: 'from-amber-500 to-amber-600', emoji: '📜' },
  { id: 'accounting', name: 'Accounting', stream: 'Commercial', level: 'O Level', progress: 55, topics: 18, done: 10, locked: true, color: 'from-teal-500 to-teal-600', emoji: '💼' },
  { id: 'economics', name: 'Economics', stream: 'Commercial', level: 'A Level', progress: 28, topics: 20, done: 6, locked: true, color: 'from-cyan-500 to-cyan-600', emoji: '📊' },
  { id: 'technical-drawing', name: 'Technical Drawing', stream: 'Technical', level: 'O Level', progress: 67, topics: 10, done: 7, locked: true, color: 'from-orange-500 to-orange-600', emoji: '📐' },
  { id: 'computer-science', name: 'Computer Science', stream: 'Technical', level: 'O Level', progress: 90, topics: 14, done: 13, locked: false, color: 'from-violet-500 to-violet-600', emoji: '💻' },
  { id: 'geography', name: 'Geography', stream: 'Arts', level: 'O Level', progress: 52, topics: 13, done: 7, locked: false, color: 'from-lime-500 to-lime-600', emoji: '🌍' },
];

export default function SubjectsPage() {
    const router = useRouter();

    const handleSubjectClick = (subject: typeof subjects[0]) => {
        if (subject.locked) {
            alert(`Upgrade to Premium to unlock ${subject.name}!`);
            return;
        }
        router.push(`/subjects/${subject.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 mb-6 hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <h1 className="text-3xl font-bold mb-2">All Subjects</h1>
                <p className="text-gray-500 mb-6">Browse all GCE subjects and track your progress</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => handleSubjectClick(subject)}
                            className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition-all ${
                                subject.locked ? 'opacity-70' : 'hover:shadow-md hover:border-primary/30'
                            }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center text-xl`}>
                                    {subject.emoji}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold">{subject.name}</h3>
                                            <p className="text-xs text-gray-500">{subject.stream} · {subject.level}</p>
                                        </div>
                                        {subject.locked && <Lock className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{subject.done}/{subject.topics} topics</span>
                                    <span>{subject.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className={`h-2 rounded-full bg-gradient-to-r ${subject.color}`} style={{ width: `${subject.progress}%` }} />
                                </div>
                            </div>
                            {subject.locked && (
                                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Upgrade to unlock
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}