'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Lock, Loader2, ImageIcon, X, Camera, Mic, Volume2, VolumeX, Zap } from 'lucide-react';
import UpgradeMessage from '@/components/UpgradeMessage';
import WelcomePremiumModal from '@/components/WelcomePremiumModal';
import PaymentModal from '@/app/components/PaymentModal';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { updateXP } from '@/utils/gamification';

const suggestedQuestions = [
  'Explain Newton\'s 3rd Law with examples',
  'How to balance chemical equations?',
  'Difference between mitosis and meiosis',
];

export default function AiTutorCard() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [queriesLeft, setQueriesLeft] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [checkingQuota, setCheckingQuota] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Voice Assistant
  const voice = useVoiceAssistant({
    onTranscript: (text) => {
      setQuery(text);
      setTimeout(() => handleSend(), 100);
    }
  });

  useEffect(() => {
    fetchQuota();
    getUserEmail();
  }, []);

  const getUserEmail = async () => {
    const supabase = (await import('@/utils/supabase/client')).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
    }
  };

  const fetchQuota = async () => {
    try {
      const supabase = (await import('@/utils/supabase/client')).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
          setQueriesLeft(Math.max(0, 6 - (count || 0)));
        } else {
          setQueriesLeft(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch quota:', err);
      setQueriesLeft(6);
    } finally {
      setCheckingQuota(false);
    }
  };

  const awardXP = async () => {
    const supabase = (await import('@/utils/supabase/client')).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const earned = 5; // 5 XP per AI query
      setXpEarned(earned);
      await updateXP(user.id, earned, 'ai_query');
      setTimeout(() => setXpEarned(null), 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!query?.trim() && !selectedImage) return;
    
    if (!isPremium && queriesLeft !== null && queriesLeft <= 0) {
      setError('Daily limit reached (6 questions per day). Upgrade to Premium for unlimited AI queries.');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      let finalQuestion = query;
      
      if (selectedImage) {
        const reader = new FileReader();
        const imageData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result);
          reader.readAsDataURL(selectedImage);
        });
        finalQuestion = query || "Please analyze this image and explain what you see.";
      }

      const supabase = (await import('@/utils/supabase/client')).createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: finalQuestion, subject: 'General' })
      });

      const data = await res.json();
      
      if (res.ok) {
        setAnswer(data.answer);
        setQuery('');
        removeImage();
        await fetchQuota();
        await awardXP(); // Award XP for asking a question
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        if (data.limitReached) {
          setQueriesLeft(0);
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isPlaying) {
      voice.stopSpeaking();
      setIsPlaying(false);
    } else if (answer) {
      voice.speak(answer);
      setIsPlaying(true);
      const duration = Math.min(Math.max(answer.length * 80, 3000), 30000);
      setTimeout(() => setIsPlaying(false), duration);
    }
  };

  const handleSuggestedClick = (question: string) => {
    setQuery(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (checkingQuota) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary rounded-2xl border border-primary/20 p-5 card-shadow">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!isPremium && queriesLeft !== null && queriesLeft <= 0) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary rounded-2xl border border-primary/20 p-5 card-shadow">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center ai-glow">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">AI Tutor</p>
            <p className="text-xs text-muted-foreground">0 queries left today</p>
          </div>
          <span className="ml-auto badge-free">Free</span>
        </div>
        <UpgradeMessage 
          onUpgrade={() => setShowPayment(true)}
          onDismiss={() => {}}
          location="ai-tutor"
        />
        {showPayment && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={() => {
              setShowPayment(false);
              setShowWelcome(true);
              fetchQuota();
            }}
            userEmail={userEmail}
          />
        )}
        {showWelcome && (
          <WelcomePremiumModal 
          isOpen={showWelcome}  // ✅ ADD THIS
          onClose={() => setShowWelcome(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary rounded-2xl border border-primary/20 p-5 card-shadow">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center ai-glow">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">AI Tutor</p>
          <p className="text-xs text-muted-foreground">
            {isPremium 
              ? '✨ Premium - Unlimited queries' 
              : `${queriesLeft} ${queriesLeft === 1 ? 'query' : 'queries'} left today`}
          </p>
        </div>
        <span className={`ml-auto ${isPremium ? 'badge-premium' : 'badge-free'}`}>
          {isPremium ? 'Premium' : 'Free'}
        </span>
      </div>

      {/* XP Earned Notification */}
      {xpEarned && (
        <div className="mb-3 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg flex items-center justify-center gap-2 animate-bounce">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">+{xpEarned} XP Earned!</span>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative">
          <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Answer Display */}
      {answer && (
        <div className="mb-3 bg-primary/10 border border-primary/20 rounded-xl p-3 max-h-48 overflow-y-auto">
          <div className="flex justify-between items-start">
            <p className="text-xs font-semibold text-primary mb-1">🤖 AI Tutor says:</p>
            <button onClick={handleSpeak} className="p-1 rounded-lg hover:bg-gray-100 transition-colors" title={isPlaying ? 'Stop' : 'Listen to answer'}>
              {isPlaying ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-600">{error}</p>
          {error.includes('limit') && (
            <a href="/pricing" className="text-xs text-primary font-semibold mt-1 inline-block">
              Upgrade to Premium →
            </a>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-3 bg-primary/10 rounded-xl p-4 text-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">AI is thinking...</p>
        </div>
      )}

      {/* Suggested Questions */}
      {!answer && !loading && !imagePreview && (
        <div className="flex flex-col gap-1.5 mb-3">
          <p className="text-xs text-muted-foreground mb-1">Try asking:</p>
          {suggestedQuestions?.map((q) => (
            <button key={q} onClick={() => handleSuggestedClick(q)} className="text-left text-xs text-primary bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 hover:bg-primary/10 transition-colors line-clamp-2">
              <Sparkles className="w-3 h-3 inline mr-1.5 opacity-70" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e?.target?.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedImage ? "Add a question about this image..." : "Ask any GCE question..."}
          className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={loading}
        />
        
        {/* Voice Input Button */}
        <button
          onClick={voice.startListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            voice.isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:bg-secondary'
          }`}
          title="Speak your question"
        >
          {voice.isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
        </button>
        
        {/* Upload from Gallery Button */}
        <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageUpload} />
        <button onClick={() => imageInputRef.current?.click()} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary" title="Upload image from gallery">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
        </button>
        
        {/* Take Photo with Camera Button */}
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageUpload} />
        <button onClick={() => cameraInputRef.current?.click()} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary" title="Take a photo">
          <Camera className="w-4 h-4 text-muted-foreground" />
        </button>
        
        {/* Send Button */}
        <button onClick={handleSend} disabled={loading || (!query?.trim() && !selectedImage)} className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
      
      {/* Voice status indicator */}
      {voice.isListening && (
        <p className="text-xs text-red-500 mt-2 text-center animate-pulse">🎙️ Listening... Speak your question</p>
      )}
      
      {/* Quota info for free users */}
      {!isPremium && queriesLeft !== null && queriesLeft > 0 && (
        <p className="text-xs text-muted-foreground mt-2 text-center">{queriesLeft} questions left today</p>
      )}
      
      {/* Premium badge text */}
      {isPremium && (
        <p className="text-xs text-primary mt-2 text-center">✨ Premium users have unlimited AI queries</p>
      )}
    </div>
  );
}