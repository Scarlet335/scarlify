'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    const res = await fetch(`/api/quiz/${id}`);
    const data = await res.json();
    setQuiz(data.quiz);
    setQuestions(data.questions || []);
    setTimeLeft(data.quiz?.time_limit * 60 || 900);
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
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
    }
    setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
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
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
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
                  <label key={letter} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
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
              className="px-5 py-2 border rounded-lg disabled:opacity-50"
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
      </div>
    </div>
  );
}