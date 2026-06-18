'use client';
import { useState, useRef } from 'react';
import { Send, Sparkles, Mic, Loader2 } from 'lucide-react';

export default function QuickQuestion() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const handleSubmit = async () => {
        if (!question.trim()) return;
        
        setLoading(true);
        setShowAnswer(false);
        setAnswer('');

        try {
            const res = await fetch('/api/ai-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: question,
                    subject: 'General'
                })
            });
            const data = await res.json();
            setAnswer(data.answer || "I'm here to help! Could you rephrase your question?");
            setShowAnswer(true);
        } catch (error) {
            setAnswer("Sorry, I'm having trouble responding right now. Please try again.");
            setShowAnswer(true);
        } finally {
            setLoading(false);
            setQuestion('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">💡 Have a Question?</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get instant explanations from Scarlify Twin</p>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={loading}
                />
                <button 
                    onClick={handleSubmit}
                    disabled={loading || !question.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>

            {showAnswer && answer && (
                <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Scarlify Twin</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{answer}</p>
                    <button
                        onClick={() => setShowAnswer(false)}
                        className="mt-2 text-xs text-gray-400 hover:text-primary transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                <p className="text-xs text-gray-400 w-full">Suggested questions:</p>
                <button
                    onClick={() => setQuestion("Why am I struggling with this topic?")}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Why am I struggling?
                </button>
                <button
                    onClick={() => setQuestion("How can I improve my grade?")}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    How to improve my grade?
                </button>
                <button
                    onClick={() => setQuestion("What should I focus on today?")}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    What to focus on today?
                </button>
            </div>
        </div>
    );
}