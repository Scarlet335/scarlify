'use client';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-slate-800 text-slate-300 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-sm">S</span>
                            </div>
                            <span className="font-bold text-lg text-white">Scarlify</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Cameroon's premier GCE exam prep platform.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Contact</Link></li>
                            <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-3">Contact</h3>
                        <ul className="space-y-2">
                            <li className="text-sm text-slate-400">📧 support@scarlify.cm</li>
                            <li className="text-sm text-slate-400">📞 +237 671 834 918</li>
                            <li className="text-sm text-slate-400">💬 WhatsApp: +237 671 834 918</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-700 mt-8 pt-6 text-center">
                    <p className="text-xs text-slate-500">
                        © {currentYear} Scarlify. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}