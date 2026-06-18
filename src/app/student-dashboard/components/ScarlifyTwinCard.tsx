'use client';

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
    return (
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-6 border border-primary/20 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✨</span>
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">Scarlify Twin</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Your Personal Academic Coach</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{examCountdown}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Days to exam</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{readinessScore}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Readiness</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{targetGrade}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className={`text-2xl font-bold ${readinessScore >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {predictedGrade}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Predicted</p>
                </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border-l-4 border-primary">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">💡 {dailyMessage}</p>
            </div>
        </div>
    );
}