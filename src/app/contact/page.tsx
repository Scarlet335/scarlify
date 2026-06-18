'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle,
  ChevronRight, Headphones, BookOpen, CreditCard, Shield } from
'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';


interface FormData {
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin' | 'other';
  subject: string;
  category: string;
  message: string;
}

const supportChannels = [
{
  icon: MessageCircle,
  label: 'WhatsApp Support',
  value: '+237 671 834 918',
  description: 'Chat with us directly — fastest response',
  href: 'https://wa.me/237671834918?text=Hello%20Scarlify%20Support%2C%20I%20need%20help%20with...',
  color: 'bg-green-50 border-green-200 text-green-700',
  iconColor: 'text-green-600',
  badge: 'Fastest',
  badgeColor: 'bg-green-100 text-green-700'
},
{
  icon: Mail,
  label: 'Email Support',
  value: 'support.scarlify@gmail.com',
  description: 'For detailed inquiries and account issues',
  href: 'mailto:support.scarlify@gmail.com',
  color: 'bg-primary/5 border-primary/20 text-primary',
  iconColor: 'text-primary',
  badge: '24h reply',
  badgeColor: 'bg-primary/10 text-primary'
},
{
  icon: Phone,
  label: 'Phone / Call',
  value: '+237 671 834 918',
  description: 'Mon–Fri, 8 AM – 6 PM (WAT)',
  href: 'tel:+237671834918',
  color: 'bg-amber-50 border-amber-200 text-amber-700',
  iconColor: 'text-accent',
  badge: 'Business hrs',
  badgeColor: 'bg-amber-100 text-amber-700'
}];


const faqTopics = [
{ icon: CreditCard, label: 'Payments & Subscriptions', href: '#' },
{ icon: BookOpen, label: 'Lessons & Past Papers', href: '#' },
{ icon: Shield, label: 'Account & Security', href: '#' },
{ icon: Headphones, label: 'Technical Support', href: '#' }];


const categories = [
'General Inquiry',
'Payment / Subscription',
'Technical Issue',
'Content Request',
'Account Problem',
'Feedback / Suggestion',
'Other'];


