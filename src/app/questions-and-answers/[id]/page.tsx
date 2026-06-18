'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, MessageCircle, ThumbsUp, Sparkles, RefreshCw, ThumbsDown, Send, CheckCircle, Award } from 'lucide-react';
import Link from 'next/link';

interface Answer {
    id: string;
    content: string;
    upvotes_count: number;
    is_accepted: boolean;
    is_assist: boolean;
    is_helpful: boolean | null;
    created_at: string;
    user_id: string;
}

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
    user_id: string;
}

export default function QuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [questionAuthor, setQuestionAuthor] = useState('');
    const [answerAuthors, setAnswerAuthors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [newAnswer, setNewAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [regeneratingAssist, setRegeneratingAssist] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        getCurrentUser();
        fetchQuestion();
        fetchAnswers();
    }, [params.id]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
    };

    const fetchQuestion = async () => {
        try {
            const { data: questionData, error: questionError } = await supabase
                .from('qa_questions')
                .select('*')
                .eq('id', params.id)
                .single();
            
            if (questionError) throw questionError;
            
            if (questionData) {
                setQuestion(questionData);
                
                // Fetch author name separately
                if (questionData.user_id) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', questionData.user_id)
                        .single();
                    setQuestionAuthor(profileData?.full_name || 'Anonymous');
                }
                
                // Increment view count
                await supabase
                    .from('qa_questions')
                    .update({ views_count: (questionData.views_count || 0) + 1 })
                    .eq('id', params.id);
            }
        } catch (error) {
            console.error('Error fetching question:', error);
        }
    };

    const fetchAnswers = async () => {
        try {
            const { data: answersData, error: answersError } = await supabase
                .from('qa_answers')
                .select('*')
                .eq('question_id', params.id)
                .order('is_assist', { ascending: false })
                .order('is_accepted', { ascending: false })
                .order('upvotes_count', { ascending: false });
            
            if (answersError) throw answersError;
            
            if (answersData) {
                setAnswers(answersData);
                
                // Fetch author names for all answers
                const authorNames: Record<string, string> = {};
                for (const answer of answersData) {
                    if (answer.user_id && !answer.is_assist) {
                        const { data: profileData } = await supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('id', answer.user_id)
                            .single();
                        authorNames[answer.id] = profileData?.full_name || 'Anonymous';
                    }
                }
                setAnswerAuthors(authorNames);
            }
        } catch (error) {
            console.error('Error fetching answers:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!newAnswer.trim()) return;
        
        setSubmitting(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('qa_answers')
            .insert({
                question_id: params.id,
                user_id: user?.id,
                content: newAnswer
            });

        if (!error) {
            setNewAnswer('');
            fetchAnswers();
            
            // Update answer count on question
            await supabase
                .from('qa_questions')
                .update({ answers_count: answers.filter(a => !a.is_assist).length + 1 })
                .eq('id', params.id);
        }
        
        setSubmitting(false);
    };

    const upvoteAnswer = async (answerId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: existing } = await supabase
            .from('qa_answer_upvotes')
            .select('*')
            .eq('answer_id', answerId)
            .eq('user_id', user.id)
            .single();
        
        if (existing) {
            await supabase
                .from('qa_answer_upvotes')
                .delete()
                .eq('answer_id', answerId)
                .eq('user_id', user.id);
            
            await supabase
                .from('qa_answers')
                .update({ upvotes_count: answers.find(a => a.id === answerId)?.upvotes_count! - 1 })
                .eq('id', answerId);
        } else {
            await supabase
                .from('qa_answer_upvotes')
                .insert({ answer_id: answerId, user_id: user.id });
            
            await supabase
                .from('qa_answers')
                .update({ upvotes_count: answers.find(a => a.id === answerId)?.upvotes_count! + 1 })
                .eq('id', answerId);
        }
        
        fetchAnswers();
    };

    const acceptAnswer = async (answerId: string) => {
        if (!confirm('Accept this answer as the solution?')) return;
        
        await supabase
            .from('qa_answers')
            .update({ is_accepted: true })
            .eq('id', answerId);
        
        await supabase
            .from('qa_questions')
            .update({ 
                has_accepted_answer: true,
                is_resolved: true 
            })
            .eq('id', params.id);
        
        fetchAnswers();
        fetchQuestion();
    };

    const markAssistHelpful = async (answerId: string, helpful: boolean) => {
        await supabase
            .from('qa_answers')
            .update({ is_helpful: helpful })
            .eq('id', answerId);
        
        fetchAnswers();
    };

    const regenerateAssistAnswer = async () => {
        setRegeneratingAssist(true);
        
        const assistAnswer = answers.find(a => a.is_assist);
        if (!assistAnswer) return;
        
        await fetch('/api/assist/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: params.id,
                questionTitle: question?.title,
                questionContent: question?.content,
                subject: question?.subject,
                level: question?.level,
            }),
        });
        
        await fetchAnswers();
        setRegeneratingAssist(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    const assistAnswer = answers.find(a => a.is_assist);
    const communityAnswers = answers.filter(a => !a.is_assist);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Question not found</p>
                    <Link href="/questions-and-answers" className="text-primary mt-2 inline-block">Back to Q&A</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Questions
                </button>

                {/* Question Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {question.subject} ({question.subject_code})
                        </span>
                        <span className="text-xs text-gray-500">{question.level}</span>
                        {question.has_accepted_answer && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Solved
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{question.title}</h1>
                    
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">{question.content}</p>
                    
                    {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {question.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" /> {communityAnswers.length} answers
                            </span>
                            <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" /> {question.upvotes_count} votes
                            </span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Asked by {questionAuthor || 'Anonymous'} • {formatDate(question.created_at)}
                        </div>
                    </div>
                </div>

                {/* Scarlify Assist Answer */}
                {assistAnswer && (
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Scarlify Assist</p>
                                    <p className="text-xs text-gray-500">Answered instantly</p>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{assistAnswer.content}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Was this helpful?</span>
                                    <button
                                        onClick={() => markAssistHelpful(assistAnswer.id, true)}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                            assistAnswer.is_helpful === true 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => markAssistHelpful(assistAnswer.id, false)}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                            assistAnswer.is_helpful === false 
                                                ? 'bg-red-100 text-red-600' 
                                                : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                
                                <button
                                    onClick={regenerateAssistAnswer}
                                    disabled={regeneratingAssist}
                                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingAssist ? 'animate-spin' : ''}`} />
                                    {regeneratingAssist ? 'Generating...' : 'Get another explanation'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Community Answers */}
                {communityAnswers.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {communityAnswers.length} Community {communityAnswers.length === 1 ? 'Answer' : 'Answers'}
                        </h2>
                        
                        <div className="space-y-4">
                            {communityAnswers.map((answer) => (
                                <div key={answer.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <button
                                                onClick={() => upvoteAnswer(answer.id)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <ThumbsUp className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm font-semibold my-1">{answer.upvotes_count}</span>
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{answer.content}</p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-400">
                                                    Answered by {answerAuthors[answer.id] || 'Anonymous'} • {formatDate(answer.created_at)}
                                                </div>
                                                <div className="flex gap-2">
                                                    {answer.is_accepted && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Accepted Answer
                                                        </span>
                                                    )}
                                                    {currentUserId === question.user_id && !question.has_accepted_answer && (
                                                        <button
                                                            onClick={() => acceptAnswer(answer.id)}
                                                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                                                        >
                                                            Accept as Answer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Your Answer */}
                {currentUserId && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Answer</h3>
                        <textarea
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={submitAnswer}
                                disabled={submitting || !newAnswer.trim()}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                {submitting ? 'Posting...' : 'Post Answer'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}