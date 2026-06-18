'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Mic, ImageIcon, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

export default function QuickQuestion() {
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [answer, setAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Voice Assistant
    const voice = useVoiceAssistant({
        onTranscript: (text) => {
            setQuestion(text);
            setTimeout(() => handleSubmit(), 100);
        }
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview('');
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!question.trim() && !selectedImage) return;

        setIsLoading(true);
        setShowAnswer(false);
        setAnswer('');

        let fullQuestion = question;
        
        // If there's an image, extract text from it (optional - can be removed if not needed)
        if (selectedImage) {
            // You can add OCR here if needed, or just send the image URL
            fullQuestion += " [Image attached]";
        }

        try {
            const response = await fetch('/api/ai-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: fullQuestion,
                    subject: 'General'
                })
            });
            const data = await response.json();
            setAnswer(data.answer || "I'm here to help! Could you rephrase your question?");
            setShowAnswer(true);
        } catch (error) {
            console.error('Error:', error);
            setAnswer("Sorry, I'm having trouble responding right now. Please try again.");
            setShowAnswer(true);
        } finally {
            setIsLoading(false);
            setQuestion('');
            removeImage();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">💡 Have a Question?</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get instant explanations from Scarlify Twin</p>
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative mb-3 inline-block">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={voice.isListening ? "Listening..." : "Ask me anything about your studies..."}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        disabled={isLoading}
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    {/* Voice Button */}
                    <button
                        onClick={voice.startListening}
                        className={`p-2 rounded-lg transition-colors ${
                            voice.isListening 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Speak your question"
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    
                    {/* Image Upload Button */}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                    />
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Upload image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Send Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || (!question.trim() && !selectedImage)}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Voice Listening Indicator */}
            {voice.isListening && (
                <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                    🎙️ Listening... Speak your question
                </p>
            )}

            {/* Answer Display */}
            {showAnswer && (
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

            {/* Suggested Questions */}
            {!showAnswer && !isLoading && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <p className="text-xs text-gray-400 w-full mb-1">Suggested questions:</p>
                    <button
                        onClick={() => setQuestion("Why am I struggling with this topic?")}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Why am I struggling?
                    </button>
                    <button
                        onClick={() => setQuestion("How can I improve my grade?")}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        How to improve my grade?
                    </button>
                    <button
                        onClick={() => setQuestion("What should I focus on today?")}
                        className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        What to focus on today?
                    </button>
                </div>
            )}
        </div>
    );
}