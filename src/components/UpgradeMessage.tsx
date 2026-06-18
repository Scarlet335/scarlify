'use client';
import { useState, useEffect } from 'react';
import { Crown, Sparkles, Heart, X } from 'lucide-react';

const upgradeMessages = [
    {
        id: 1,
        title: "💪 Your Success Story Starts Here",
        message: "Every great achievement starts with a small decision. Today, that decision could be upgrading to Premium. You've already come so far. Let's go all the way together. Your GCE success story is waiting to be written.",
        icon: "🌟",
        buttonText: "Invest in Your Future →"
    },
    {
        id: 2,
        title: "❤️ We Believe in You",
        message: "We see your determination. We see your effort. You deserve every tool we have to help you succeed. Premium isn't just about unlocking features — it's about unlocking YOUR potential. Take the leap. We believe in you.",
        icon: "💚",
        buttonText: "Unlock Your Potential →"
    },
    {
        id: 3,
        title: "🚀 Your Dreams Are Worth It",
        message: "You've used your free questions. Now it's time to unlock your full potential. Upgrade to Premium — because your dreams are worth it. Your future self will thank you.",
        icon: "⭐",
        buttonText: "Upgrade Now →"
    },
    {
        id: 4,
        title: "💯 Invest in Yourself",
        message: "Your education is the greatest investment you'll ever make. Every CFA you invest today returns as confidence, knowledge, and better exam results tomorrow. You've got this. Let us help you win.",
        icon: "🎓",
        buttonText: "Start Your Premium Journey →"
    }
];

export default function UpgradeMessage({ onUpgrade, onDismiss, location }: { 
    onUpgrade: () => void; 
    onDismiss?: () => void;
    location?: string;
}) {
    const [message, setMessage] = useState(upgradeMessages[0]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * upgradeMessages.length);
        setMessage(upgradeMessages[randomIndex]);
    }, [location]);

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
                <div className="text-4xl">{message.icon}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                            <Crown className="w-5 h-5" />
                            {message.title}
                        </h3>
                        {onDismiss && (
                            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {message.message}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onUpgrade}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            {message.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}