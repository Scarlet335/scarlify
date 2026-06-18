'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mail, Phone, MessageCircle, CheckCircle, Clock, Send, HelpCircle, FileText, Users, Headphones } from 'lucide-react';

export default function SupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    });
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState<'contact' | 'tickets' | 'faq'>('contact');
    const supabase = createClient();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });
        setTickets(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from('support_tickets').insert({
            user_id: user?.id,
            subject: formData.subject,
            message: formData.message,
            priority: formData.priority,
            status: 'open'
        });
        
        setSubmitted(true);
        setFormData({ subject: '', message: '', priority: 'normal' });
        setTimeout(() => setSubmitted(false), 3000);
        fetchTickets();
        setActiveTab('tickets');
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📞 Contact & Support</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Get help from our support team</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setActiveTab('contact');
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <Headphones className="w-4 h-4" />
                    {showForm ? 'Close Form' : 'New Support Ticket'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'contact'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    📞 Contact Support
                </button>
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'tickets'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    🎫 My Tickets ({tickets.length})
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'faq'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    ❓ FAQ
                </button>
            </div>

            {/* Contact Support Tab */}
            {activeTab === 'contact' && (
                <>
                    {/* Support Contact Info */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp Support</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fastest response (within minutes)</p>
                            <a href="https://wa.me/237671834918" className="text-green-600 dark:text-green-400 font-semibold hover:underline">+237 671 834 918</a>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Support</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">24h response time</p>
                            <a href="mailto:support@scarlify.cm" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">support@scarlify.cm</a>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone Support</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mon-Fri, 8AM-6PM</p>
                            <a href="tel:+237671834918" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">+237 671 834 918</a>
                        </div>
                    </div>

                    {/* Support Hours & Response Times */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Support Hours & Response Times
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">📅 Business Hours</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monday - Friday: 8:00 AM - 6:00 PM WAT</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Saturday: 9:00 AM - 1:00 PM WAT</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sunday: Closed</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">⏱️ Response Times</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp: Within 2 hours</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email: Within 24 hours</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone: Immediate during hours</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Support Tickets: 24-48 hours</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'tickets' && (
                <>
                    {/* Support Form */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Support Ticket</h2>
                            {submitted && (
                                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 border border-green-200 dark:border-green-800">
                                    <CheckCircle className="w-5 h-5" />
                                    Ticket created successfully! We'll respond within 24-48 hours.
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., Payment Issue, Technical Problem, Question about..."
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label>
                                    <select
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low - General question</option>
                                        <option value="normal">Normal - Need help</option>
                                        <option value="high">High - Urgent issue</option>
                                        <option value="urgent">Urgent - Critical problem</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Message *</label>
                                    <textarea
                                        rows={5}
                                        required
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Please describe your issue in detail..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Submit Ticket
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Tickets List */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Support Tickets</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your support requests</p>
                        </div>
                        {tickets.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HelpCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No support tickets yet.</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mt-4 text-primary hover:underline"
                                >
                                    Create your first ticket →
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                ticket.status === 'open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                ticket.status === 'closed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                            }`}>
                                                {ticket.status === 'open' ? '🟢 Open' : ticket.status === 'closed' ? '🔴 Closed' : '🟡 In Progress'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{ticket.message}</p>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                ticket.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                ticket.priority === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                ticket.priority === 'normal' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: "How do I upgrade my subscription?", a: "Go to Settings → Subscription and choose your preferred plan. You can pay via Mobile Money (MTN/Orange)." },
                            { q: "What payment methods are accepted?", a: "We accept MTN Mobile Money, Orange Money, and bank transfers. All payments are secure and instant." },
                            { q: "How long does it take to get support?", a: "WhatsApp responses within 2 hours, email within 24 hours, and tickets within 24-48 hours." },
                            { q: "Can I get a refund?", a: "We offer a 7-day money-back guarantee for Premium and Pro plans. Contact support for refund requests." },
                            { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page. You'll receive a reset link via email." },
                            { q: "Is there a student discount?", a: "Yes! Contact us with your student ID for a 20% discount on any plan." },
                        ].map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{faq.q}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}