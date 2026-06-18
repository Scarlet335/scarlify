'use client';
import { Calendar, Target, TrendingUp, Sparkles, Clock, Award } from 'lucide-react';

interface ScarlifyTwinCardProps {
    examCountdown: number;
    readinessScore: number;
    targetGrade: string;
    predictedGrade: string;
    dailyMessage: string;
}

export default function ScarlifyTwinCard({
    examCountdown,
    readinessScore,
    targetGrade,
    predictedGrade,
    dailyMessage
}: ScarlifyTwinCardProps) {
    
    // Determines the color of the readiness score based on percentage
    const getReadinessColor = () => {
        if (readinessScore >= 80) return 'text-green-600 dark:text-green-400';
        if (readinessScore >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    // Determines the background gradient for the card
    const getCardGradient = () => {
        if (readinessScore >= 80) return 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30';
        if (readinessScore >= 60) return 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30';
        return 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30';
    };

    // Compares predicted vs target grade and returns appropriate message
    const getGradeComparison = () => {
        const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
        const predictedIndex = grades.indexOf(predictedGrade);
        const targetIndex = grades.indexOf(targetGrade);
        
        if (predictedIndex <= targetIndex) {
            return { message: 'On track! 🎯', color: 'text-green-600' };
        }
        return { message: 'Needs improvement ⚠️', color: 'text-red-600' };
    };

    const comparison = getGradeComparison();

    return (
        <div className={`bg-gradient-to-r ${getCardGradient()} rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">Scarlify Twin</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your Personal Academic Coach</p>
                </div>
            </div>

            {/* Stats Grid - 4 key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {/* Exam Countdown Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-xs text-gray-500">Days Left</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{examCountdown}</p>
                    <p className="text-xs text-gray-400">until GCE exams</p>
                </div>

                {/* Readiness Score Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="text-xs text-gray-500">Readiness</span>
                    </div>
                    <p className={`text-2xl font-bold ${getReadinessColor()}`}>{readinessScore}%</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div 
                            className={`h-1.5 rounded-full transition-all ${
                                readinessScore >= 80 ? 'bg-green-500' : 
                                readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${readinessScore}%` }}
                        />
                    </div>
                </div>

                {/* Target Grade Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-gray-500">Target</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{targetGrade}</p>
                    <p className="text-xs text-gray-400">Your goal</p>
                </div>

                {/* Predicted Grade Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs text-gray-500">Predicted</span>
                    </div>
                    <p className={`text-2xl font-bold ${comparison.color}`}>{predictedGrade}</p>
                    <p className={`text-xs ${comparison.color}`}>{comparison.message}</p>
                </div>
            </div>

            {/* Daily Message - Personalized AI Coach Message */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border-l-4 border-primary">
                <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">💡 Scarlify Twin Says:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dailyMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}