import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamCountdownBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary-foreground to-primary/80 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm sm:text-base">GCE June 2026 Exams</p>
          <p className="text-white/80 text-xs sm:text-sm">You have <span className="font-bold text-accent">47 days</span> left — stay consistent with your study plan</p>
        </div>
      </div>
      <div className="relative flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex flex-col items-center bg-white/20 rounded-xl px-4 py-2">
          <span className="text-white font-extrabold text-2xl tabular-nums">47</span>
          <span className="text-white/80 text-xs">days left</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-400/30 border border-amber-300/50 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
          <span className="text-amber-100 text-xs font-semibold">3 topics behind</span>
        </div>
      </div>
    </div>
  );
}