'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, BookOpen, CreditCard, Headphones, GraduationCap, Award, Zap } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    // General Questions
    {
        category: 'General',
        question: 'What is Scarlify?',
        answer: 'Scarlify is Cameroon\'s premier GCE exam preparation platform. We provide AI-powered tutoring, past questions from 2005-2024, video lessons, quizzes, and progress tracking to help students excel in their GCE O and A Level exams.'
    },
    {
        category: 'General',
        question: 'Who can use Scarlify?',
        answer: 'Scarlify is designed for all Cameroonian students preparing for GCE O Level and A Level examinations, as well as teachers and parents who want to support their students.'
    },
    {
        category: 'General',
        question: 'Is Scarlify free?',
        answer: 'Yes! Scarlify offers a free plan with access to limited features. You can upgrade to Premium or Pro for unlimited access to all features.'
    },
    {
        category: 'General',
        question: 'Do I need to download anything?',
        answer: 'No! Scarlify works entirely in your web browser. No downloads or installations required. You can also download lessons for offline study.'
    },

    // Subjects & Content
    {
        category: 'Subjects',
        question: 'What subjects are available?',
        answer: 'We cover all GCE subjects across Science, Arts, Commercial, and Technical streams. Popular subjects include Mathematics, Physics, Chemistry, Biology, English, French, History, Geography, Economics, Accounting, Computer Science, and Technical Drawing.'
    },
    {
        category: 'Subjects',
        question: 'Are O Level and A Level subjects both available?',
        answer: 'Yes! Scarlify covers both O Level and A Level curricula. You can select your level when you sign up.'
    },
    {
        category: 'Subjects',
        question: 'Are past questions available for all years?',
        answer: 'Yes, we have past questions from 2005 to 2024 for all subjects, complete with model answers and marking schemes.'
    },

    // Pricing & Payments
    {
        category: 'Pricing',
        question: 'How much does Premium cost?',
        answer: 'Premium plan costs 2,500 FCFA per month. The Pro plan (best value) costs 20,000 FCFA per year, saving you 33% compared to monthly payments.'
    },
    {
        category: 'Pricing',
        question: 'What payment methods do you accept?',
        answer: 'We accept MTN Mobile Money, Orange Money, and bank transfers. All payments are secure and instant.'
    },
    {
        category: 'Pricing',
        question: 'Is there a money-back guarantee?',
        answer: 'Yes! We offer a 7-day money-back guarantee if you\'re not satisfied with our Premium service.'
    },
    {
        category: 'Pricing',
        question: 'Can I switch plans?',
        answer: 'Absolutely! You can upgrade or downgrade your plan at any time from your account settings.'
    },

    // Features
    {
        category: 'Features',
        question: 'How does the AI Tutor work?',
        answer: 'Our AI Tutor uses advanced artificial intelligence to answer your questions instantly. You can ask about any subject, upload images of questions, and get step-by-step explanations. Free users get 6 questions per day, while Premium users have unlimited access.'
    },
    {
        category: 'Features',
        question: 'Can I use Scarlify offline?',
        answer: 'Yes! Premium and Pro users can download lessons and study materials for offline access. This is perfect for areas with poor internet connectivity.'
    },
    {
        category: 'Features',
        question: 'How does progress tracking work?',
        answer: 'Our platform automatically tracks your quiz scores, lesson completion, study streaks, and past question attempts. You get detailed analytics and personalized recommendations.'
    },
    {
        category: 'Features',
        question: 'What are certificates?',
        answer: 'When you complete quizzes and courses, you earn certificates that you can download and share. They\'re great for your academic portfolio!'
    },

    // Technical
    {
        category: 'Technical',
        question: 'Do I need a fast internet connection?',
        answer: 'Scarlify works on slow connections too! Our platform is optimized for low bandwidth, and you can download content for offline study.'
    },
    {
        category: 'Technical',
        question: 'Is Scarlify mobile-friendly?',
        answer: 'Yes! Scarlify works perfectly on smartphones, tablets, and computers. You can study anytime, anywhere.'
    },
    {
        category: 'Technical',
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page. We\'ll send a reset link to your email address.'
    },

    // Support
    {
        category: 'Support',
        question: 'How can I contact support?',
        answer: 'You can reach us via email at support@scarlify.cm, phone at +237 671 834 918, WhatsApp, or live chat. Our support team is available Monday-Friday, 8AM-6PM.'
    },
    {
        category: 'Support',
        question: 'I found a bug. What should I do?',
        answer: 'Please report any bugs to support@scarlify.cm with a screenshot if possible. We\'ll fix it as soon as possible!'
    },
];

const categories = ['All', 'General', 'Subjects', 'Pricing', 'Features', 'Technical', 'Support'];

export default function FAQPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggleItem = (index: number) => {
        setOpenItems(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categoryIcons: Record<string, React.ReactNode> = {
        General: <BookOpen className="w-4 h-4" />,
        Subjects: <GraduationCap className="w-4 h-4" />,
        Pricing: <CreditCard className="w-4 h-4" />,
        Features: <Zap className="w-4 h-4" />,
        Technical: <Headphones className="w-4 h-4" />,
        Support: <Headphones className="w-4 h-4" />,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Frequently Asked Questions
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/90 max-w-2xl mx-auto"
                    >
                        Find answers to common questions about Scarlify
                    </motion.p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your question..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </motion.div>

                {/* Category Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 mb-8"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedCategory === category
                                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {category !== 'All' && categoryIcons[category]}
                            <span className="ml-1">{category}</span>
                        </button>
                    ))}
                </motion.div>

                {/* FAQ Items */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No questions found. Try a different search term.</p>
                        </div>
                    ) : (
                        filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-800 dark:text-white pr-4">
                                        {faq.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openItems.includes(index) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="px-6 py-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* Still Have Questions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 text-center bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl p-8"
                >
                    <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Still have questions?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Can't find the answer you're looking for?</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Contact Our Support Team
                        <ChevronDown className="w-4 h-4 rotate-270" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}