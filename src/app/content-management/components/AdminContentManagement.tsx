import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminDashboardStats from './AdminDashboardStats';
import ContentTabs from './ContentTabs';

export default function AdminContentManagement() {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 px-5 lg:px-8 py-6 max-w-screen-2xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all lessons, past papers, quizzes, users, and subscriptions</p>
          </div>
          <AdminDashboardStats />
          <div className="mt-6">
            <ContentTabs />
          </div>
        </main>
      </div>
    </div>
  );
}