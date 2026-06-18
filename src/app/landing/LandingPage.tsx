'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import DarkModeToggle from '@/components/DarkModeToggle';

// ─── Simple CountUp Component (built-in, no external dependency) ────────────

function SimpleCountUp({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'Subjects', href: '#subjects' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Tutor — Always On',
    desc: 'Ask anything about your syllabus. Get step-by-step explanations in English or French, 24/7.',
    color: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800',
    span: 'md:col-span-2',
  },
  {
    icon: '📄',
    title: 'Past Questions Bank',
    desc: 'GCE O/A Level papers from 2005–2024 with model answers and marking schemes.',
    color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    span: '',
  },
  {
    icon: '📊',
    title: 'Progress Analytics',
    desc: 'Visual dashboards track your study streaks, quiz scores, and weak topics.',
    color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    span: '',
  },
  {
    icon: '🎯',
    title: 'Exam Countdown & Planner',
    desc: 'Smart study plans built around your GCE exam dates so you never fall behind.',
    color: 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800',
    span: '',
  },
  {
    icon: '📱',
    title: 'Works Offline',
    desc: 'Download lessons and study without data. Perfect for areas with poor connectivity.',
    color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
    span: '',
  },
  {
    icon: '🏆',
    title: 'Leaderboards & Badges',
    desc: 'Compete with classmates, earn badges, and stay motivated through gamified learning.',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    span: 'md:col-span-2',
  },
];

const SUBJECTS = [
  {
    stream: 'Science',
    color: 'from-violet-600 to-violet-800',
    badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Maths', 'Computer Science'],
    icon: '🔬',
  },
  {
    stream: 'Arts',
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    subjects: ['Literature', 'History', 'Geography', 'Philosophy', 'Religious Studies', 'French'],
    icon: '🎨',
  },
  {
    stream: 'Commercial',
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    subjects: ['Economics', 'Accounting', 'Business Studies', 'Commerce', 'Mathematics', 'French'],
    icon: '💼',
  },
  {
    stream: 'Technical',
    color: 'from-sky-500 to-blue-700',
    badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
    subjects: ['Technical Drawing', 'Mechanics', 'Electricity', 'Building Construction', 'ICT', 'Mathematics'],
    icon: '⚙️',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '0',
    period: '',
    desc: 'Start learning today with no credit card.',
    features: [
      '5 AI tutor questions/day',
      'Access to 3 subjects',
      'Last 3 years past questions',
      'Basic progress tracking',
      'Community forum access',
    ],
    cta: 'Get Started Free',
    highlight: false,
    badge: null,
  },
  {
    name: 'Premium',
    price: '1,000',
    period: '/month',
    desc: 'Everything you need to ace your GCE exams.',
    features: [
      'Unlimited AI tutor questions',
      'All subjects & streams',
      'Full past questions bank (2005–2024)',
      'Detailed analytics & weak-topic alerts',
      'Offline downloads',
      'Priority support',
    ],
    cta: 'Start Premium',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '5,000',
    period: '/year',
    desc: 'Best value — save 33% vs monthly.',
    features: [
      'Everything in Premium',
      'Early access to new features',
      'Personalised study roadmap',
      'Mock exam simulations',
      'Parent progress reports',
      'Dedicated tutor sessions (2/month)',
    ],
    cta: 'Go Pro',
    highlight: false,
    badge: 'Best Value',
  },
];

const TESTIMONIALS = [
  {
    name: 'Amina Nkemdirim',
    role: 'Form 5 Science, Yaoundé',
    quote: 'I went from D to B in Physics in just 6 weeks. The AI tutor explains things better than my teacher honestly.',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png',
    alt: 'Amina, a young Cameroonian female student smiling confidently',
    stars: 5,
  },
  {
    name: 'Boris Tchamba',
    role: 'Upper Sixth Arts, Douala',
    quote: 'The past questions bank is incredible. I practised 10 years of History papers and felt so prepared on exam day.',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_127400d6a-1763296439452.png',
    alt: 'Boris, a young Cameroonian male student in school uniform',
    stars: 5,
  },
  {
    name: 'Fatima Oumarou',
    role: 'Form 4 Commercial, Bamenda',
    quote: 'Scarlify works even with my slow internet. I download lessons at school and study at home without data.',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b262b906-1763298673358.png',
    alt: 'Fatima, a young African female student holding books',
    stars: 5,
  },
  {
    name: 'Emmanuel Fon',
    role: 'Lower Sixth Technical, Buea',
    quote: 'The leaderboard keeps me competitive. I study more now just to stay in the top 10 of my class.',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1cd0356f6-1763296756405.png',
    alt: 'Emmanuel, a young Cameroonian male student smiling',
    stars: 5,
  },
];

