'use client';
import React, { useState } from 'react';
import ContentTable from './ContentTable';
import UsersTable from './UsersTable';
import SubjectsTree from './SubjectsTree';
import UploadModal from './UploadModal';
import { Upload } from 'lucide-react';

const tabs = [
  { id: 'tab-content', label: 'Content Library' },
  { id: 'tab-users', label: 'Students' },
  { id: 'tab-subjects', label: 'Subjects & Streams' },
];

export default function ContentTabs() {
  const [activeTab, setActiveTab] = useState('tab-content');
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {tabs?.map((t) => (
            <button
              key={t?.id}
              onClick={() => setActiveTab(t?.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                activeTab === t?.id
                  ? 'bg-card text-primary card-shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t?.label}
            </button>
          ))}
        </div>
        {activeTab === 'tab-content' && (
          <button
            onClick={() => setUploadOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Content
          </button>
        )}
      </div>
      <div className="animate-fade-in">
        {activeTab === 'tab-content' && <ContentTable />}
        {activeTab === 'tab-users' && <UsersTable />}
        {activeTab === 'tab-subjects' && <SubjectsTree />}
      </div>
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}