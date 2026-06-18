'use client';
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', minutes: 45, questions: 12 },
  { day: 'Tue', minutes: 62, questions: 18 },
  { day: 'Wed', minutes: 30, questions: 8 },
  { day: 'Thu', minutes: 78, questions: 24 },
  { day: 'Fri', minutes: 55, questions: 16 },
  { day: 'Sat', minutes: 90, questions: 31 },
  { day: 'Sun', minutes: 40, questions: 10 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 card-shadow">
        <p className="text-sm font-bold text-foreground mb-1.5">{label}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{payload[0]?.value} min</span> studied
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-accent">{payload[1]?.value} questions</span> answered
        </p>
      </div>
    );
  }
  return null;
};

export default function StudyActivityChartInner() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 card-shadow h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-foreground">Study Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 7 days — minutes studied per day</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Study time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Questions</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="minutes" stroke="var(--primary)" strokeWidth={2} fill="url(#colorMinutes)" dot={false} />
          <Area type="monotone" dataKey="questions" stroke="var(--accent)" strokeWidth={2} fill="url(#colorQuestions)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}