'use client';
import { useState } from 'react';
import StudentSidebar from './components/StudentSidebar';
import StudentTopbar from './components/StudentTopbar';
import { Menu, X } from 'lucide-react';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <StudentTopbar />
      
      <div className="flex flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-64
            transform transition-transform duration-300 ease-in-out
            lg:hidden
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <StudentSidebar isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <StudentSidebar />
        </div>

        <main className="flex-1 overflow-x-auto pt-4 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}