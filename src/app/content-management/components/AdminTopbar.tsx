'use client';
import React from 'react';
import { Bell, Search } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function AdminTopbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-5 lg:px-8 gap-4 sticky top-0 z-30">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search content, users, subjects..."
          className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
        />
      </div>
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        <button className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/30">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_1be78788c-1763292596275.png"
              alt="Admin user - African male professional profile avatar"
              width={36}
              height={36}
              className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">Fabrice Mbarga</p>
            <p className="text-xs text-muted-foreground mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}