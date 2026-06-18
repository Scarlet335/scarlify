'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, BookOpen, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface SubjectItem {
  id: string;
  name: string;
  level: 'O Level' | 'A Level' | 'Both';
  lessons: number;
  papers: number;
  quizzes: number;
  stream_id: string;
}

interface StreamGroup {
  id: string;
  name: string;
  color: string;
  subjects: SubjectItem[];
}

// Color mapping for streams
const streamColors: Record<string, string> = {
  'Science Stream': 'bg-blue-100 text-blue-700 border-blue-200',
  'Arts Stream': 'bg-rose-100 text-rose-700 border-rose-200',
  'Commercial Stream': 'bg-teal-100 text-teal-700 border-teal-200',
  'Technical Stream': 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function SubjectsTree() {
  const [streams, setStreams] = useState<StreamGroup[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [editingStream, setEditingStream] = useState<StreamGroup | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddStream, setShowAddStream] = useState(false);
  const [newStream, setNewStream] = useState({ name: '', color: 'bg-blue-100 text-blue-700 border-blue-200' });
  const [newSubject, setNewSubject] = useState({ name: '', level: 'O Level' as const, streamId: '' });
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load subjects from database
    const { data: subjectsData, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading subjects:', error);
      // Use default data if database empty
      setStreams(streamData);
    } else if (subjectsData && subjectsData.length > 0) {
      // Group subjects by stream
      const grouped: Record<string, StreamGroup> = {};
      subjectsData.forEach((subject: any) => {
        if (!grouped[subject.stream]) {
          grouped[subject.stream] = {
            id: subject.stream.toLowerCase().replace(/\s+/g, '-'),
            name: subject.stream,
            color: streamColors[subject.stream] || 'bg-gray-100 text-gray-700 border-gray-200',
            subjects: []
          };
        }
        grouped[subject.stream].subjects.push({
          id: subject.id,
          name: subject.name,
          level: subject.level,
          lessons: subject.lessons || 0,
          papers: subject.papers || 0,
          quizzes: subject.quizzes || 0,
          stream_id: subject.stream
        });
      });
      setStreams(Object.values(grouped));
      // Expand first stream by default
      if (Object.values(grouped).length > 0) {
        setExpanded(new Set([Object.values(grouped)[0].id]));
      }
    } else {
      setStreams(streamData);
      setExpanded(new Set(['stream-science']));
    }
    setLoading(false);
  };

  const saveSubject = async (subject: SubjectItem) => {
    const { error } = await supabase
      .from('subjects')
      .upsert({
        id: subject.id,
        name: subject.name,
        stream: subject.stream_id,
        level: subject.level,
        lessons: subject.lessons,
        papers: subject.papers,
        quizzes: subject.quizzes
      });
    
    if (error) {
      toast.error('Failed to save subject');
      return false;
    }
    return true;
  };

  const addSubject = async () => {
    if (!newSubject.name || !newSubject.streamId) {
      toast.error('Please fill all fields');
      return;
    }

    const newId = `subj-${Date.now()}`;
    const subject: SubjectItem = {
      id: newId,
      name: newSubject.name,
      level: newSubject.level,
      lessons: 0,
      papers: 0,
      quizzes: 0,
      stream_id: newSubject.streamId
    };

    const success = await saveSubject(subject);
    if (success) {
      toast.success(`${newSubject.name} added to ${newSubject.streamId}`);
      loadData(); // Reload data
      setShowAddSubject(false);
      setNewSubject({ name: '', level: 'O Level', streamId: '' });
    }
  };

  const updateSubject = async () => {
    if (!editingSubject) return;
    
    const success = await saveSubject(editingSubject);
    if (success) {
      toast.success(`${editingSubject.name} updated`);
      loadData();
      setEditingSubject(null);
    }
  };

  const deleteSubject = async (subjectId: string, subjectName: string) => {
    if (confirm(`Delete "${subjectName}"? This cannot be undone.`)) {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);
      
      if (error) {
        toast.error('Failed to delete subject');
      } else {
        toast.success(`${subjectName} deleted`);
        loadData();
      }
    }
  };

  const addStream = async () => {
    if (!newStream.name) {
      toast.error('Please enter stream name');
      return;
    }

    const newId = `stream-${newStream.name.toLowerCase().replace(/\s+/g, '-')}`;
    const newStreamObj: StreamGroup = {
      id: newId,
      name: newStream.name,
      color: newStream.color,
      subjects: []
    };
    
    setStreams([...streams, newStreamObj]);
    setExpanded(new Set([...expanded, newId]));
    toast.success(`${newStream.name} added`);
    setShowAddStream(false);
    setNewStream({ name: '', color: 'bg-blue-100 text-blue-700 border-blue-200' });
  };

  const toggleStream = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl card-shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl card-shadow overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Subjects & Streams</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {streams.length} streams · {streams.reduce((a, s) => a + s.subjects.length, 0)} subjects
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddStream(true)}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Stream
          </button>
          <button
            onClick={() => setShowAddSubject(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {streams.map((stream) => {
          const isOpen = expanded.has(stream.id);
          const totalLessons = stream.subjects.reduce((a, s) => a + s.lessons, 0);
          const totalPapers = stream.subjects.reduce((a, s) => a + s.papers, 0);
          
          return (
            <div key={stream.id}>
              {/* Stream header */}
              <button
                onClick={() => toggleStream(stream.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl border text-xs font-bold ${stream.color}`}>
                  {stream.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{stream.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stream.subjects.length} subjects · {totalLessons} lessons · {totalPapers} past papers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{stream.subjects.length} subjects</span>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Subjects list */}
              {isOpen && (
                <div className="bg-muted/20 border-t border-border divide-y divide-border/50">
                  {stream.subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors group pl-16">
                      <div className="w-7 h-7 bg-card border border-border rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{subject.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-medium ${subject.level === 'A Level' ? 'text-primary' : subject.level === 'O Level' ? 'text-accent' : 'text-success'}`}>
                            {subject.level}
                          </span>
                          <span className="text-xs text-muted-foreground">{subject.lessons} lessons</span>
                          <span className="text-xs text-muted-foreground">{subject.papers} papers</span>
                          <span className="text-xs text-muted-foreground">{subject.quizzes} quizzes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit subject"
                          onClick={() => setEditingSubject(subject)}
                          className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button
                          title="Delete subject"
                          onClick={() => deleteSubject(subject.id, subject.name)}
                          className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-2.5 pl-16">
                    <button
                      onClick={() => {
                        setNewSubject({ ...newSubject, streamId: stream.name });
                        setShowAddSubject(true);
                      }}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add subject to {stream.name}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Stream Modal */}
      {showAddStream && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Stream</h2>
              <button onClick={() => setShowAddStream(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Stream Name (e.g., Science Stream)"
                className="w-full border rounded-lg p-2"
                value={newStream.name}
                onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
              />
              <div>
                <label className="text-sm font-medium mb-1 block">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bg-blue-100 text-blue-700 border-blue-200', 'bg-rose-100 text-rose-700 border-rose-200', 'bg-teal-100 text-teal-700 border-teal-200', 'bg-orange-100 text-orange-700 border-orange-200', 'bg-green-100 text-green-700 border-green-200', 'bg-purple-100 text-purple-700 border-purple-200'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewStream({ ...newStream, color })}
                      className={`h-10 rounded-lg border-2 ${color} ${newStream.color === color ? 'ring-2 ring-primary' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddStream(false)} className="flex-1 border rounded-lg py-2">Cancel</button>
                <button onClick={addStream} className="flex-1 bg-primary text-white rounded-lg py-2">Add Stream</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Subject</h2>
              <button onClick={() => setShowAddSubject(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name (e.g., Physics)"
                className="w-full border rounded-lg p-2"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              />
              <select
                className="w-full border rounded-lg p-2"
                value={newSubject.level}
                onChange={(e) => setNewSubject({ ...newSubject, level: e.target.value as any })}
              >
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
                <option value="Both">Both</option>
              </select>
              <select
                className="w-full border rounded-lg p-2"
                value={newSubject.streamId}
                onChange={(e) => setNewSubject({ ...newSubject, streamId: e.target.value })}
              >
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream.id} value={stream.name}>{stream.name}</option>
                ))}
              </select>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddSubject(false)} className="flex-1 border rounded-lg py-2">Cancel</button>
                <button onClick={addSubject} className="flex-1 bg-primary text-white rounded-lg py-2">Add Subject</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Subject</h2>
              <button onClick={() => setEditingSubject(null)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full border rounded-lg p-2"
                value={editingSubject.name}
                onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
              />
              <select
                className="w-full border rounded-lg p-2"
                value={editingSubject.level}
                onChange={(e) => setEditingSubject({ ...editingSubject, level: e.target.value as any })}
              >
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
                <option value="Both">Both</option>
              </select>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Lessons</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={editingSubject.lessons}
                    onChange={(e) => setEditingSubject({ ...editingSubject, lessons: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Papers</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={editingSubject.papers}
                    onChange={(e) => setEditingSubject({ ...editingSubject, papers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Quizzes</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    value={editingSubject.quizzes}
                    onChange={(e) => setEditingSubject({ ...editingSubject, quizzes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditingSubject(null)} className="flex-1 border rounded-lg py-2">Cancel</button>
                <button onClick={updateSubject} className="flex-1 bg-primary text-white rounded-lg py-2">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default data (fallback if database is empty)
const streamData: StreamGroup[] = [
  {
    id: 'stream-science',
    name: 'Science Stream',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    subjects: [
      { id: 'sj-001', name: 'Mathematics', level: 'Both', lessons: 28, papers: 18, quizzes: 22, stream_id: 'Science Stream' },
      { id: 'sj-002', name: 'Physics', level: 'Both', lessons: 24, papers: 15, quizzes: 18, stream_id: 'Science Stream' },
      { id: 'sj-003', name: 'Chemistry', level: 'Both', lessons: 26, papers: 16, quizzes: 20, stream_id: 'Science Stream' },
      { id: 'sj-004', name: 'Biology', level: 'Both', lessons: 22, papers: 14, quizzes: 17, stream_id: 'Science Stream' },
    ],
  },
  {
    id: 'stream-arts',
    name: 'Arts Stream',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    subjects: [
      { id: 'sj-006', name: 'English Language', level: 'Both', lessons: 20, papers: 12, quizzes: 15, stream_id: 'Arts Stream' },
      { id: 'sj-007', name: 'French Language', level: 'Both', lessons: 18, papers: 11, quizzes: 14, stream_id: 'Arts Stream' },
      { id: 'sj-008', name: 'History', level: 'Both', lessons: 16, papers: 10, quizzes: 11, stream_id: 'Arts Stream' },
      { id: 'sj-009', name: 'Geography', level: 'Both', lessons: 14, papers: 9, quizzes: 10, stream_id: 'Arts Stream' },
    ],
  },
  {
    id: 'stream-commercial',
    name: 'Commercial Stream',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    subjects: [
      { id: 'sj-011', name: 'Accounting', level: 'Both', lessons: 20, papers: 11, quizzes: 14, stream_id: 'Commercial Stream' },
      { id: 'sj-012', name: 'Economics', level: 'Both', lessons: 18, papers: 10, quizzes: 13, stream_id: 'Commercial Stream' },
      { id: 'sj-013', name: 'Commerce', level: 'O Level', lessons: 14, papers: 8, quizzes: 10, stream_id: 'Commercial Stream' },
    ],
  },
  {
    id: 'stream-technical',
    name: 'Technical Stream',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    subjects: [
      { id: 'sj-015', name: 'Technical Drawing', level: 'O Level', lessons: 12, papers: 7, quizzes: 9, stream_id: 'Technical Stream' },
      { id: 'sj-016', name: 'Computer Science', level: 'Both', lessons: 18, papers: 10, quizzes: 14, stream_id: 'Technical Stream' },
    ],
  },
];