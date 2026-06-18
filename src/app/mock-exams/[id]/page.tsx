'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, FileQuestion, Award, Layers } from 'lucide-react';

interface Question {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
}

export default function TakeMockExamPage() {
    const { id } = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [instructions, setInstructions] = useState(true);
    const [userLevel, setUserLevel] = useState('');
    const [userSection, setUserSection] = useState('');
    const [userSubject, setUserSubject] = useState('');
    const supabase = createClient();

    useEffect(() => {
        checkUserSelection();
        fetchExam();
    }, [id]);

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

    const fetchExam = async () => {
        const { data: examData } = await supabase
            .from('mock_exams')
            .select('*')
            .eq('id', id)
            .single();
        
        setExam(examData);
        setTimeLeft(examData?.duration * 60 || 7200);
        
        const { data: questionsData } = await supabase
            .from('mock_exam_questions')
            .select('*')
            .eq('exam_id', id)
            .order('order_num');
        
        setQuestions(questionsData || []);
    };

    useEffect(() => {
        if (timeLeft <= 0 || submitting || !exam || instructions) return;
        
        if (timeLeft === 60 && !showWarning) {
            setShowWarning(true);
        }
        
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, submitting, exam, instructions, showWarning]);

    useEffect(() => {
        if (timeLeft === 0 && !submitting && exam && !instructions) {
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
        
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score += 1;
            }
        });
        
        const totalPossible = questions.length;
        const percentage = Math.round((score / totalPossible) * 100);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('user_mock_attempts')
                .insert({
                    user_id: user.id,
                    exam_id: id,
                    score: score,
                    percentage: percentage,
                    answers: answers,
                    time_spent: (exam.duration * 60) - timeLeft,
                    completed_at: new Date().toISOString()
                });
        }
        
        router.push(`/mock-exams/results?score=${percentage}&examId=${id}`);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!exam || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (instructions) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {userLevel} • {userSection}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
                            <p className="text-gray-600 mb-4">{exam.subject} ({exam.subject_code})</p>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Clock className="w-5 h-5 text-primary" />
                                <span>Duration: {exam.duration} minutes</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <FileQuestion className="w-5 h-5 text-primary" />
                                <span>Questions: {questions.length}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Award className="w-5 h-5 text-primary" />
                                <span>Passing Score: {exam.passing_score}%</span>
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold mb-2">📋 Instructions:</h3>
                            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                <li>Read each question carefully</li>
                                <li>Select the best answer from the options</li>
                                <li>You can navigate between questions using the Next/Previous buttons</li>
                                <li>The exam will auto-submit when time runs out</li>
                                <li>Don't refresh the page during the exam</li>
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/student-dashboard/mock-exams')}
                                className="flex-1 py-3 border rounded-lg font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setInstructions(false)}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90"
                            >
                                Start Exam Now
                            </button>
                        </div>
                    </div>
                </div>
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
                {showWarning && timeLeft <= 60 && timeLeft > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-700">Less than 1 minute remaining! Submit your answers quickly.</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {userLevel} • {userSection}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold">{exam.title}</h1>
                            <p className="text-gray-500 text-sm">{exam.subject} ({exam.subject_code})</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Time Left</p>
                            <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                                {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>
                    
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
                                {submitting ? 'Submitting...' : 'Submit Exam'}
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