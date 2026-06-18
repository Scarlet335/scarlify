'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, FileQuestion, Brain, 
  Target, Download, Award, Settings, LogOut,
  ChevronLeft, ChevronRight, HelpCircle, BarChart3, Crown, Bell,
  RefreshCw,
  Home,
  MessageCircle,
  User,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import DarkModeToggle from '@/components/DarkModeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const navItems: NavItem[] = [
    { href: '/student-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student-dashboard/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/past-questions', label: 'Past Questions', icon: FileQuestion },
    { href: '/quiz', label: 'Quizzes', icon: Brain },
    { href: '/questions-and-answers', label: 'Q&A Forum', icon: MessageCircle },
    { href: '/student-dashboard/select-level', label: 'Change Subject', icon: RefreshCw },
    { href: '/scarlify-assist', label: 'Scarlify Assist', icon: Sparkles },
    { href: '/student-dashboard/mock-exams', label: 'Mock Exams', icon: Target },
    { href: '/student-dashboard/profile', label: 'Profile', icon: User },
    { href: '/student-dashboard/feed', label: 'Home Feed', icon: Home },
    { href: '/student-dashboard/offline', label: 'Offline', icon: Download },
    { href: '/student-dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/student-dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/student-dashboard/achievements', label: 'Achievements', icon: Award },
    { href: '/student-dashboard/help', label: 'Help', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (href === '/student-dashboard') {
      return pathname === '/student-dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 h-screen sticky top-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-gray-200 dark:border-gray-800 px-4 gap-2 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base">S</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">Scarlify</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2`}>
          {!collapsed && <span className="text-sm text-gray-500">Dark Mode</span>}
          <DarkModeToggle />
        </div>
        
        <Link
          href="/student-dashboard/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : 'justify-end'}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><span className="text-xs">Collapse</span><ChevronLeft className="w-4 h-4" /></>}
        </button>
      </div>
    </aside>
  );
}   