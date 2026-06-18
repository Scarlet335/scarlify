'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Video, FileQuestion, ChevronDown, ChevronUp } from 'lucide-react';

// Sample subject data - replace with database later
const subjectData: Record<string, any> = {
    mathematics: {
        name: 'Mathematics',
        description: 'Algebra, Calculus, Statistics, Trigonometry and more',
        icon: '🔢',
        color: 'from-blue-500 to-blue-700',
        topics: [
            { title: 'Introduction to Algebra', content: '<p>Algebra uses letters to represent unknown numbers. Example: x + 5 = 10, then x = 5</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Solving Equations', content: '<p>To solve an equation, isolate the variable. Example: 2x + 3 = 11 → 2x = 8 → x = 4</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Quadratic Equations', content: '<p>ax² + bx + c = 0. Solve using: x = [-b ± √(b² - 4ac)] / 2a</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    physics: {
        name: 'Physics',
        description: 'Mechanics, Waves, Electricity, Magnetism and more',
        icon: '⚛️',
        color: 'from-purple-500 to-purple-700',
        topics: [
            { title: "Newton's Laws of Motion", content: '<p>1. Law of Inertia<br/>2. F = ma<br/>3. Action-Reaction</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Kinematics', content: '<p>v = u + at<br/>s = ut + ½at²<br/>v² = u² + 2as</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    chemistry: {
        name: 'Chemistry',
        description: 'Atomic structure, Chemical bonding, Reactions and more',
        icon: '🧪',
        color: 'from-green-500 to-green-700',
        topics: [
            { title: 'Atomic Structure', content: '<p>Protons (+), Neutrons (0), Electrons (-)</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Chemical Bonding', content: '<p>Ionic: Transfer of electrons<br/>Covalent: Sharing of electrons</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    biology: {
        name: 'Biology',
        description: 'Cells, Genetics, Human body, Ecology',
        icon: '🧬',
        color: 'from-emerald-500 to-emerald-700',
        topics: [
            { title: 'Cell Structure', content: '<p>Nucleus, Mitochondria, Cell membrane</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Photosynthesis', content: '<p>Plants make food using sunlight, CO2, and water</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    english: {
        name: 'English Language',
        description: 'Grammar, Literature, Comprehension, Essay writing',
        icon: '📝',
        color: 'from-rose-500 to-rose-700',
        topics: [
            { title: 'Parts of Speech', content: '<p>Nouns, Verbs, Adjectives, Adverbs, etc.</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Essay Writing', content: '<p>Introduction, Body, Conclusion structure</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    french: {
        name: 'French Language',
        description: 'Grammar, Vocabulary, Comprehension',
        icon: '🗣️',
        color: 'from-pink-500 to-pink-700',
        topics: [
            { title: 'Basic Grammar', content: '<p>Les verbes, les noms, les adjectifs</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Common Phrases', content: '<p>Bonjour, Merci, S\'il vous plaît</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    geography: {
        name: 'Geography',
        description: 'Physical geography, Human geography, Map reading',
        icon: '🌍',
        color: 'from-lime-500 to-lime-700',
        topics: [
            { title: 'Map Reading', content: '<p>Understanding contours, scales, and symbols</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Climate', content: '<p>Weather patterns, seasons, and climate change</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    },
    'computer-science': {
        name: 'Computer Science',
        description: 'Programming, Algorithms, Data structures',
        icon: '💻',
        color: 'from-violet-500 to-violet-700',
        topics: [
            { title: 'Programming Basics', content: '<p>Variables, loops, conditionals</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { title: 'Algorithms', content: '<p>Step-by-step solutions to problems</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        ]
    }
};

export default function SubjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [subject, setSubject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedTopic, setExpandedTopic] = useState<number | null>(0);

    useEffect(() => {
        if (id && typeof id === 'string') {
            const data = subjectData[id as keyof typeof subjectData];
            if (data) {
                setSubject(data);
            }
            setLoading(false);
        }
    }, [id]);

    const toggleTopic = (index: number) => {
        setExpandedTopic(expandedTopic === index ? null : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <p className="text-gray-500">Subject not found</p>
                <button
                    onClick={() => router.back()}
                    className="text-primary hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className={`bg-gradient-to-r ${subject.color} text-white py-12`}>
                <div className="max-w-5xl mx-auto px-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="text-7xl">{subject.icon}</div>
                        <div>
                            <h1 className="text-3xl font-bold">{subject.name}</h1>
                            <p className="text-white/80 mt-1">{subject.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Topics Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Study Notes & Lessons
                        </h2>
                    </div>
                    
                    {subject.topics.map((topic: any, index: number) => (
                        <div key={index} className="border-b last:border-b-0">
                            <button
                                onClick={() => toggleTopic(index)}
                                className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="font-semibold text-gray-800">{topic.title}</span>
                                </div>
                                {expandedTopic === index ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                            
                            {expandedTopic === index && (
                                <div className="px-5 pb-5">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {/* Video */}
                                        {topic.videoUrl && (
                                            <div className="mb-4">
                                                <div className="aspect-video rounded-lg overflow-hidden">
                                                    <iframe
                                                        src={topic.videoUrl}
                                                        title={topic.title}
                                                        className="w-full h-full"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {/* Notes */}
                                        <div 
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: topic.content }}
                                        />
                                        {/* Practice Button */}
                                        <div className="mt-4 pt-4 border-t">
                                            <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                                                <FileQuestion className="w-4 h-4" />
                                                Take a Quiz on this Topic →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}