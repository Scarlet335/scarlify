'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Send, Loader2, ImageIcon, FileText, X, Trash2,
  Bot, User, Copy, Volume2, VolumeX, Mic, ChevronLeft, Plus, Camera
} from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

// Types remain the same
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    images?: string[];
    files?: { name: string; url: string }[];
    timestamp: Date;
}

interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: Date;
}

export default function ScarlifyAssistPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "👋 Hi! I'm Scarlify Assist, your study coach! I'm here to help you understand concepts, solve problems, and prepare for your GCE exams. You can type questions, upload images of handwritten work, or even speak to me. What would you like to learn today? 📚",
            timestamp: new Date()
        }
    ]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const router = useRouter();

    // Voice Assistant
    const voice = useVoiceAssistant({
        onTranscript: (text) => {
            setInput(text);
            setTimeout(() => sendMessage(), 100);
        }
    });

    // Mark component as client-side only after mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        checkAuthAndQuota();
        loadConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const checkAuthAndQuota = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/sign-up-login-screen');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const isPremiumUser = profile?.subscription_tier === 'Premium' || profile?.subscription_tier === 'Pro';
        setIsPremium(isPremiumUser);

        if (!isPremiumUser) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { count } = await supabase
                .from('ai_conversations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString());
            setRemainingQuota(Math.max(0, 6 - (count || 0)));
        }
    };

    const loadConversations = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('ai_conversations')
            .select('id, question, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) {
            const convMap = new Map<string, Conversation>();
            data.forEach((item: any) => {
                const date = new Date(item.created_at).toDateString();
                if (!convMap.has(date)) {
                    convMap.set(date, {
                        id: date,
                        title: `Chat ${date}`,
                        lastMessage: item.question.substring(0, 40),
                        updatedAt: new Date(item.created_at)
                    });
                }
            });
            setConversations(Array.from(convMap.values()));
        }
    };

    // Client-side only text extraction functions
    const extractTextFromImage = async (file: File): Promise<string> => {
        // Dynamically import Tesseract only on client
        const Tesseract = (await import('tesseract.js')).default;
        const result = await Tesseract.recognize(file, 'eng', {
            logger: (m) => console.log(m)
        });
        return result.data.text;
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        // Dynamically import pdfjs-dist only on client
        const pdfjsLib = await import('pdfjs-dist');
        // Configure worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(prev => [...prev, ...files]);
    };

    const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(prev => [...prev, ...files]);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const speakMessage = (content: string, messageId: string) => {
        if (isPlaying === messageId) {
            voice.stopSpeaking();
            setIsPlaying(null);
        } else {
            if (isPlaying) voice.stopSpeaking();
            voice.speak(content);
            setIsPlaying(messageId);
            setTimeout(() => setIsPlaying(null), Math.min(content.length * 80, 30000));
        }
    };

    const sendMessage = async () => {
        if (!input.trim() && selectedImages.length === 0 && selectedFiles.length === 0) return;
        
        if (!isPremium && remainingQuota !== null && remainingQuota <= 0) {
            alert('Daily limit reached (6 questions). Upgrade to Premium for unlimited coaching!');
            return;
        }

        setLoading(true);
        
        let extractedText = '';
        for (const img of selectedImages) {
            const text = await extractTextFromImage(img);
            extractedText += `\n[Image content: ${text}]\n`;
        }
        for (const file of selectedFiles) {
            const text = await extractTextFromPDF(file);
            extractedText += `\n[PDF content: ${text}]\n`;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            images: selectedImages.map(img => URL.createObjectURL(img)),
            files: selectedFiles.map(file => ({ name: file.name, url: URL.createObjectURL(file) })),
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setSelectedImages([]);
        setSelectedFiles([]);

        const fullPrompt = input + extractedText;

        try {
            const res = await fetch('/api/ai-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: fullPrompt, 
                    subject: 'General',
                    conversationId: currentConversationId
                })
            });
            const data = await res.json();
            
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer || "I couldn't process that. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            
            if (!isPremium && remainingQuota !== null) {
                setRemainingQuota(prev => prev !== null ? prev - 1 : null);
            }
        } catch (error) {
            console.error('Scarlify Assist error:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied!');
    };

    const startNewChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: "👋 Hi! I'm Scarlify Assist, your study coach! I'm here to help you understand concepts, solve problems, and prepare for your GCE exams. You can type questions, upload images, or speak to me. What would you like to learn today? 📚",
                timestamp: new Date()
            }
        ]);
        setCurrentConversationId(null);
    };

    if (remainingQuota === 0 && !isPremium) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">Daily Limit Reached</h1>
                    <p className="text-gray-600 mb-6">You've used your 6 free coaching questions today.</p>
                    <a href="/pricing" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
                        Upgrade to Premium
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
                <div className="p-4 border-b">
                    <button
                        onClick={startNewChat}
                        className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <p className="text-xs text-gray-400 px-2 mb-2">Recent Chats</p>
                    {conversations.map(conv => (
                        <div key={conv.id} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm truncate">
                            {conv.title}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t text-xs text-gray-400">
                    {isPremium ? '✨ Premium - Unlimited coaching' : `📊 ${remainingQuota} questions left today`}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6 text-primary" />
                            <h1 className="font-bold text-lg">Scarlify Assist</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'}`}>
                            {isPremium ? '✨ Premium Unlimited' : `${remainingQuota} questions left`}
                        </span>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'} rounded-2xl p-3 shadow-sm`}>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                        {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        <span className="text-xs opacity-70">{msg.timestamp.toLocaleTimeString()}</span>
                                    </div>
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => copyToClipboard(msg.content)} className="text-xs opacity-50 hover:opacity-100">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => speakMessage(msg.content, msg.id)} className="text-xs opacity-50 hover:opacity-100">
                                                {isPlaying === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.images && msg.images.length > 0 && (
                                    <div className="mt-2 flex gap-2">
                                        {msg.images.map((img, i) => (
                                            <img key={i} src={img} alt="Uploaded" className="w-20 h-20 object-cover rounded" />
                                        ))}
                                    </div>
                                )}
                                {msg.files && msg.files.length > 0 && (
                                    <div className="mt-2">
                                        {msg.files.map((file, i) => (
                                            <a key={i} href={file.url} download className="text-xs underline block">
                                                📎 {file.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border rounded-2xl p-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                    {(selectedImages.length > 0 || selectedFiles.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {selectedImages.map((img, i) => (
                                <div key={`img-${i}`} className="relative">
                                    <img src={URL.createObjectURL(img)} alt="preview" className="w-16 h-16 object-cover rounded" />
                                    <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {selectedFiles.map((file, i) => (
                                <div key={`file-${i}`} className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                    <button onClick={() => removeFile(i)} className="text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex gap-2 items-end">
                        <div className="flex gap-1">
                            {/* Voice Input Button */}
                            <button
                                onClick={voice.startListening}
                                className={`p-2 rounded-lg transition-colors ${
                                    voice.isListening 
                                        ? 'bg-red-500 text-white animate-pulse' 
                                        : 'hover:bg-gray-100 text-gray-500'
                                }`}
                                title="Speak your question"
                            >
                                {voice.isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                            </button>
                            
                            {/* Gallery Upload */}
                            <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageUpload} />
                            <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-lg hover:bg-gray-100" title="Upload image">
                                <ImageIcon className="w-5 h-5 text-gray-500" />
                            </button>
                            
                            {/* Camera */}
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                className="hidden" 
                                ref={cameraInputRef}
                                onChange={handleCameraUpload}
                            />
                            <button 
                                onClick={() => cameraInputRef.current?.click()} 
                                className="p-2 rounded-lg hover:bg-gray-100" 
                                title="Take a photo"
                            >
                                <Camera className="w-5 h-5 text-gray-500" />
                            </button>
                            
                            {/* PDF Upload */}
                            <input type="file" accept=".pdf" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-gray-100" title="Upload PDF">
                                <FileText className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={voice.isListening ? "Listening..." : "Ask me a question... I'm here to help you learn!"}
                            rows={2}
                            className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                        />
                        
                        <button
                            onClick={sendMessage}
                            disabled={loading || (!input.trim() && selectedImages.length === 0 && selectedFiles.length === 0)}
                            className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    {/* Voice Listening Indicator */}
                    {voice.isListening && (
                        <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                            🎙️ Listening... Speak your question
                        </p>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        {!isPremium && remainingQuota !== null && `${remainingQuota} free questions remaining today. Upgrade for unlimited coaching.`}
                    </p>
                </div>
            </div>
        </div>
    );
}