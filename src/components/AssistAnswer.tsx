'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, ThumbsUp, ThumbsDown, MessageCircle, RefreshCw } from 'lucide-react';

interface AssistAnswerProps {
    answer: {
        id: string;
        content: string;
        is_helpful: boolean | null;
        created_at: string;
    };
    questionId: string;
    onRegenerate?: () => void;
}

export default function AssistAnswer({ answer, questionId, onRegenerate }: AssistAnswerProps) {
    const [helpfulFeedback, setHelpfulFeedback] = useState(answer.is_helpful);
    const [regenerating, setRegenerating] = useState(false);
    const supabase = createClient();

    const markHelpful = async (helpful: boolean) => {
        setHelpfulFeedback(helpful);
        
        await supabase
            .from('qa_answers')
            .update({ is_helpful: helpful })
            .eq('id', answer.id);
    };

    const regenerateAnswer = async () => {
        setRegenerating(true);
        
        const response = await fetch('/api/assist/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId })
        });
        
        const data = await response.json();
        if (onRegenerate) onRegenerate();
        setRegenerating(false);
    };

    return (
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Scarlify Assist</p>
                    <p className="text-xs text-gray-500">Answered instantly</p>
                </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{answer.content}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Was this helpful?</span>
                    <button
                        onClick={() => markHelpful(true)}
                        className={`p-1.5 rounded-lg transition-colors ${
                            helpfulFeedback === true 
                                ? 'bg-green-100 text-green-600' 
                                : 'hover:bg-gray-100 text-gray-500'
                        }`}
                    >
                        <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => markHelpful(false)}
                        className={`p-1.5 rounded-lg transition-colors ${
                            helpfulFeedback === false 
                                ? 'bg-red-100 text-red-600' 
                                : 'hover:bg-gray-100 text-gray-500'
                        }`}
                    >
                        <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                </div>
                
                <button
                    onClick={regenerateAnswer}
                    disabled={regenerating}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                    {regenerating ? 'Generating...' : 'Get another explanation'}
                </button>
                
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Need more help? Ask community
                </button>
            </div>
        </div>
    );
}