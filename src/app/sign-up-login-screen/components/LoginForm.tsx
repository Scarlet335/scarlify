'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

// Optional demo accounts for testing (remove in production)
// const demoAccounts = [
//   { role: 'Student (Free)', email: 'amina.nkemdirim@scarlify.cm', password: 'Student@2025' },
//   { role: 'Student (Premium)', email: 'boris.tchamba@scarlify.cm', password: 'Premium@2025' },
//   { role: 'Admin', email: 'admin@scarlify.cm', password: 'Admin@Scarl2025' },
// ];

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const supabase = createClient();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { remember: false },
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check user role from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (profile?.is_admin) {
          window.location.href = '/content-management';
        } else {
          window.location.href = '/student-dashboard';
        }
      }
    };
    checkUser();
  }, [supabase]);

  // Email/Password login
  const onSubmit = async (data: LoginFormData) => {
    setAuthError('');
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError('Invalid email or password. Please try again or sign up.');
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        toast.success(`Welcome back! Redirecting to your dashboard...`);
        
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', authData.user.id)
          .single();
        
        if (profile?.is_admin) {
          window.location.href = '/content-management';
        } else {
          window.location.href = '/student-dashboard';
        }
      }
    } catch (error) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        setAuthError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (error) {
      setAuthError('Failed to connect to Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    const email = prompt('Enter your email address to reset your password:');
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-muted-foreground text-sm mt-1">Sign in to continue your GCE prep journey</p>
      </div>

      {authError && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
          <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{authError}</p>
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Fields */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          className="input-field"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && <p className="text-danger text-xs mt-1.5">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="input-field pr-11"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-primary" {...register('remember')} />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
        <button 
          type="button" 
          onClick={handleForgotPassword}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-primary font-semibold hover:underline">
          Create one free
        </button>
      </p>
    </form>
  );
}