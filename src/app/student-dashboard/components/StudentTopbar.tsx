'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, Search, User, ChevronDown, Crown, LogOut, Settings
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import PaymentModal from '@/app/components/PaymentModal';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function StudentTopbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: '7-day streak! Keep it up!', time: '2m ago', read: false, icon: '🔥' },
    { id: 2, text: 'New Chemistry past paper added: June 2024', time: '1h ago', read: false, icon: '📝' },
    { id: 3, text: 'Your AI tutor session is ready', time: '3h ago', read: true, icon: '🤖' },
  ]);
  const router = useRouter();
  const supabase = createClient();

  // Get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setUserEmail(user.email || '');
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
        setUserName(name);
        setUserAvatar(user.user_metadata?.avatar_url || '');
      } else {
        router.push('/sign-up-login-screen');
      }
    };
    getUser();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/sign-up-login-screen');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/student-dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">S</span>
            </div>
            <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight hidden sm:block">Scarlify</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search lessons, past questions, quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
                    <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                        <span className="text-lg mt-0.5">{n.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">{n.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/30 hover:border-primary transition-colors">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">{userName}</span>
                <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <div className="py-2">
                    <Link href="/student-dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link href="/student-dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button onClick={() => setShowPayment(true)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                      <Crown className="w-4 h-4" /> Upgrade to Premium
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => {
          setShowPayment(false);
          window.location.reload();
        }}
        userEmail={userEmail}
      />
    </>
  );
}