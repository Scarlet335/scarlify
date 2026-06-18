// src/components/WelcomePremiumModal.tsx

'use client';
import { Crown, CheckCircle, X } from 'lucide-react';

interface WelcomePremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
}

export default function WelcomePremiumModal({ 
    isOpen, 
    onClose, 
    userName = 'Student' 
}: WelcomePremiumModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8 max-w-md w-full text-center border-2 border-green-300 dark:border-green-700 shadow-2xl relative animate-fade-in">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Crown Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Crown className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3">
                    🎉 Welcome to Premium, {userName}! 🎉
                </h2>

                {/* Message */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Thank you for trusting us with your GCE journey. Your premium features are now activated!
                </p>

                {/* Features List */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 text-left">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
                        You now have unlimited access to:
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            All past questions (2005-2024)
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            Unlimited AI tutor questions
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            Download certificates
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            Offline study mode
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            Full mock exams
                        </li>
                    </ul>
                </div>

                {/* Footer Message */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    We're honored to be part of your success story. Let's ace those exams together! 💚
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all hover:scale-105"
                >
                    Start Learning →
                </button>
            </div>
        </div>
    );
}