export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    role: 'student',
    subject: '',
    category: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim() || form.message.length < 20) e.message = 'Message must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-extrabold text-lg text-foreground tracking-tight hidden sm:block">Scarlify</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/student-dashboard" className="px-3.5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">Dashboard</Link>
            <Link href="/contact" className="px-3.5 py-2 rounded-xl text-sm font-medium bg-primary/10 text-primary transition-all">Contact</Link>
          </nav>
          <Link href="/" className="gradient-accent text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:opacity-90 transition-opacity hidden sm:flex">
            Get Premium
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #F59E0B 0%, transparent 50%), radial-gradient(circle at 80% 20%, #A78BFA 0%, transparent 40%)' }} />
        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Headphones className="w-3.5 h-3.5" /> We&apos;re here to help
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Get in Touch with<br />
              <span className="text-amber-300">Scarlify Support</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-md">
              Have questions about GCE prep, payments, or your account? Our team is ready to help you succeed.
            </p>
            <a
              href="https://wa.me/237600000000?text=Hello%20Scarlify%20Support%2C%20I%20need%20help%20with..."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-lg">
              
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="w-full md:w-80 lg:w-96 shrink-0">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_19fa6a63f-1778687495341.png"
                alt="African Black student smiling while using laptop for GCE exam preparation on Scarlify platform"
                width={400}
                height={300}
                className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">Support Online</p>
                  <p className="text-xs text-muted-foreground">Avg. response: &lt; 5 min on WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-foreground mb-6">Support Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {supportChannels.map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`group flex flex-col gap-3 p-5 rounded-2xl border card-shadow hover:card-shadow-hover transition-all ${ch.color}`}>
                
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center ${ch.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ch.badgeColor}`}>{ch.badge}</span>
                </div>
                <div>
                  <p className="font-bold text-sm">{ch.label}</p>
                  <p className="text-sm font-semibold mt-0.5">{ch.value}</p>
                  <p className="text-xs opacity-70 mt-1">{ch.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
                  Contact now <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </a>);

          })}
        </div>
      </section>

      {/* Main content: Form + Info */}
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Inquiry Form */}
        <div className="lg:col-span-3 bg-card border border-border rounded-3xl card-shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground mb-1">Send an Inquiry</h2>
          <p className="text-sm text-muted-foreground mb-6">Fill in the form and we&apos;ll get back to you within 24 hours.</p>

          {submitted ?
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Message Sent!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Thank you, <strong>{form.name}</strong>. We&apos;ve received your inquiry and will reply to <strong>{form.email}</strong> within 24 hours.
              </p>
              <button
              onClick={() => {setSubmitted(false);setForm({ name: '', email: '', role: 'student', subject: '', category: 'General Inquiry', message: '' });}}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
              
                Send Another Message
              </button>
            </div> :

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name <span className="text-danger">*</span></label>
                  <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Amina Nkemdirim"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.name ? 'border-danger' : 'border-border'}`} />
                
                  {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address <span className="text-danger">*</span></label>
                  <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.email ? 'border-danger' : 'border-border'}`} />
                
                  {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Role + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">I am a</label>
                  <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                  
                    <option value="student">Student</option>
                    <option value="parent">Parent / Guardian</option>
                    <option value="admin">School Admin</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                  <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                  
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Subject <span className="text-danger">*</span></label>
                <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Brief subject of your inquiry"
                className={`w-full px-4 py-2.5 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${errors.subject ? 'border-danger' : 'border-border'}`} />
              
                {errors.subject && <p className="text-xs text-danger mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Message <span className="text-danger">*</span></label>
                <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Describe your issue or question in detail..."
                className={`w-full px-4 py-2.5 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none ${errors.message ? 'border-danger' : 'border-border'}`} />
              
                <div className="flex items-center justify-between mt-1">
                  {errors.message ? <p className="text-xs text-danger">{errors.message}</p> : <span />}
                  <p className="text-xs text-muted-foreground">{form.message.length} / 1000</p>
                </div>
              </div>

              <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 gradient-brand text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
              
                {loading ?
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> :

              <Send className="w-4 h-4" />
              }
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          }
        </div>

        {/* Right sidebar info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Office info */}
          <div className="bg-card border border-border rounded-3xl card-shadow p-6">
            <h3 className="font-bold text-foreground mb-4">Office Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Location</p>
                  <p className="text-sm text-muted-foreground">Douala, Cameroon</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Support Hours</p>
                  <p className="text-sm text-muted-foreground">Mon – Fri: 8:00 AM – 6:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sat: 9:00 AM – 2:00 PM (WAT)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">WhatsApp (24/7)</p>
                  <p className="text-sm text-muted-foreground">+237 671 834 918</p>
                  <a
                    href="https://wa.me/237671834918?text=Hello%20Scarlify%20Support%2C%20I%20need%20help%20with..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 mt-1 transition-colors">
                    
                    Open WhatsApp <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick help topics */}
          <div className="bg-card border border-border rounded-3xl card-shadow p-6">
            <h3 className="font-bold text-foreground mb-4">Quick Help Topics</h3>
            <div className="space-y-2">
              {faqTopics.map((t) => {
                const Icon = t.icon;
                return (
                  <a
                    key={t.label}
                    href={t.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group">
                    
                    <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{t.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>);

              })}
            </div>
          </div>

          {/* WhatsApp CTA card */}
          <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex flex-col gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm">Prefer instant help?</p>
              <p className="text-xs text-green-700 mt-0.5">Join our WhatsApp community for GCE tips, announcements, and peer support.</p>
            </div>
            <a
              href="https://wa.me/237671834918?text=Hello%20Scarlify%20Support%2C%20I%20need%20help%20with..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
              
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">© 2025 Scarlify. Empowering GCE students across Cameroon.</p>
          <div className="flex items-center gap-4">
            <Link href="/student-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>);

}