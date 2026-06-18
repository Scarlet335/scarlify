'use client';
import React, { useState, useEffect } from 'react';
import { Check, Zap, Star } from 'lucide-react';
import PaymentModal from '@/app/components/PaymentModal';
import { createClient } from '@/utils/supabase/client';

const plans = [
  {
    id: 'plan-free',
    name: 'Free',
    price: '0 FCFA',
    period: 'forever',
    color: 'border-border',
    badge: null,
    features: [
      'Access all lessons',
      '1 past question per day',
      'Daily quiz limit (5 questions)',
      'Basic AI tutor (3 queries/day)',
      'Community forum',
    ],
    cta: 'Start Free',
    ctaAction: 'free',
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    price: '2,500 FCFA',
    period: '/month',
    color: 'border-accent',
    badge: 'Most Popular',
    features: [
      'Unlimited past questions',
      'All subjects & streams',
      'Unlimited quizzes',
      'AI tutor (unlimited)',
      'Mock exam simulator',
      'Progress analytics',
    ],
    cta: 'Go Premium',
    ctaAction: 'premium',
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price: '20,000 FCFA',
    period: '/year',
    color: 'border-primary',
    badge: 'Best Value',
    features: [
      'Everything in Premium',
      'Offline access (PDF downloads)',
      'Priority AI tutor',
      'Personal study plan',
      '1-on-1 tutor sessions',
      'Exam countdown coaching',
    ],
    cta: 'Go Pro',
    ctaAction: 'pro',
  },
];

export default function PlanCards() {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const supabase = createClient();

  // Get current user email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    };
    getUser();
  }, [supabase]);

  const handleUpgrade = (planName: string) => {
    if (planName === 'Free') {
      window.location.href = '/student-dashboard';
    } else {
      setSelectedPlan(planName);
      setShowPayment(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {plans?.map((plan) => (
          <div
            key={plan?.id}
            className={`relative bg-card rounded-2xl border-2 ${plan?.color} p-4 card-shadow transition-all hover:card-shadow-hover`}
          >
            {plan?.badge && (
              <span className={`absolute -top-2.5 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${plan?.name === 'Premium' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                {plan?.badge}
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-foreground text-sm">{plan?.name}</p>
                <p className="text-lg font-extrabold text-foreground tabular-nums">
                  {plan?.price}
                  <span className="text-xs font-medium text-muted-foreground ml-1">{plan?.period}</span>
                </p>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${plan?.name === 'Free' ? 'bg-muted' : plan?.name === 'Premium' ? 'gradient-accent' : 'gradient-brand'}`}>
                {plan?.name === 'Free' ? <Star className="w-4 h-4 text-muted-foreground" /> : <Zap className="w-4 h-4 text-white" />}
              </div>
            </div>
            <ul className="space-y-1.5 mb-3">
              {plan?.features?.map((f) => (
                <li key={`${plan?.id}-feat-${f}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mb-2.5">
              💳 Pay via MTN Mobile Money or Orange Money
            </p>
            <button 
              onClick={() => handleUpgrade(plan.name)}
              className={`${
                plan.name === 'Free' 
                  ? 'btn-outline w-full text-sm' 
                  : plan.name === 'Premium'
                  ? 'gradient-accent text-white font-semibold w-full text-sm px-4 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95'
                  : 'btn-primary w-full text-sm'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          window.location.reload();
        }}
        userEmail={userEmail}
      />
    </>
  );
}