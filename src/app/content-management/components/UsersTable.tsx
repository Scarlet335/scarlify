'use client';
import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Edit2, Eye, Shield } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import { toast } from 'sonner';

type PlanType = 'Free' | 'Premium' | 'Pro';
type UserStatus = 'Active' | 'Inactive' | 'Suspended';

interface Student {
  id: string;
  name: string;
  email: string;
  level: 'O Level' | 'A Level';
  stream: string;
  plan: PlanType;
  status: UserStatus;
  streak: number;
  quizAvg: number;
  joinedAt: string;
  lastActive: string;
  avatar: string;
  avatarAlt: string;
}

const mockStudents: Student[] = [
{ id: 'stu-001', name: 'Amina Nkemdirim', email: 'amina.nkemdirim@scarlify.cm', level: 'O Level', stream: 'Science', plan: 'Free', status: 'Active', streak: 7, quizAvg: 68, joinedAt: '12/01/2026', lastActive: '13/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png", avatarAlt: 'Amina Nkemdirim - African Black female student' },
{ id: 'stu-002', name: 'Boris Tchamba', email: 'boris.tchamba@scarlify.cm', level: 'A Level', stream: 'Science', plan: 'Premium', status: 'Active', streak: 21, quizAvg: 82, joinedAt: '05/02/2026', lastActive: '13/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png", avatarAlt: 'Boris Tchamba - African Black male student' },
{ id: 'stu-003', name: 'Celine Nguefang', email: 'celine.nguefang@scarlify.cm', level: 'O Level', stream: 'Arts', plan: 'Pro', status: 'Active', streak: 45, quizAvg: 91, joinedAt: '18/01/2026', lastActive: '12/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_111081dcf-1772954946301.png", avatarAlt: 'Celine Nguefang - African Black female student studying' },
{ id: 'stu-004', name: 'Didier Kamga', email: 'didier.kamga@scarlify.cm', level: 'A Level', stream: 'Commercial', plan: 'Premium', status: 'Active', streak: 3, quizAvg: 54, joinedAt: '22/03/2026', lastActive: '11/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png", avatarAlt: 'Didier Kamga - African Black male student' },
{ id: 'stu-005', name: 'Esther Biyong', email: 'esther.biyong@scarlify.cm', level: 'O Level', stream: 'Technical', plan: 'Free', status: 'Inactive', streak: 0, quizAvg: 41, joinedAt: '10/04/2026', lastActive: '02/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17bbb4de3-1763300863921.png", avatarAlt: 'Esther Biyong - African Black female student' },
{ id: 'stu-006', name: 'Franck Ondoua', email: 'franck.ondoua@scarlify.cm', level: 'O Level', stream: 'Science', plan: 'Premium', status: 'Active', streak: 14, quizAvg: 75, joinedAt: '08/02/2026', lastActive: '13/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png", avatarAlt: 'Franck Ondoua - African Black male student' },
{ id: 'stu-007', name: 'Grace Mbianda', email: 'grace.mbianda@scarlify.cm', level: 'A Level', stream: 'Arts', plan: 'Pro', status: 'Active', streak: 30, quizAvg: 88, joinedAt: '15/01/2026', lastActive: '13/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17bbb4de3-1763300863921.png", avatarAlt: 'Grace Mbianda - African Black female student with books' },
{ id: 'stu-008', name: 'Hervé Ngoumou', email: 'herve.ngoumou@scarlify.cm', level: 'O Level', stream: 'Commercial', plan: 'Free', status: 'Suspended', streak: 0, quizAvg: 29, joinedAt: '28/03/2026', lastActive: '20/04/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png", avatarAlt: 'Hervé Ngoumou - African Black male student' },
{ id: 'stu-009', name: 'Isabelle Fotso', email: 'isabelle.fotso@scarlify.cm', level: 'A Level', stream: 'Science', plan: 'Premium', status: 'Active', streak: 9, quizAvg: 72, joinedAt: '14/02/2026', lastActive: '12/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1f2617586-1763301756396.png", avatarAlt: 'Isabelle Fotso - African Black female student' },
{ id: 'stu-010', name: 'Jean-Pierre Ateba', email: 'jpateba@scarlify.cm', level: 'O Level', stream: 'Technical', plan: 'Free', status: 'Active', streak: 2, quizAvg: 60, joinedAt: '01/05/2026', lastActive: '13/05/2026', avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17392bd70-1763295812950.png", avatarAlt: 'Jean-Pierre Ateba - African Black male student' }];


const planBadge: Record<PlanType, string> = {
  Free: 'badge-free',
  Premium: 'badge-premium',
  Pro: 'badge-pro'
};

const statusBadge: Record<UserStatus, string> = {
  Active: 'badge-success',
  Inactive: 'badge-warning',
  Suspended: 'badge-danger'
};

export default function UsersTable() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortCol, setSortCol] = useState('joinedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = mockStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'All' || s.plan === planFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortCol as keyof Student];
    const bVal = b[sortCol as keyof Student];
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');else
    {setSortCol(col);setSortDir('asc');}
  };

  const SortIcon = ({ col }: {col: string;}) =>
  <span className="inline-flex flex-col ml-1 opacity-50">
      <ChevronUp className={`w-3 h-3 -mb-1 ${sortCol === col && sortDir === 'asc' ? 'opacity-100 text-primary' : ''}`} />
      <ChevronDown className={`w-3 h-3 ${sortCol === col && sortDir === 'desc' ? 'opacity-100 text-primary' : ''}`} />
    </span>;


  return (
    <div className="bg-card border border-border rounded-2xl card-shadow overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => {setSearch(e.target.value);setPage(1);}}
            className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          
        </div>
        <select
          value={planFilter}
          onChange={(e) => {setPlanFilter(e.target.value);setPage(1);}}
          className="bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          
          <option value="All">All Plans</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
          <option value="Pro">Pro</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {setStatusFilter(e.target.value);setPage(1);}}
          className="bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {[
              { key: 'name', label: 'Student' },
              { key: 'level', label: 'Level' },
              { key: 'stream', label: 'Stream' },
              { key: 'plan', label: 'Plan' },
              { key: 'status', label: 'Status' },
              { key: 'streak', label: 'Streak' },
              { key: 'quizAvg', label: 'Quiz Avg' },
              { key: 'joinedAt', label: 'Joined' },
              { key: 'lastActive', label: 'Last Active' }].
              map((col) =>
              <th
                key={`uth-${col.key}`}
                className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort(col.key)}>
                
                  <span className="flex items-center">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.length === 0 ?
            <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-muted-foreground opacity-40" />
                    <p className="text-sm font-semibold text-muted-foreground">No students found</p>
                    <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                  </div>
                </td>
              </tr> :

            paged.map((student) =>
            <tr key={student.id} className="hover:bg-muted/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-border">
                        <AppImage
                      src={student.avatar}
                      alt={student.avatarAlt}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover" />
                    
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${student.level === 'A Level' ? 'text-primary' : 'text-accent'}`}>
                      {student.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg font-medium">{student.stream}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={planBadge[student.plan]}>{student.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusBadge[student.status]}>{student.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm font-bold tabular-nums text-amber-600">
                      🔥 {student.streak}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold tabular-nums ${student.quizAvg >= 75 ? 'text-success' : student.quizAvg >= 55 ? 'text-accent' : 'text-danger'}`}>
                      {student.quizAvg}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{student.joinedAt}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{student.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View student profile" className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors" aria-label="View profile">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button title="Edit student account" className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-blue-100 transition-colors" aria-label="Edit">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                    title="Suspend or delete this student account"
                    onClick={() => toast.error(`Action taken on ${student.name}`)}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-100 hover:text-danger transition-colors"
                    aria-label="Suspend">
                    
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
            )
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{Math.min((page - 1) * perPage + 1, sorted.length)}–{Math.min(page * perPage, sorted.length)}</span> of <span className="font-semibold text-foreground">{sorted.length}</span> students
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
          <button key={`upage-${p}`} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${page === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
              {p}
            </button>
          )}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Next page">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>);

}