import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import AnimationProvider from '@/components/AnimationProvider';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb', // ✅ ADD THIS
};

export const metadata: Metadata = {
  title: 'Scarlify — GCE Exam Prep for Cameroon Students',
  description: 'Scarlify helps Cameroonian O and A Level students ace GCE exams with past questions, AI tutoring, lessons, and adaptive quizzes.',
  manifest: '/manifest.json', // ✅ ADD THIS
  icons: {
    icon: [
      { url: '/assets/images/favicon-1778806178846.ico', type: 'image/x-icon' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }, // ✅ ADD THIS
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }, // ✅ ADD THIS
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }, // ✅ ADD THIS
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Scarlify', // ✅ ADD THIS
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        {/* ✅ ADD THIS LINK FOR MANIFEST */}
        <link rel="manifest" href="/manifest.json" />
        {/* ✅ ADD THIS FOR APPLE TOUCH ICON */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={plusJakartaSans.className}>
        <ThemeProvider>
          <AnimationProvider>
            {children}
          </AnimationProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fscarlify2518back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}