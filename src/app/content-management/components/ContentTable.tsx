// src/app/admin/tabs/components/ContentTable.tsx

'use client';
import React, { useState } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// Types
type ContentType = 'Lesson' | 'Past Paper' | 'Quiz';
type ContentStatus = 'Published' | 'Draft' | 'Archived';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  subject: string;
  stream: 'Science' | 'Arts' | 'Commercial' | 'Technical';
  level: 'O Level' | 'A Level';
  year: string;
  session: string;
  status: ContentStatus;
  views: number;
  uploadedBy: string;
  uploadedAt: string;
}

// ✅ Props interface - allow custom data
interface ContentTableProps {
  data?: ContentItem[]; // Optional - use mock if not provided
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
  onView?: (item: ContentItem) => void;
}

const mockContent: ContentItem[] = [
  // ... your mock data here
];

const statusColors: Record<ContentStatus, string> = {
  Published: 'badge-success',
  Draft: 'badge-warning',
  Archived: 'badge-free',
};

const typeColors: Record<ContentType, string> = {
  Lesson: 'bg-blue-100 text-blue-700',
  'Past Paper': 'bg-purple-100 text-purple-700',
  Quiz: 'bg-green-100 text-green-700',
};

export default function ContentTable({ 
  data: propData, 
  onEdit, 
  onDelete, 
  onView 
}: ContentTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortCol, setSortCol] = useState<string>('uploadedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const perPage = 8;

  // ✅ Use prop data if provided, otherwise use mock
  const data = propData || mockContent;

  const filtered = data.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // ... rest of your component code (same as before)

  // When handling edit/delete, call the props
  const handleEdit = (item: ContentItem) => {
    if (onEdit) onEdit(item);
    else toast.info('Edit: ' + item.title);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    if (onDelete) {
      const item = data.find(c => c.id === deleteId);
      if (item) onDelete(item);
    }
    toast.success('Content item deleted successfully');
    setDeleteId(null);
  };

  // ... rest of your JSX (use handleEdit instead of inline functions)
}