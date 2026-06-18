'use client';
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import PlanCards from './PlanCards';
import AuthBrandPanel from './AuthBrandPanel';

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left brand panel */}
      <AuthBrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4 sm:px-8 lg:px-12 overflow-y-auto">
        {/* Logo mobile */}
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-extrabold text-xl text-foreground tracking-tight">Scarlify</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-muted rounded-2xl p-1 mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                tab === 'login' ? 'bg-card text-primary card-shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                tab === 'register' ? 'bg-card text-primary card-shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setTab('login')} />
          )}

          {/* Plan cards shown on register */}
          {tab === 'register' && (
            <div className="mt-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                Choose your plan after signup
              </p>
              <PlanCards />
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Need help?</span>
            <a
              href="https://wa.me/237670000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}