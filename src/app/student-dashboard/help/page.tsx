'use client';
import { useState } from 'react';
import { Mail, MessageCircle, Phone, HelpCircle, ChevronRight, BookOpen, Video, FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I upgrade my subscription?", a: "Click the 'Upgrade to Premium' button in the top bar. You can pay via MTN Mobile Money or Orange Money." },
    { q: "How do I save lessons for offline?", a: "On any lesson card, click the 'Save Offline' button. Your saved lessons will appear in the Offline Library." },
    { q: "What is the difference between Practice and Revision Mode?", a: "Practice Mode hides answers until you submit. Revision Mode shows answers immediately for quick studying." },
    { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot Password'. You'll receive a reset link via email." },
    { q: "How are my quiz scores calculated?", a: "Your score is based on the number of correct answers. Each correct answer gives you 10 XP." },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🆘 Help & Support</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Get help with using Scarlify</p>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-700">
          <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">WhatsApp Support</h3>
          <p className="text-sm text-gray-500">Fastest response</p>
          <a href="https://wa.me/237671834918" className="text-green-600 text-sm mt-2 inline-block">+237 671 834 918</a>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-700">
          <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Email Support</h3>
          <p className="text-sm text-gray-500">24h response time</p>
          <a href="mailto:support@scarlify.cm" className="text-blue-600 text-sm mt-2 inline-block">support@scarlify.cm</a>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center border border-gray-200 dark:border-gray-700">
          <Phone className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <h3 className="font-semibold mb-1">Phone Support</h3>
          <p className="text-sm text-gray-500">Mon-Fri, 8AM-6PM</p>
          <a href="tel:+237671834918" className="text-purple-600 text-sm mt-2 inline-block">+237 671 834 918</a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/student-dashboard/lessons" className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition">
          <BookOpen className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold">Browse Lessons</h3>
            <p className="text-xs text-gray-500">Start learning new topics</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
        <Link href="/past-questions" className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition">
          <FileQuestion className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold">Past Questions</h3>
            <p className="text-xs text-gray-500">Practice with past papers</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
        <Link href="/quiz" className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:shadow-md transition">
          <Video className="w-8 h-8 text-primary" />
          <div>
            <h3 className="font-semibold">Take a Quiz</h3>
            <p className="text-xs text-gray-500">Test your knowledge</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
        </Link>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button onClick={() => setActiveFaq(activeFaq === idx ? null : idx)} className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === idx && <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}