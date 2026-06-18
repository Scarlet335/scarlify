import React from 'react';
import { CheckCircle2, XCircle, BookOpen, FileQuestion, Brain } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const activities = [
  { id: 'act-001', type: 'quiz', result: 'pass', subject: 'Chemistry', detail: 'Organic Chemistry Quiz — 78%', time: '12 min ago', icon: Brain, color: 'text-success', bg: 'bg-green-100' },
  { id: 'act-002', type: 'lesson', result: 'done', subject: 'Mathematics', detail: 'Completed: Quadratic Equations', time: '1h ago', icon: BookOpen, color: 'text-info', bg: 'bg-blue-100' },
  { id: 'act-003', type: 'quiz', result: 'fail', subject: 'French', detail: 'Grammar Quiz — 42% (failed)', time: '2h ago', icon: XCircle, color: 'text-danger', bg: 'bg-red-100' },
  { id: 'act-004', type: 'paper', result: 'done', subject: 'Physics', detail: 'June 2023 Paper 2 — Q1–Q5', time: '1d ago', icon: FileQuestion, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 'act-005', type: 'quiz', result: 'pass', subject: 'English', detail: 'Comprehension Quiz — 91%', time: '1d ago', icon: CheckCircle2, color: 'text-success', bg: 'bg-green-100' },
];

export default function RecentActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
      <h3 className="text-base font-bold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities?.map((act) => {
          const Icon = act?.icon;
          return (
            <div key={act?.id} className="flex items-start gap-3 group">
              <div className={`w-8 h-8 ${act?.bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${act?.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{act?.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{act?.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{act?.time}</span>
            </div>
          );
        })}
      </div>
      <button className="mt-4 w-full text-center text-xs text-primary font-semibold hover:underline">
        View full activity log →
      </button>
    </div>
  );
}