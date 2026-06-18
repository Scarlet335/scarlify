'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const QuizScoreChartInner = dynamic(() => import('./QuizScoreChartInner'), { ssr: false });

export default function QuizScoreChart() {
  return <QuizScoreChartInner />;
}