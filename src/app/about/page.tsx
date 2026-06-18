'use client';

import Link from 'next/link';

import { ArrowRight, BookOpen, Brain, Globe, Heart, Lightbulb, Shield, Star, Target, Users, Zap } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';


// ─── Data ────────────────────────────────────────────────────────────────────

const TEAM = [
{
  name: 'Dr. Ngozi Eze',
  role: 'Co-Founder & CEO',
  bio: 'Former GCE examiner with 12 years in Cameroonian education policy. Built Scarlify to fix the gap she saw every exam season.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17b9a4d88-1774561178174.png",
  alt: 'Dr. Ngozi Eze, co-founder and CEO of Scarlify, a professional African woman',
  badge: '🎓 Education Policy'
},
{
  name: 'Alain Mbarga',
  role: 'Co-Founder & CTO',
  bio: 'Software engineer from Yaoundé. Previously built edtech tools for UNICEF West Africa. Obsessed with offline-first design.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1ee725c40-1763291892935.png",
  alt: 'Alain Mbarga, co-founder and CTO of Scarlify, a young Cameroonian male engineer',
  badge: '💻 Engineering'
},
{
  name: 'Fatou Diallo',
  role: 'Head of Curriculum',
  bio: 'GCE A-Level teacher for 8 years in Douala. Curates every past question and model answer on the platform.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_188d18b31-1763296776079.png",
  alt: 'Fatou Diallo, head of curriculum at Scarlify, an African female educator',
  badge: '📚 Curriculum'
},
{
  name: 'Emmanuel Fon',
  role: 'Head of Product',
  bio: 'UX researcher who spent 6 months interviewing students across all 10 regions before writing a single line of product spec.',
  avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1674f7337-1763292472622.png",
  alt: 'Emmanuel Fon, head of product at Scarlify, a young Cameroonian male professional',
  badge: '🎯 Product'
}];


const VALUES = [
{
  icon: Heart,
  title: 'Student-First, Always',
  desc: 'Every feature decision starts with one question: does this help a student in Bamenda or Buea pass their GCE?',
  color: 'bg-rose-50 border-rose-200 text-rose-600'
},
{
  icon: Globe,
  title: 'Built for Cameroon',
  desc: 'Bilingual content, Mobile Money payments, offline mode for low-connectivity areas — designed for real Cameroonian conditions.',
  color: 'bg-emerald-50 border-emerald-200 text-emerald-600'
},
{
  icon: Shield,
  title: 'Honest & Transparent',
  desc: 'No hidden fees, no dark patterns. We show you exactly what you get before you pay a single franc.',
  color: 'bg-violet-50 border-violet-200 text-violet-600'
},
{
  icon: Lightbulb,
  title: 'Relentlessly Curious',
  desc: 'We keep learning — from students, teachers, and data — so the platform gets smarter every semester.',
  color: 'bg-amber-50 border-amber-200 text-amber-600'
},
{
  icon: Users,
  title: 'Community-Powered',
  desc: 'Scarlify grows through word of mouth. When a student succeeds, they tell their classmates. That\'s our marketing.',
  color: 'bg-sky-50 border-sky-200 text-sky-600'
},
{
  icon: Target,
  title: 'Outcomes Over Vanity',
  desc: 'We measure success in pass rates and grade improvements, not app downloads or social media followers.',
  color: 'bg-orange-50 border-orange-200 text-orange-600'
}];


const MILESTONES = [
{ year: '2021', event: 'Scarlify founded in Yaoundé after the 2020 GCE results showed a 34% failure rate in core sciences.' },
{ year: '2022', event: 'First 500 students onboarded across Yaoundé and Douala. AI tutor prototype launched in beta.' },
{ year: '2023', event: 'Expanded to all 10 regions. Past questions bank reached 1,000+ papers. Mobile Money integration shipped.' },
{ year: '2024', event: '50,000 active students. 98% of surveyed users reported grade improvement after 3 months on the platform.' },
{ year: '2025', event: 'Launched bilingual AI tutor (English + French). Offline mode released. Series A funding secured.' }];


