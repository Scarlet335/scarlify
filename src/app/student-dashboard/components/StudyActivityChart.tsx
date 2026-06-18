'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const StudyActivityChartInner = dynamic(() => import('./StudyActivityChartInner'), { ssr: false });

export default function StudyActivityChart() {
  return <StudyActivityChartInner />;
}