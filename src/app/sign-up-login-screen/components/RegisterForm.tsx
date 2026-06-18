'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  level: 'O Level' | 'A Level' | '';
  stream: 'Science' | 'Arts' | 'Commercial' | 'Technical' | '';
  terms: boolean;
}

const streams = ['Science', 'Arts', 'Commercial', 'Technical'];
const levels = ['O Level', 'A Level'];

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            gce_level: data.level,
            stream: data.stream,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        setSuccess(true);
        toast.success('Account created! Check your email for confirmation.');
        
        // Auto switch to login after 3 seconds
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Account Created!</h3>
        <p className="text-muted-foreground text-sm mt-2 text-center">
          Please check your email for the confirmation link.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-muted-foreground text-sm mt-1">Start your GCE prep journey — free forever</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Full name</label>
        <input
          type="text"
          placeholder="e.g. Amina Nkemdirim"
          className="input-field"
          {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
        />
        {errors.fullName && <p className="text-danger text-xs mt-1.5">{errors.fullName.message}</p>}
      </div>

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

      {/* Level + Stream row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">GCE Level</label>
          <select
            className="input-field"
            {...register('level', { required: 'Select your level', validate: (v) => v !== '' || 'Select your level' })}
          >
            <option value="">Select level</option>
            {levels.map((l) => (
              <option key={`level-${l}`} value={l}>{l}</option>
            ))}
          </select>
          {errors.level && <p className="text-danger text-xs mt-1.5">{errors.level.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Stream</label>
          <select
            className="input-field"
            {...register('stream', { required: 'Select your stream', validate: (v) => v !== '' || 'Select your stream' })}
          >
            <option value="">Select stream</option>
            {streams.map((s) => (
              <option key={`stream-${s}`} value={s}>{s}</option>
            ))}
          </select>
          {errors.stream && <p className="text-danger text-xs mt-1.5">{errors.stream.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
        <p className="text-xs text-muted-foreground mb-1.5">Minimum 8 characters with a number</p>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            className="input-field pr-11"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: { value: /(?=.*[0-9])/, message: 'Must include at least one number' },
            })}
          />
          <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle password">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            className="input-field pr-11"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
          <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle confirm password">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-danger text-xs mt-1.5">{errors.confirmPassword.message}</p>}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded accent-primary mt-0.5 shrink-0" {...register('terms', { required: 'You must accept the terms' })} />
        <span className="text-sm text-muted-foreground">
          I agree to the{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-primary font-semibold cursor-pointer hover:underline">Privacy Policy</span>
        </span>
      </label>
      {errors.terms && <p className="text-danger text-xs -mt-2">{errors.terms.message}</p>}

      <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 h-11">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          'Create Free Account'
        )}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}