'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Search, ChevronDown, Lock, Crown, Zap, Brain, BookOpen, Eye, Download, 
  CheckCircle, XCircle, Sparkles, FileText, Award, GraduationCap, Layers
} from 'lucide-react';
import UpgradeMessage from '@/components/UpgradeMessage';
import WelcomePremiumModal from '@/components/WelcomePremiumModal';
import PaymentModal from '@/app/components/PaymentModal';
import { updateXP } from '@/utils/gamification';

interface PastQuestion {
    id: string;
    subject: string;
    subject_code: string;
    level: string;
    section: string;
    year: number;
    session: string;
    paper_type: string;
    passage: string;
    question_text: string;
    correct_answer: string;
    pdf_url: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    is_premium?: boolean;
}

export default function PastQuestionsPage() {
    const [questions, setQuestions] = useState<PastQuestion[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<PastQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [userSubscription, setUserSubscription] = useState<string>('Free');
    const [viewedQuestionIds, setViewedQuestionIds] = useState<Set<string>>(new Set());
    const [remainingViews, setRemainingViews] = useState<number>(3);
    const [showPayment, setShowPayment] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [xpEarned, setXpEarned] = useState<number | null>(null);
    const [userLevel, setUserLevel] = useState('');
    const [userSection, setUserSection] = useState('');
    const [userSubject, setUserSubject] = useState('');
    const [userSubjectCode, setUserSubjectCode] = useState('');
    
    // State for Practice/Revision Mode
    const [mode, setMode] = useState<'practice' | 'revision'>('practice');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState<string | null>(null);
    const [selectedPaper, setSelectedPaper] = useState<PastQuestion | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkUserSelection();
        fetchUserData();
    }, []);

    const checkUserSelection = () => {
        const level = localStorage.getItem('student_level');
        const section = localStorage.getItem('student_section');
        const subject = localStorage.getItem('student_subject');
        const subjectCode = localStorage.getItem('student_subject_code');
        
        if (!level || !section || !subject) {
            router.push('/student-dashboard/select-level');
            return;
        }
        
        setUserLevel(level);
        setUserSection(section);
        setUserSubject(subject);
        setUserSubjectCode(subjectCode || '');
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
            
            const { data: views } = await supabase
                .from('past_question_views')
                .select('question_id')
                .eq('user_id', user.id);
            
            const viewedSet = new Set(views?.map(v => v.question_id) || []);
            setViewedQuestionIds(viewedSet);
            setRemainingViews(Math.max(0, 3 - viewedSet.size));
        }
    };

    const fetchQuestions = async () => {
        if (!userLevel || !userSection || !userSubject) return;
        
        let query = supabase
            .from('past_questions')
            .select('*')
            .eq('level', userLevel)
            .eq('section', userSection)
            .eq('subject', userSubject)
            .order('year', { ascending: false });

        const { data } = await query;
        
        const questionsWithOptions = (data || []).map(q => ({
            ...q,
            option_a: q.option_a || 'Option A',
            option_b: q.option_b || 'Option B',
            option_c: q.option_c || 'Option C',
            option_d: q.option_d || 'Option D',
        }));
        
        setQuestions(questionsWithOptions);
        setFilteredQuestions(questionsWithOptions);
        setLoading(false);
    };

    useEffect(() => {
        if (userLevel && userSection && userSubject) {
            fetchQuestions();
        }
    }, [userLevel, userSection, userSubject]);

    useEffect(() => {
        filterQuestions();
    }, [searchTerm, selectedYear, selectedSession, questions]);

    const filterQuestions = () => {
        let filtered = [...questions];
        if (searchTerm) {
            filtered = filtered.filter(q => 
                q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedYear) {
            filtered = filtered.filter(q => q.year === parseInt(selectedYear));
        }
        if (selectedSession) {
            filtered = filtered.filter(q => q.session === selectedSession);
        }
        setFilteredQuestions(filtered);
    };

    const awardXP = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const earned = 10;
            setXpEarned(earned);
            await updateXP(user.id, earned, 'past_question_correct');
            setTimeout(() => setXpEarned(null), 3000);
        }
    };

    const handleSubmitPractice = () => {
        let correctCount = 0;
        filteredQuestions.forEach(q => {
            if (userAnswers[q.id] === q.correct_answer) {
                correctCount++;
            }
        });
        const calculatedScore = Math.round((correctCount / filteredQuestions.length) * 100);
        setScore(calculatedScore);
        setShowResults(true);
        if (calculatedScore >= 70) {
            awardXP();
        }
    };

    const resetPractice = () => {
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setShowExplanation(null);
    };

    const handleToggleAnswer = async (questionId: string) => {
        if (expandedId === questionId) {
            setExpandedId(null);
            return;
        }

        if (mode === 'revision') {
            setExpandedId(questionId);
            return;
        }

        const isPremiumUser = userSubscription === 'Premium' || userSubscription === 'Pro';
        
        if (!isPremiumUser) {
            if (!viewedQuestionIds.has(questionId)) {
                const res = await fetch('/api/past-questions/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionId })
                });
                const data = await res.json();
                
                if (!data.allowed) {
                    alert(data.message || 'You have reached your limit of 3 free past questions. Upgrade to Premium for unlimited access.');
                    return;
                }
                
                setViewedQuestionIds(prev => new Set(prev).add(questionId));
                setRemainingViews(prev => prev - 1);
                await awardXP();
            }
        }
        
        setExpandedId(questionId);
    };

    const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);
    const sessions = ['June', 'November'];
    const isPremium = userSubscription === 'Premium' || userSubscription === 'Pro';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center p-8">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Past Questions Available</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        No past questions found for {userSubject} at {userLevel} {userSection} level.
                    </p>
                    <button
                        onClick={() => router.push('/student-dashboard/select-level')}
                        className="mt-4 text-primary hover:underline flex items-center gap-1 mx-auto"
                    >
                        <Layers className="w-4 h-4" />
                        Change Subject
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-8 h-8" />
                            <div>
                                <h1 className="text-3xl font-bold">Past Questions</h1>
                                <p className="text-white/80 text-sm">{userSubject} ({userSubjectCode}) • {userLevel} • {userSection}</p>
                            </div>
                        </div>
                        <p className="text-white/80">Practice with real past papers from 2005 to 2024</p>
                    </div>
                    {!isPremium && remainingViews > 0 && mode === 'practice' && (
                        <div className="mt-4 bg-white/20 rounded-lg p-3 inline-block">
                            <p className="text-sm">✨ Free users can view <strong>{remainingViews} of 3</strong> answers in Practice Mode. <button onClick={() => setShowPayment(true)} className="underline font-semibold">Upgrade to Premium</button> for unlimited access.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* XP Earned Notification */}
                {xpEarned && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg flex items-center justify-center gap-2 animate-bounce">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">+{xpEarned} XP Earned!</span>
                    </div>
                )}

                {/* Change Subject Button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => router.push('/student-dashboard/select-level')}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        <Layers className="w-4 h-4" />
                        Change Subject
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 mb-6 flex gap-2 border border-gray-200 dark:border-gray-700 w-fit">
                    <button
                        onClick={() => { setMode('practice'); resetPractice(); setSelectedPaper(null); }}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            mode === 'practice' 
                                ? 'bg-primary text-white' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <Brain className="w-4 h-4" /> Practice Mode
                    </button>
                    <button
                        onClick={() => { setMode('revision'); resetPractice(); setSelectedPaper(null); }}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            mode === 'revision' 
                                ? 'bg-primary text-white' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" /> Revision Mode
                    </button>
                </div>

                {/* Mode Description */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        {mode === 'practice' 
                            ? '🎯 Practice Mode: Test yourself first. Answers are hidden. Submit to see your score and explanations.'
                            : '📖 Revision Mode: Direct study mode. Questions and answers visible immediately with marking guides and download options. NO limits!'}
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Years</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">All Sessions</option>
                            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Found {filteredQuestions.length} questions</p>

                {/* ===== PRACTICE MODE ===== */}
                {mode === 'practice' && filteredQuestions.length > 0 && !showResults && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="mb-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                            </span>
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }} />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{currentQuestion.subject}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{currentQuestion.year}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{currentQuestion.session}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{currentQuestion.paper_type}</span>
                            </div>

                            {/* Display passage if it exists */}
                            {currentQuestion.passage && (
                                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📖 Read the passage below:</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{currentQuestion.passage}</p>
                                </div>
                            )}
                            
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">{currentQuestion.question_text}</p>
                            
                            <div className="space-y-3 mb-8">
                                {['A', 'B', 'C', 'D'].map(option => (
                                    <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={option}
                                            checked={userAnswers[currentQuestion.id] === option}
                                            onChange={() => setUserAnswers({...userAnswers, [currentQuestion.id]: option})}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            <span className="font-semibold min-w-[30px] inline-block">{option}.</span> 
                                            {currentQuestion[`option_${option.toLowerCase()}` as keyof PastQuestion] || 'Option text'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                                    disabled={currentQuestionIndex === 0}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                                {currentQuestionIndex === filteredQuestions.length - 1 ? (
                                    <button onClick={handleSubmitPractice} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                        Submit All
                                    </button>
                                ) : (
                                    <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== PRACTICE MODE - Results ===== */}
                {mode === 'practice' && showResults && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-8">
                            <div className={`text-5xl font-bold mb-3 ${score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {score}%
                            </div>
                            <div className={`text-lg font-semibold mb-2 ${score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {score >= 70 ? '🎉 Great job! You passed!' : '📚 Keep practicing!'}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                You got {Object.keys(userAnswers).filter(id => userAnswers[id] === filteredQuestions.find(q => q.id === id)?.correct_answer).length} out of {filteredQuestions.length} correct
                            </p>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">📝 Question Review</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {filteredQuestions.map((q, idx) => {
                                const userAnswer = userAnswers[q.id];
                                const isCorrect = userAnswer === q.correct_answer;
                                return (
                                    <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                                        <div className="flex items-start gap-3">
                                            {isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{idx + 1}. {q.question_text}</p>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer || 'Not answered'}</span></p>
                                                    <p className="text-sm text-green-600 dark:text-green-400">✓ Correct answer: {q.correct_answer}</p>
                                                    {!isCorrect && (
                                                        <button onClick={() => setShowExplanation(showExplanation === q.id ? null : q.id)} className="text-sm text-primary flex items-center gap-1 mt-2 hover:underline">
                                                            <Sparkles className="w-3 h-3" /> Get Explanation
                                                        </button>
                                                    )}
                                                    {showExplanation === q.id && (
                                                        <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                                            <p className="text-sm text-purple-800 dark:text-purple-300">
                                                                💡 <strong>Study Coach:</strong> {q.correct_answer} is the correct answer because...
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button onClick={resetPractice} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300">
                                Try Again
                            </button>
                            <button onClick={() => setMode('revision')} className="flex-1 bg-primary text-white rounded-lg py-2">
                                Switch to Revision Mode
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Recommended Next Steps
                            </h4>
                            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                <li>📖 Review weak topics</li>
                                <li>🎯 Take the recommended quiz</li>
                                <li>📝 Try another past paper from a different year</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* ===== REVISION MODE ===== */}
                {mode === 'revision' && (
                    <div className="space-y-4">
                        {filteredQuestions.map((q) => {
                            const isExpanded = expandedId === q.id;
                            return (
                                <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" onClick={() => handleToggleAnswer(q.id)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">{q.subject}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{q.year}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{q.session}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{q.paper_type}</span>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 font-medium">{q.question_text}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50">
                                            <div>
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Model Answer & Marking Guide:
                                                    </h4>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-3">{q.correct_answer}</p>
                                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <h5 className="font-semibold text-sm mb-1">📋 Marking Scheme:</h5>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            • Correct answer: Full marks (5 points)<br />
                                                            • Partial understanding: Partial marks (2-3 points)<br />
                                                            • Key concepts to mention: {q.subject} principles, formulas, and applications
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-3">
                                                    {q.pdf_url && (
                                                        <>
                                                            <a href={q.pdf_url} target="_blank" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
                                                                <Download className="w-4 h-4" /> Download Question Paper
                                                            </a>
                                                            <a href={q.pdf_url?.replace('.pdf', '_marking.pdf')} target="_blank" className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/10">
                                                                <FileText className="w-4 h-4" /> Download Marking Guide
                                                            </a>
                                                        </>
                                                    )}
                                                    <button className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                                                        <Brain className="w-4 h-4" /> Ask Study Coach
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredQuestions.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No past questions found.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => {
                        setShowPayment(false);
                        setShowWelcome(true);
                        fetchUserData();
                        fetchQuestions();
                    }}
                    userEmail={userEmail}
                />
            )}

            {/* Welcome Premium Modal */}
            {showWelcome && (
                <WelcomePremiumModal onClose={() => setShowWelcome(false)} />
            )}
        </div>
    );
}