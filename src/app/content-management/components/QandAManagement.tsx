// src/app/admin/tabs/QandAManagement.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    Search, MessageCircle, CheckCircle, Clock, XCircle, 
    Reply, Trash2, RefreshCw, Loader2, Send, User, Calendar,
    Plus, X, AlertCircle
} from 'lucide-react';

// Define the type for questions
interface Question {
    id: string;
    user_id: string;
    question: string;
    answer?: string;
    status: 'pending' | 'answered' | 'closed';
    created_at: string;
    updated_at: string;
    user_email?: string;
    user_name?: string;
}

export default function QandAManagement() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [replyText, setReplyText] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replying, setReplying] = useState(false);
    
    // Create Question States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newQuestionError, setNewQuestionError] = useState('');
    const [creating, setCreating] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('qa_questions')
                .select(`
                    *,
                    profiles!user_id (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const formattedData = data?.map(item => ({
                ...item,
                user_email: item.profiles?.email,
                user_name: item.profiles?.full_name || 'Anonymous'
            })) || [];
            
            setQuestions(formattedData as Question[]);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async () => {
        if (!newQuestion.trim()) {
            setNewQuestionError('Please enter a question');
            return;
        }

        setCreating(true);
        setNewQuestionError('');

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setNewQuestionError('You must be logged in to ask a question');
                setCreating(false);
                return;
            }

            const { error } = await supabase
                .from('qa_questions')
                .insert({
                    user_id: user.id,
                    question: newQuestion.trim(),
                    status: 'pending'
                });

            if (error) throw error;

            setNewQuestion('');
            setShowCreateModal(false);
            fetchQuestions();
            alert('Question created successfully!');
        } catch (error) {
            console.error('Error creating question:', error);
            setNewQuestionError('Failed to create question. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selectedQuestion) return;

        setReplying(true);
        try {
            const { error } = await supabase
                .from('qa_questions')
                .update({
                    answer: replyText,
                    status: 'answered',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedQuestion.id);

            if (error) throw error;

            setReplyText('');
            setShowReplyModal(false);
            setSelectedQuestion(null);
            fetchQuestions();
            alert('Reply sent successfully!');
        } catch (error) {
            console.error('Error replying:', error);
            alert('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const handleStatusChange = async (questionId: string, newStatus: 'pending' | 'answered' | 'closed') => {
        try {
            const { error } = await supabase
                .from('qa_questions')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', questionId);

            if (error) throw error;
            fetchQuestions();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const { error } = await supabase
                .from('qa_questions')
                .delete()
                .eq('id', questionId);

            if (error) throw error;
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
            case 'answered':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Answered</span>;
            case 'closed':
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Closed</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400">{status}</span>;
        }
    };

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch = q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             q.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             q.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             q.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || q.status === filter;
        return matchesSearch && matchesFilter;
    });

    const pendingCount = questions.filter(q => q.status === 'pending').length;
    const answeredCount = questions.filter(q => q.status === 'answered').length;

    return (
        <div className="p-6 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Q&A Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage student questions and answers
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ask Question
                    </button>
                    <button 
                        onClick={fetchQuestions}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-900/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900/30">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Answered</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{answeredCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 border border-gray-200 dark:border-gray-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by question, answer, or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="all">All Questions</option>
                    <option value="pending">Pending</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* Questions List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No questions found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuestions.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                            {q.user_name || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {q.user_email || 'No email'}
                                        </span>
                                        {getStatusBadge(q.status)}
                                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 break-words">
                                        {q.question}
                                    </h3>
                                    
                                    {q.answer && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2 border border-blue-100 dark:border-blue-800">
                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                <Reply className="w-3 h-3" />
                                                Reply:
                                            </p>
                                            <p className="text-gray-700 dark:text-gray-300 mt-1">{q.answer}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {new Date(q.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedQuestion(q);
                                            setReplyText(q.answer || '');
                                            setShowReplyModal(true);
                                        }}
                                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <Reply className="w-3 h-3" />
                                        Reply
                                    </button>
                                    
                                    <select
                                        value={q.status}
                                        onChange={(e) => handleStatusChange(q.id, e.target.value as any)}
                                        className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="answered">Answered</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Question Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                                Ask a Question
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewQuestion('');
                                    setNewQuestionError('');
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {newQuestionError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{newQuestionError}</p>
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Question
                                </label>
                                <textarea
                                    value={newQuestion}
                                    onChange={(e) => {
                                        setNewQuestion(e.target.value);
                                        setNewQuestionError('');
                                    }}
                                    rows={6}
                                    placeholder="What would you like to ask? Be specific so we can give you the best answer..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCreateQuestion}
                                    disabled={creating || !newQuestion.trim()}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                >
                                    {creating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Submit Question
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewQuestion('');
                                        setNewQuestionError('');
                                    }}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {showReplyModal && selectedQuestion && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reply to Question</h3>
                            <button
                                onClick={() => {
                                    setShowReplyModal(false);
                                    setSelectedQuestion(null);
                                    setReplyText('');
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Question:</p>
                                <p className="text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedQuestion.question}</p>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">From:</p>
                                <p className="text-gray-900 dark:text-white">{selectedQuestion.user_name || 'Anonymous'} ({selectedQuestion.user_email || 'No email'})</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your Reply
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={5}
                                    placeholder="Write your answer here..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleReply}
                                    disabled={replying || !replyText.trim()}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                >
                                    {replying ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Send Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReplyModal(false);
                                        setSelectedQuestion(null);
                                        setReplyText('');
                                    }}
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}