'use client';
import { useState } from 'react';
import BulkUpload from './components/BulkUpload';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import AdminDashboardStats from './components/AdminDashboardStats';
import ContentTable from './components/ContentTable';
import SubjectsTree from './components/SubjectsTree';
import UploadModal from './components/UploadModal';
import UsersTable from './components/UsersTable';
import AdminFooter from './components/AdminFooter';
import FeedPosts from './components/FeedPosts';
import QandAManagement from './components/QandAManagement';  // ✅ Already imported
import AnalyticsPage from './analytics/page';
import SupportPage from './support/page';
import SettingsPage from './settings/page';
import PastPapersPage from './past-papers/page';
import LessonsPage from './lessons/page';
import QuizzesPage from './quizzes/page';
import MockExamsPage from './mock-exams/page';
import SubscriptionsPage from './subscriptions/page';
import SuperAdminPage from './super-admin/page';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardStats />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'lessons':
        return <LessonsPage />;
      case 'past-papers':
        return <PastPapersPage />;
      case 'quizzes':
        return <QuizzesPage />;
      case 'mock-exams':
        return <MockExamsPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'super-admin':
        return <SuperAdminPage />;
      case 'upload':
        return <UploadModal onClose={() => setActiveTab('dashboard')} />;
      case 'bulk-upload':
        return <BulkUpload onClose={() => setActiveTab('dashboard')} />;
      case 'subjects':
        return <SubjectsTree />;
      case 'users':
        return <UsersTable />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      case 'feed-posts':
        return <FeedPosts />;
      case 'qa':  // ✅ ADD THIS CASE
        return <QandAManagement />;  // ✅ ADD THIS
      default:
        return <AdminDashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="flex flex-1">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <AdminTopbar />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900">
            {renderContent()}
          </main>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
}