const STATS = [
{ value: '50,000+', label: 'Active Students', icon: Users },
{ value: '10', label: 'Regions Covered', icon: Globe },
{ value: '98%', label: 'Grade Improvement Rate', icon: Star },
{ value: '2,400+', label: 'Past Questions', icon: BookOpen }];


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg text-foreground">Scarlify</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <span className="text-primary font-semibold">About Us</span>
          </div>
          <Link href="/sign-up-login-screen" className="gradient-brand text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </nav>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 blob-primary opacity-60 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" /> Our Story
          </span>
          <h1 className="text-hero-xl font-extrabold text-foreground mb-6 leading-tight">
            We built Scarlify because<br />
            <span className="text-primary">Cameroonian students deserve better.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            In 2020, 34% of GCE candidates failed core science subjects. Not because they weren't smart — but because quality study resources were locked behind expensive tutors and unreliable internet. We decided to fix that.
          </p>
        </div>
      </section>
      {/* Stats bar */}
      <section className="py-10 px-4 border-y border-border bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS?.map((s) => {
            const Icon = s?.icon;
            return (
              <div key={s?.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-foreground tabular-nums">{s?.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s?.label}</p>
              </div>);

          })}
        </div>
      </section>
      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Target className="w-3.5 h-3.5" /> Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-5 leading-tight">
              Make world-class exam prep accessible to every student in Cameroon.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Whether you're in a well-equipped school in Douala or studying by lamplight in a rural village, you deserve the same quality of preparation as any student anywhere in the world.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Scarlify combines AI-powered tutoring, a comprehensive past questions bank, and smart study planning — all optimised for low-bandwidth environments and priced for Cameroonian families.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/sign-up-login-screen" className="btn-primary flex items-center justify-center gap-2">
                Start Learning Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="btn-outline flex items-center justify-center gap-2">
                Talk to Our Team
              </Link>
            </div>
          </div>
          {/* Bento visual */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl overflow-hidden h-48 relative">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_172ce2d88-1766999008901.png"
                alt="Group of African students studying together at a table with books and laptops"
                fill
                className="object-cover" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-xs font-bold text-foreground">50,000+ students learning daily</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-36 relative">
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_14f19b6c2-1765042221339.png"
                alt="African student using a laptop in a classroom setting"
                fill
                className="object-cover" />
              
            </div>
            <div className="rounded-2xl bg-primary/10 border border-primary/20 h-36 flex flex-col items-center justify-center gap-2 p-4">
              <Brain className="w-8 h-8 text-primary" />
              <p className="text-sm font-bold text-foreground text-center">AI Tutor in English & French</p>
            </div>
          </div>
        </div>
      </section>
      {/* Timeline */}
      <section className="py-20 px-4 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" /> Our Journey
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">From a classroom idea to 50,000 students</h2>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />
            <div className="space-y-6">
              {MILESTONES?.map((m, i) =>
              <div key={m?.year} className="flex gap-5 items-start">
                  <div className="relative z-10 w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shrink-0 text-white font-extrabold text-xs">
                    {m?.year}
                  </div>
                  <div className="flex-1 bg-background border border-border rounded-2xl p-4 card-shadow">
                    <p className="text-sm text-foreground leading-relaxed">{m?.event}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Shield className="w-3.5 h-3.5" /> What We Stand For
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">Our values aren't on a poster — they're in the product</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES?.map((v) => {
              const Icon = v?.icon;
              return (
                <div key={v?.title} className={`rounded-2xl border p-5 ${v?.color?.split(' ')?.slice(0, 2)?.join(' ')} card-shadow`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${v?.color?.split(' ')?.slice(0, 2)?.join(' ')}`}>
                    <Icon className={`w-5 h-5 ${v?.color?.split(' ')?.[2]}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{v?.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v?.desc}</p>
                </div>);

            })}
          </div>
        </div>
      </section>
      {/* Team */}
      <section className="py-20 px-4 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Users className="w-3.5 h-3.5" /> The Team
            </span>
            <h2 className="text-3xl font-extrabold text-foreground">Built by people who grew up in this system</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Every member of our core team sat GCE exams, taught in Cameroonian schools, or built technology for African classrooms.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM?.map((member) =>
            <div key={member?.name} className="bg-background border border-border rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all duration-200 group">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-4 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AppImage
                  src={member?.avatar}
                  alt={member?.alt}
                  fill
                  className="object-cover" />
                
                </div>
                <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-1 rounded-full">{member?.badge}</span>
                <h3 className="font-bold text-foreground mt-3 mb-0.5">{member?.name}</h3>
                <p className="text-xs text-primary font-semibold mb-2">{member?.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member?.bio}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border border-border rounded-3xl p-10 card-shadow relative overflow-hidden">
            <div className="absolute inset-0 blob-primary opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-foreground mb-4">Join 50,000 students already winning</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Start for free today. No credit card, no commitment — just better exam results.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/sign-up-login-screen" className="btn-primary flex items-center justify-center gap-2">
                  Start Learning Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="btn-outline flex items-center justify-center gap-2">
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-foreground">Scarlify</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Scarlify. Built with ❤️ for Cameroonian students.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>);

}