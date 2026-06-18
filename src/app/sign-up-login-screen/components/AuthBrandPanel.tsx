'use client';
import React, { useEffect, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/utils/supabase/client';

const features = [
  { icon: '📚', label: 'Past Questions & Answers', desc: 'All GCE years and sessions, O & A Level' },
  { icon: '🤖', label: 'AI Tutor Assistant', desc: 'Get instant explanations on any topic' },
  { icon: '🎯', label: 'Mock Exams & Quizzes', desc: 'Timed practice for all subjects & streams' },
  { icon: '📈', label: 'Progress Analytics', desc: 'Track your streak, scores, and readiness' }
];

export default function AuthBrandPanel() {
  const [studentCount, setStudentCount] = useState('12,847');
  const supabase = createClient();

  useEffect(() => {
    const fetchStudentCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (count) {
        setStudentCount(count.toLocaleString());
      }
    };
    fetchStudentCount();
  }, [supabase]);

  return (
    <div className="hidden lg:flex lg:w-[52%] xl:w-[48%] gradient-brand flex-col justify-between p-10 xl:p-14 relative overflow-hidden min-h-screen">
      {/* Background blob */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>
      
      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-white font-extrabold text-2xl tracking-tight">Scarlify</span>
      </div>
      
      {/* Hero image */}
      <div className="relative z-10 my-6 rounded-2xl overflow-hidden">
        <AppImage
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1b262b906-1763298673358.png"
          alt="African Black female student studying with books and laptop, smiling confidently"
          width={700}
          height={380}
          className="w-full h-56 xl:h-72 object-cover rounded-2xl"
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent rounded-2xl" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white font-bold text-lg leading-tight">
            Ace your GCE exams with<br />confidence and clarity
          </p>
          <p className="text-white/80 text-sm mt-1">
            Join <span className="font-bold">{studentCount}</span>+ Cameroonian students studying smarter
          </p>
        </div>
      </div>
      
      {/* Features */}
      <div className="relative z-10 space-y-3">
        {features?.map((f) => (
          <div key={`feature-${f?.label}`} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <span className="text-xl mt-0.5">{f?.icon}</span>
            <div>
              <p className="text-white font-semibold text-sm">{f?.label}</p>
              <p className="text-white/70 text-xs mt-0.5">{f?.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom trust */}
      <div className="relative z-10 mt-6 flex items-center gap-4">
        <div className="flex -space-x-2">
          {['photo-1531123897727-8f129e1688ce', 'photo-1607990281513-2c110a25bd8c', 'photo-1556742049-0cfed4f6a45d']?.map((id, i) => (
            <div key={`avatar-${i}`} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
              <AppImage
                src={`https://images.unsplash.com/${id}?w=64&q=80`}
                alt={`African student avatar ${i + 1}`}
                width={32}
                height={32}
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
        <p className="text-white/80 text-xs">
          <span className="text-white font-bold">{studentCount} students</span> already preparing
        </p>
      </div>
    </div>
  );
}