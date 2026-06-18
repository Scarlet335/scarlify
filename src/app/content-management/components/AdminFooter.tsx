'use client';

export default function AdminFooter() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-gray-800 text-gray-400">
            <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs">
                        © {currentYear} Scarlify Admin Panel. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-xs">Version 1.0.0</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            System Online
                        </span>
                        <a href="/support" className="text-xs hover:text-purple-400 transition-colors">
                            Need Help?
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}