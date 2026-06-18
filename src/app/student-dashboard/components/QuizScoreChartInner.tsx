'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { subject: 'Maths', score: 72 },
  { subject: 'Physics', score: 58 },
  { subject: 'Chemistry', score: 81 },
  { subject: 'Biology', score: 65 },
  { subject: 'English', score: 88 },
  { subject: 'French', score: 44 },
];

const getColor = (score: number) => {
  if (score >= 75) return 'var(--success)';
  if (score >= 55) return 'var(--accent)';
  return 'var(--danger)';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2.5 card-shadow">
        <p className="text-xs font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Score: <span className="font-bold text-foreground">{payload[0]?.value}%</span></p>
      </div>
    );
  }
  return null;
};

export default function QuizScoreChartInner() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">Quiz Scores by Subject</h3>
        <p className="text-xs text-muted-foreground mt-0.5">This month&apos;s average per subject</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-score-${index}`} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-muted-foreground">≥75%</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /><span className="text-xs text-muted-foreground">55–74%</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-danger" /><span className="text-xs text-muted-foreground">Below 55%</span></div>
      </div>
    </div>
  );
}