'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, FileQuestion, Brain, Users, CreditCard,
  Settings, ChevronLeft, ChevronRight, BarChart3, Upload, Tag, LogOut, Shield, MessageCircle, ShieldAlert,
  Megaphone
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AdminSidebar({ activeTab, setActiveTab }: { activeTab?: string; setActiveTab?: (tab: string) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  // Map sidebar labels to tab IDs
  const getTabId = (label: string) => {
    const tabMap: { [key: string]: string } = {
      'Dashboard': 'dashboard',
      'Analytics': 'analytics',
      'Lessons': 'lessons',
      'Past Papers': 'past-papers',
      'Quizzes': 'quizzes',
      'Mock Exams': 'mock-exams',
      'Upload Content': 'upload',
      'Bulk Upload': 'bulk-upload',
      'Subjects & Streams': 'subjects',
      'All Students': 'users',
      'Subscriptions': 'subscriptions',
      'Contact & Support': 'support',
      'Settings': 'settings',
      'Super Admin': 'super-admin',  // ← ADDED THIS LINE
      'Q&A Management': 'qa',  // ✅ ADD THIS LINE
    'Feed Posts': 'feed-posts',  // ✅ Also add this if not already there
    };
    return tabMap[label] || label.toLowerCase().replace(/\s+/g, '-');
  };

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { label: 'Analytics', icon: BarChart3, badge: null },
      ],
    },
    {
      label: 'Content',
      items: [
        { label: 'Lessons', icon: BookOpen, badge: 'Manage' },
        { label: 'Past Papers', icon: FileQuestion, badge: 'Manage' },
        { label: 'Quizzes', icon: Brain, badge: 'Manage' },
        { label: 'Mock Exams', icon: BarChart3, badge: 'Manage' },
        { label: 'Upload Content', icon: Upload, badge: null },
        { label: 'Bulk Upload', icon: Upload, badge: null },
        { label: 'Subjects & Streams', icon: Tag, badge: null },
        { label: 'Q&A Management', icon: MessageCircle, badge: 'Manage' },
        { label: 'Feed Posts', icon: Megaphone, badge: 'Manage' },
      ],
    },
    {
      label: 'Users',
      items: [
        { label: 'All Students', icon: Users, badge: null },
        { label: 'Subscriptions', icon: CreditCard, badge: null },
        { label: 'Contact & Support', icon: MessageCircle, badge: null },
      ],
    },
    {
      label: 'System',
      items: [
        { label: 'Settings', icon: Settings, badge: null },
        { label: 'Super Admin', icon: ShieldAlert, badge: null },
      ],
    },
  ];

  const handleNavClick = (label: string) => {
    const tabId = getTabId(label);
    if (setActiveTab) {
      setActiveTab(tabId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-border px-4 gap-2.5 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-base">S</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-base text-foreground tracking-tight leading-none">Scarlify</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-primary" /> Admin Panel
            </p>
          </div>
        )}
      </div>
      
      {/* Nav groups */}
      <nav className="flex-1 py-4 px-2 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups?.map((group) => (
          <div key={`navgroup-${group?.label}`}>
            {!collapsed && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1.5">
                {group?.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group?.items?.map((item) => {
                const Icon = item?.icon;
                const isActive = activeTab === getTabId(item.label);
                return (
                  <button
                    key={`sidenav-${item?.label}`}
                    onClick={() => handleNavClick(item.label)}
                    title={collapsed ? item?.label : undefined}
                    className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{item?.label}</span>
                        {item?.badge && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item?.badge === '12 pending' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
                          }`}>
                            {item?.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item?.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-0.5">
        <button
          onClick={() => handleNavClick('Settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-4.5 h-4.5 shrink-0" size={18} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-danger transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed((p) => !p)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${collapsed ? 'justify-center' : 'justify-end'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><span className="text-xs">Collapse</span><ChevronLeft className="w-4 h-4" /></>}
        </button>
      </div>
    </aside>
  );
}