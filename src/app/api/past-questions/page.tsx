'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, ChevronDown, ChevronUp, Download, Edit3, BookOpen, CheckCircle, XCircle } from 'lucide-react';

interface PastQuestion {
    id: string;
    subject: string;
    year: number;
    paper_type: string;
    question_text: string;
    correct_answer: string;
    pdf_url: string;
    created_at: string;
}

export default function PastQuestionsPage() {
    const [questions, setQuestions] = useState<PastQuestion[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<PastQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [mode, setMode] = useState<'practice' | 'revision'>('practice');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
    const [answerResults, setAnswerResults] = useState<Record<string, boolean>>({});
    const supabase = createClient();

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        filterQuestions();
    }, [searchTerm, selectedSubject, selectedYear, questions]);

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('past_questions')
                .select('*')
                .order('year', { ascending: false });
            
            if (error) {
                console.error('Error:', error);
            } else {
                setQuestions(data || []);
                setFilteredQuestions(data || []);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = [...questions];
        if (searchTerm) {
            filtered = filtered.filter(q => 
                q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.subject?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedSubject) {
            filtered = filtered.filter(q => q.subject === selectedSubject);
        }
        if (selectedYear) {
            filtered = filtered.filter(q => q.year === parseInt(selectedYear));
        }
        setFilteredQuestions(filtered);
    };

    const handleCheckAnswer = (questionId: string, userAnswer: string, correctAnswer: string) => {
        if (!userAnswer.trim()) return;
        
        const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        
        setSubmittedQuestions(prev => ({ ...prev, [questionId]: true }));
        setAnswerResults(prev => ({ ...prev, [questionId]: isCorrect }));
        
        // Track attempt in database
        const trackAttempt = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('past_question_attempts')
                    .insert({
                        user_id: user.id,
                        question_id: questionId,
                        is_correct: isCorrect
                    });
            }
        };
        trackAttempt();
    };

    const subjects = [...new Set(questions.map(q => q.subject).filter(Boolean))];
    const years = [...new Set(questions.map(q => q.year).filter(Boolean))].sort((a, b) => b - a);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">📚 Past Questions Center</h1>
                    <p className="text-white/80">Practice real GCE past papers with marking guides</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Mode Selector */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode('practice')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                mode === 'practice'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Edit3 className="w-5 h-5 inline mr-2" />
                            Practice Mode
                            <span className="block text-xs opacity-80">Test yourself first</span>
                        </button>
                        <button
                            onClick={() => setMode('revision')}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                mode === 'revision'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <BookOpen className="w-5 h-5 inline mr-2" />
                            Revision Mode
                            <span className="block text-xs opacity-80">Study with answers visible</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by subject or question..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">All Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {filteredQuestions.map((q) => (
                        <div key={q.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div 
                                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                {q.subject}
                                            </span>
                                            <span className="text-xs text-gray-500">{q.year}</span>
                                            <span className="text-xs text-gray-500">{q.paper_type}</span>
                                        </div>
                                        <p className="text-gray-800 font-medium">{q.question_text}</p>
                                    </div>
                                    {expandedId === q.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {expandedId === q.id && (
                                <div className="border-t p-5 bg-gray-50">
                                    {mode === 'practice' ? (
                                        // Practice Mode
                                        <div>
                                            {!submittedQuestions[q.id] ? (
                                                <div>
                                                    <textarea
                                                        value={userAnswers[q.id] || ''}
                                                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                        placeholder="Type your answer here..."
                                                        className="w-full border rounded-xl p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                                                    />
                                                    <button
                                                        onClick={() => handleCheckAnswer(q.id, userAnswers[q.id] || '', q.correct_answer)}
                                                        className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
                                                    >
                                                        Check Answer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className={`rounded-xl p-4 mb-3 ${answerResults[q.id] ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {answerResults[q.id] ? (
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-600" />
                                                            )}
                                                            <span className={`font-semibold ${answerResults[q.id] ? 'text-green-700' : 'text-red-700'}`}>
                                                                {answerResults[q.id] ? 'Correct!' : 'Incorrect'}
                                                            </span>
                                                        </div>
                                                        {!answerResults[q.id] && (
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-700">Correct Answer:</p>
                                                                <p className="text-gray-700">{q.correct_answer}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedId(null)}
                                                        className="text-primary text-sm hover:underline"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Revision Mode
                                        <div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                                                <h4 className="font-semibold text-green-800 mb-2">✓ Model Answer:</h4>
                                                <p className="text-gray-700">{q.correct_answer}</p>
                                            </div>
                                            {q.pdf_url && (
                                                <a
                                                    href={q.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Full Paper (PDF)
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredQuestions.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <p className="text-gray-500">No past questions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}