const STATS = [
  { value: '50000+', label: 'Active Students' },
  { value: '10 Regions', label: 'Across Cameroon' },
  { value: '98%', label: 'Pass Rate Improvement' },
  { value: '2400+', label: 'Past Questions' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm'
          : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
      } border-b border-border`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center"
          >
            <span className="text-white font-bold text-sm">S</span>
          </motion.div>
          <span className="font-bold text-lg text-foreground">Scarlify</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS?.map((l, i) => (
            <motion.a
              key={l?.label}
              href={l?.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l?.label}
            </motion.a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="/sign-up-login-screen"
            className="px-4 py-2 text-sm font-semibold border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/sign-up-login-screen"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div
            className="w-5 h-0.5 bg-foreground mb-1 transition-all"
            style={{ transform: open ? 'rotate(45deg) translateY(6px)' : '' }}
          />
          <div
            className="w-5 h-0.5 bg-foreground mb-1 transition-all"
            style={{ opacity: open ? 0 : 1 }}
          />
          <div
            className="w-5 h-0.5 bg-foreground transition-all"
            style={{ transform: open ? 'rotate(-45deg) translateY(-6px)' : '' }}
          />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-border px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS?.map((l) => (
            <a
              key={l?.label}
              href={l?.href}
              className="text-sm font-medium text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {l?.label}
            </a>
          ))}
          <DarkModeToggle />
          <Link
            href="/sign-up-login-screen"
            className="text-sm text-center mt-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-xl"
            onClick={() => setOpen(false)}
          >
            Get Started Free
          </Link>
        </div>
      )}
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full filter blur-[80px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full filter blur-[80px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full filter blur-[100px]"
        />
      </div>

      {/* Floating particles */}
      {typeof window !== 'undefined' &&
        [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -50],
              x: [null, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-violet-500 rounded-full"
            />
            Built for Cameroonian GCE Students
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            Study Smarter,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">
              Pass with Confidence
            </span>
          </h1>

          <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
            Scarlify gives every Cameroonian student access to an AI tutor, 20
            years of past questions, and personalised study plans — all in one
            platform.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/sign-up-login-screen"
                className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-violet-600 to-amber-500 text-white rounded-xl hover:opacity-90 transition-opacity inline-block"
              >
                Start Learning Free →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="px-6 py-3 text-base font-semibold bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors inline-block"
              >
                See How It Works
              </a>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> No credit card needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Mobile Money accepted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Works offline
            </span>
          </div>
        </motion.div>

        {/* Right: Animated Image bento */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative grid grid-cols-2 gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="col-span-2 rounded-2xl overflow-hidden h-52 relative"
          >
            <img
              src="https://img.rocket.new/generatedImages/rocket_gen_img_101ba7d6d-1772893813033.png"
              alt="Group of African university students studying together around a laptop, engaged and smiling"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent" />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-lg"
              >
                🔥
              </motion.span>
              <div>
                <p className="text-xs font-bold text-foreground">42-day streak</p>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl overflow-hidden h-44 relative"
          >
            <img
              src="https://img.rocket.new/generatedImages/rocket_gen_img_1b262b906-1763298673358.png"
              alt="Young African female student reading a textbook at a desk, focused and determined"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl overflow-hidden h-44 relative"
          >
            <img
              src="/assets/images/publicimagesstudentsstudent-classroom__2_-1778809352347.webp"
              alt="African high school students in a classroom raising hands to answer questions"
              className="w-full h-full object-cover"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-3 right-3 bg-amber-400 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold"
            >
              AI Tutor ✨
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const parseValue = (val: string) => parseInt(val.replace(/[^0-9]/g, ''));
  const getSuffix = (val: string) =>
    val.includes('+') ? '+' : val.includes('%') ? '%' : '';

  return (
    <section
      ref={ref}
      className="bg-white dark:bg-gray-900 border-y border-border py-10"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS?.map((s, i) => (
          <motion.div
            key={s?.label}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-3xl font-extrabold text-primary mb-1">
              <SimpleCountUp
                end={parseValue(s.value)}
                suffix={getSuffix(s.value)}
              />
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {s?.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} id="features" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Platform Features
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            Everything you need to excel
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Designed specifically for the Cameroonian GCE curriculum — not a
            generic platform adapted for Africa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES?.map((f, i) => (
            <motion.div
              key={f?.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`${f?.span} ${f?.color} border rounded-2xl p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200`}
            >
              <span className="text-3xl">{f?.icon}</span>
              <h3 className="text-lg font-bold text-foreground">{f?.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f?.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiTutorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative order-2 lg:order-1"
        >
          <div className="rounded-3xl overflow-hidden h-80 lg:h-[480px] relative">
            <img
              src="https://img.rocket.new/generatedImages/rocket_gen_img_101ba7d6d-1772893813033.png"
              alt="African student using a laptop for online learning, looking engaged and focused"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-transparent" />
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -right-4 top-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-[220px] border border-border"
          >
            <p className="text-xs text-muted-foreground mb-1">AI Tutor</p>
            <p className="text-sm font-medium text-foreground">
              &quot;Let me explain Newton&apos;s 3rd Law with a real example from your
              past paper...&quot;
            </p>
            <div className="mt-2 flex gap-1">
              <span
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -left-4 bottom-12 bg-amber-400 text-white rounded-2xl shadow-xl p-4"
          >
            <p className="text-2xl font-extrabold">87%</p>
            <p className="text-xs font-medium">Quiz Score ↑12%</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-2"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            AI-Powered Learning
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-6 leading-tight">
            Your personal tutor,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-amber-500">
              available 24/7
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Ask questions in English or French. Get step-by-step explanations
            tailored to the GCE syllabus. The AI tutor learns your weak spots
            and focuses on them.
          </p>

          <ul className="space-y-4 mb-8">
            {[
              'Explains concepts from your exact GCE syllabus',
              'Generates practice questions on demand',
              'Marks your answers and explains mistakes',
              'Supports both Anglophone and Francophone curricula',
            ]?.map((item, idx) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </motion.li>
            ))}
          </ul>

          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Try AI Tutor Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function SubjectsSection() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} id="subjects" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Subject Streams
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            All GCE streams covered
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Science, Arts, Commercial, and Technical — every subject, every
            level, O Level and A Level.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {SUBJECTS?.map((s, i) => (
            <motion.button
              key={s?.stream}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active === i
                  ? `bg-gradient-to-r ${s?.color} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800 border border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              <span>{s?.icon}</span>
              {s?.stream}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-border p-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SUBJECTS?.[active]?.subjects?.map((sub) => (
              <div
                key={sub}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${SUBJECTS?.[active]?.badge} flex items-center gap-2`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {sub}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            + many more subjects available on the platform
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PastQuestionsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 block">
            Past Questions Bank
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-6 leading-tight">
            20 years of GCE papers,{' '}
            <span className="text-amber-500">fully solved</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Access every GCE O Level and A Level past paper from 2005 to 2024
            with detailed model answers and examiner marking schemes.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Papers Available', value: '2,400+' },
              { label: 'Years Covered', value: '2005–2024' },
              { label: 'Subjects', value: '40+' },
              { label: 'Model Answers', value: '100%' },
            ]?.map((stat) => (
              <div
                key={stat?.label}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
              >
                <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {stat?.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat?.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/sign-up-login-screen"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Past Questions →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden h-80 lg:h-[420px]">
            <img
              src="/assets/images/publicimagesstudentsstudent-writing-1778809446245.webp"
              alt="African students in a library reviewing past examination papers and textbooks"
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Physics A Level 2023
              </p>
              <p className="text-xs text-muted-foreground">
                Paper 3 — Model Answer ✓
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} id="pricing" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Pricing
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            Affordable for every student
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Pay with Mobile Money (MTN, Orange). No international card needed.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING?.map((plan, i) => (
            <motion.div
              key={plan?.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                plan?.highlight
                  ? 'bg-gradient-to-br from-violet-600 to-amber-500 text-white shadow-2xl scale-105'
                  : 'bg-white dark:bg-gray-800 border border-border'
              }`}
            >
              {plan?.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full ${
                    plan?.highlight
                      ? 'bg-amber-400 text-white'
                      : 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300'
                  }`}
                >
                  {plan?.badge}
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-1 ${
                    plan?.highlight ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {plan?.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan?.highlight ? 'text-violet-200' : 'text-muted-foreground'
                  }`}
                >
                  {plan?.desc}
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan?.highlight ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {plan?.price === '0' ? 'Free' : `${plan?.price} FCFA`}
                  </span>
                  {plan?.period && (
                    <span
                      className={`text-sm mb-1 ${
                        plan?.highlight ? 'text-violet-200' : 'text-muted-foreground'
                      }`}
                    >
                      {plan?.period}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan?.features?.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`text-sm flex-shrink-0 mt-0.5 ${
                        plan?.highlight ? 'text-amber-300' : 'text-violet-500'
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm ${
                        plan?.highlight ? 'text-violet-100' : 'text-foreground'
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up-login-screen"
                className={`text-center font-semibold py-3 px-6 rounded-xl transition-all duration-150 active:scale-95 ${
                  plan?.highlight
                    ? 'bg-white text-primary hover:bg-violet-50'
                    : 'bg-gradient-to-r from-violet-600 to-amber-500 text-white hover:opacity-90'
                }`}
              >
                {plan?.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          💳 Pay with MTN Mobile Money or Orange Money · Secure &amp; instant activation
        </p>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} id="testimonials" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Student Stories
          </span>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">
            Real results from real students
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Thousands of Cameroonian students have improved their grades with
            Scarlify.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS?.map((t, i) => (
            <motion.div
              key={t?.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-background rounded-2xl border border-border p-6 flex flex-col gap-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: t?.stars })?.map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-foreground text-base leading-relaxed italic">
                &quot;{t?.quote}&quot;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={t?.avatar}
                  alt={t?.alt}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{t?.name}</p>
                  <p className="text-xs text-muted-foreground">{t?.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/assets/images/publicimagesstudentsstudent-graduation-1778809404009.webp"
              alt="African students celebrating academic success, throwing graduation caps in the air"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative py-16 px-8"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Your GCE success story{' '}
              <span className="text-amber-400">starts today</span>
            </h2>
            <p className="text-violet-200 text-lg mb-10 max-w-xl mx-auto">
              Join 50,000+ students across Cameroon who are studying smarter
              with Scarlify. Free to start, no credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/sign-up-login-screen"
                  className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-violet-50 transition-colors text-base inline-block"
                >
                  Create Free Account →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base inline-block"
                >
                  Talk to Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg text-white">Scarlify</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The GCE learning platform built for Cameroonian students.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://facebook.com/scar lify"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition"
              >
                <span>📘</span>
              </a>
              
              <a
                href="https://instagram.com/scar_lify"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition"
              >
                <span>📷</span>
              </a>
              <a
                href="https://wa.me/237671834918"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition"
              >
                <span>💬</span>
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-4 text-gray-300">Platform</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#subjects" className="hover:text-white transition">
                  Subjects
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition">
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-4 text-gray-300">Company</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-4 text-gray-300">Legal</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2 text-gray-300">Contact</p>
              <p className="text-sm">📞 +237 671 834 918</p>
              <p className="text-sm">✉️ support.scarlify@gmail.com</p>
              <p className="text-sm">📍 Douala, Cameroon</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {currentYear} Scarlify. All rights reserved.</p>
          <p>Made with ❤️ for Cameroonian students</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <AiTutorSection />
      <SubjectsSection />
      <PastQuestionsSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}