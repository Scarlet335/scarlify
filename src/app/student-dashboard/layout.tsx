'use client';
import StudentSidebar from './components/StudentSidebar';
import StudentTopbar from './components/StudentTopbar';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <StudentTopbar />
      <div className="flex flex-1">
        <StudentSidebar />
        <main className="flex-1 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}