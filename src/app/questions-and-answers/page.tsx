'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Plus, Search, Clock, Award, MessageCircle, TrendingUp } from 'lucide-react';

interface Question {
    id: string;
    title: string;
    content: string;
    subject: string;
    subject_code: string;
    level: string;
    answers_count: number;
    views_count: number;
    upvotes_count: number;
    has_accepted_answer: boolean;
    tags: string[];
    created_at: string;
}

export default function QAPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [subjects, setSubjects] = useState<string[]>([]);
    const supabase = createClient();

    useEffect(() => {
        fetchQuestions();
        fetchSubjects();
    }, [sortBy, selectedSubject]);

    const fetchQuestions = async () => {
        setLoading(true);
        
        let query = supabase
            .from('qa_questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (selectedSubject) {
            query = query.eq('subject', selectedSubject);
        }

        if (searchTerm) {
            query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
        }

        if (sortBy === 'latest') {
            query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'popular') {
            query = query.order('answers_count', { ascending: false });
        } else if (sortBy === 'trending') {
            query = query.order('upvotes_count', { ascending: false });
        } else if (sortBy === 'unanswered') {
            query = query.eq('answers_count', 0);
        }

        const { data } = await query;
        console.log('Fetched questions:', data?.length);
        setQuestions(data || []);
        setLoading(false);
    };

    const fetchSubjects = async () => {
        const { data } = await supabase
            .from('qa_questions')
            .select('subject')
            .not('subject', 'is', null);
        
        const uniqueSubjects = [...new Set(data?.map(q => q.subject).filter(Boolean))];
        setSubjects(uniqueSubjects as string[]);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchQuestions();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const sortOptions = [
        { id: 'latest', label: 'Latest', icon: Clock },
        { id: 'popular', label: 'Most Answers', icon: MessageCircle },
        { id: 'trending', label: 'Most Votes', icon: TrendingUp },
        { id: 'unanswered', label: 'Unanswered', icon: Award },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">❓ Questions & Answers</h1>
                            <p className="text-white/80">Ask questions, get answers, and help fellow students</p>
                        </div>
                        <Link
                            href="/questions-and-answers/ask"
                            className="bg-white text-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ask Question
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </form>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    
                    {/* Sort Options */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        {sortOptions.map((option) => {
                            const Icon = option.icon;
                            const isActive = sortBy === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                        isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Found {questions.length} questions
                </p>

                {/* Questions List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No questions found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {searchTerm ? 'Try adjusting your search' : 'Be the first to ask a question!'}
                        </p>
                        {!searchTerm && (
                            <Link
                                href="/questions-and-answers/ask"
                                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" />
                                Ask Your First Question
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <Link href={`/questions-and-answers/${question.id}`} key={question.id}>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                            {question.subject} ({question.subject_code})
                                        </span>
                                        <span className="text-xs text-gray-500">{question.level}</span>
                                        {question.has_accepted_answer && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Solved</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                                        {question.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                        {question.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" /> {question.answers_count}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatDate(question.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}