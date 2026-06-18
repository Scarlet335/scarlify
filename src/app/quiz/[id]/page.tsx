'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

export default function TakeQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        const { data: quizData } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', id)
            .single();
        
        setQuiz(quizData);
        setTimeLeft(quizData?.time_limit * 60 || 900);
        
        const { data: questionsData } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', id)
            .order('order_num');
        
        setQuestions(questionsData || []);
    };

    useEffect(() => {
        if (timeLeft <= 0 || submitting || !quiz) return;
        
        // Warning when 1 minute left
        if (timeLeft === 60 && !showWarning) {
            setShowWarning(true);
        }
        
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitting, quiz, showWarning]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && !submitting && quiz) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length !== questions.length) {
            alert(`Please answer all ${questions.length} questions before submitting.`);
            return;
        }
        
        setSubmitting(true);
        
        const res = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: id,
                answers: answers,
                totalQuestions: questions.length
            })
        });
        
        const data = await res.json();
        if (data.success) {
            router.push(`/quiz/results?score=${data.percentage}&quizId=${id}`);
        } else {
            alert('Error submitting quiz. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!quiz || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const isFirst = currentIndex === 0;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Timer Warning */}
                {showWarning && timeLeft <= 60 && timeLeft > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-700">Less than 1 minute remaining! Submit your answers quickly.</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{quiz.title}</h1>
                            <p className="text-gray-500 text-sm">{quiz.subject}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Time Left</p>
                            <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Question {currentIndex + 1} of {questions.length}</span>
                            <span>{answeredCount}/{questions.length} answered</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    
                    {/* Question */}
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question_text}</h2>
                        <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map((letter) => {
                                const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                                const text = currentQuestion[optionKey];
                                return (
                                    <label key={letter} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                        answers[currentQuestion.id] === letter 
                                            ? 'border-primary bg-primary/5' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="answer"
                                            value={letter}
                                            checked={answers[currentQuestion.id] === letter}
                                            onChange={() => handleAnswer(currentQuestion.id, letter)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span className="font-semibold min-w-[30px]">{letter}.</span>
                                        <span>{text}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex justify-between gap-3">
                        <button
                            onClick={handlePrevious}
                            disabled={isFirst}
                            className="px-5 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            ← Previous
                        </button>
                        {isLast ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Palette */}
                <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                    <p className="text-sm font-medium mb-2">Question Palette</p>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                    currentIndex === idx
                                        ? 'bg-primary text-white'
                                        : answers[questions[idx].id]
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}