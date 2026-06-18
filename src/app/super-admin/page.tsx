'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, AlertTriangle, BarChart3, Bell, ChevronLeft, ChevronRight, 
  CreditCard, Database, Globe, Key, LayoutDashboard, Lock, LogOut, 
  RefreshCw, Search, Settings, Shield, ShieldAlert, Sliders, ToggleLeft, 
  ToggleRight, Trash2, TrendingUp, Upload, UserCheck, UserCog, UserMinus, 
  UserPlus, Users, Zap 
} from 'lucide-react';

type Tab = 'overview' | 'admins' | 'users' | 'subscriptions' | 'settings' | 'analytics' | 'security';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    flagged: 'bg-amber-100 text-amber-700',
    past_due: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-500',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    verified: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status?.replace('_', ' ') || status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'Super Admin') return <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full"><ShieldAlert className="w-3 h-3" />{role}</span>;
  if (role === 'Content Admin') return <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{role}</span>;
  return <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full">{role}</span>;
}

function PlanBadge({ plan }: { plan: string }) {
  if (plan === 'Pro') return <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-0.5 rounded-full">⭐ Pro</span>;
  if (plan === 'Premium') return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">✨ Premium</span>;
  return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">Free</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPremium: 0,
    totalPro: 0,
    totalRevenue: 0,
    totalAiQueries: 0,
    totalContent: 0,
    recentUsers: [] as any[],
    subscriptions: [] as any[],
    payments: [] as any[],
    regionData: [] as any[],
    subjectData: [] as any[],
    admins: [] as any[],
    securityLogs: [] as any[],
  });
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    new_registrations: true,
    ai_tutor: true,
    offline_downloads: true,
    leaderboards: true,
    free_tier_ai: true,
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    fetchAllData();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/sign-up-login-screen');
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, subscription_tier')
      .eq('id', user.id)
      .single();
    
    // Check if user is super admin (you can set is_super_admin column)
    if (!profile?.is_admin) {
      router.push('/student-dashboard');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch premium users
    const { count: premiumUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'Premium');

    const { count: proUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'Pro');

    // Fetch payments for revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Fetch AI queries count
    const { count: aiQueries } = await supabase
      .from('ai_conversations')
      .select('*', { count: 'exact', head: true });

    // Fetch content count
    const { count: pastQuestions } = await supabase
      .from('past_questions')
      .select('*', { count: 'exact', head: true });
    const { count: quizzes } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true });
    const totalContent = (pastQuestions || 0) + (quizzes || 0);

    // Fetch recent users
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier, created_at, region')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('payment_requests')
      .select('*, profiles(full_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch payments for subscriptions tab
    const { data: paymentHistory } = await supabase
      .from('payments')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch region data
    const { data: regionProfiles } = await supabase
      .from('profiles')
      .select('region');

    const regionMap: Record<string, number> = {};
    regionProfiles?.forEach(p => {
      if (p.region) regionMap[p.region] = (regionMap[p.region] || 0) + 1;
    });
    const regionData = Object.entries(regionMap).map(([name, count]) => ({ name, count }));

    // Fetch subject popularity
    const { data: subjectScores } = await supabase
      .from('quiz_scores')
      .select('subject, score');
    
    const subjectMap: Record<string, number> = {};
    subjectScores?.forEach(s => {
      if (s.subject) subjectMap[s.subject] = (subjectMap[s.subject] || 0) + 1;
    });
    const subjectData = Object.entries(subjectMap)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Fetch admins (users with is_admin = true)
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('is_admin', true)
      .limit(10);

    setStats({
      totalUsers: totalUsers || 0,
      totalPremium: premiumUsers || 0,
      totalPro: proUsers || 0,
      totalRevenue: totalRevenue,
      totalAiQueries: aiQueries || 0,
      totalContent: totalContent,
      recentUsers: recentUsers || [],
      subscriptions: subscriptions || [],
      payments: paymentHistory || [],
      regionData: regionData,
      subjectData: subjectData,
      admins: admins || [],
      securityLogs: [],
    });

    setLoading(false);
  };

  const updateSetting = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Save to Supabase settings table (create if needed)
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value, updated_at: new Date() });
    if (error) console.error('Failed to save setting:', error);
  };

  const NAV_ITEMS: { tab: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
    { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
    { tab: 'admins', label: 'Admin Accounts', icon: ShieldAlert, badge: stats.admins.length.toString() },
    { tab: 'users', label: 'All Users', icon: Users, badge: stats.totalUsers.toLocaleString() },
    { tab: 'subscriptions', label: 'Subscriptions', icon: CreditCard, badge: stats.subscriptions.length.toString() },
    { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
    { tab: 'settings', label: 'Platform Settings', icon: Sliders },
    { tab: 'security', label: 'Security & Logs', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className={`h-16 flex items-center border-b border-border px-4 gap-2.5 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-violet-700 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-foreground tracking-tight leading-none">Scarlify</p>
              <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3" /> Super Admin
              </p>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === item.tab
                    ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badge.includes('alert') ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-border p-2 space-y-0.5">
          <Link href="/content-management" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" size={18} />
            {!sidebarCollapsed && <span>Admin Panel</span>}
          </Link>
          <button onClick={() => supabase.auth.signOut()} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-4.5 h-4.5 shrink-0" size={18} />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(p => !p)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${sidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><span className="text-xs">Collapse</span><ChevronLeft className="w-4 h-4" /></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-5 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-violet-700 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-foreground leading-none">Super Admin Panel</p>
                <p className="text-xs text-red-600 font-semibold">Elevated Access</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
              <ShieldAlert className="w-3 h-3" /> Super Admin Session
            </span>
            <button className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">{stats.totalPremium + stats.totalPro}</p>
                  <p className="text-xs text-muted-foreground">Paid Subscriptions</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">{stats.totalRevenue.toLocaleString()} FCFA</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">{stats.totalAiQueries.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">AI Queries</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">{stats.totalContent}</p>
                  <p className="text-xs text-muted-foreground">Content Items</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <p className="text-2xl font-extrabold">99.97%</p>
                  <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Recent Signups</h3>
                  <div className="space-y-3">
                    {stats.recentUsers.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-semibold">{u.full_name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <PlanBadge plan={u.subscription_tier || 'Free'} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Pending Payments</h3>
                  <div className="space-y-3">
                    {stats.subscriptions.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-semibold">{p.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{p.amount} FCFA · {p.provider}</p>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">All Users ({stats.totalUsers})</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr><th className="text-left px-5 py-3">User</th><th className="text-left px-5 py-3">Plan</th><th className="text-left px-5 py-3 hidden md:table-cell">Region</th><th className="text-left px-5 py-3">Joined</th></tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-5 py-3"><p className="font-semibold">{u.full_name || 'Anonymous'}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
                        <td className="px-5 py-3"><PlanBadge plan={u.subscription_tier || 'Free'} /></td>
                        <td className="px-5 py-3 hidden md:table-cell text-xs">{u.region || 'Not set'}</td>
                        <td className="px-5 py-3 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Payment History</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr><th className="text-left px-5 py-3">User</th><th className="text-left px-5 py-3">Amount</th><th className="text-left px-5 py-3">Method</th><th className="text-left px-5 py-3">Status</th><th className="text-left px-5 py-3">Date</th></tr>
                  </thead>
                  <tbody>
                    {stats.payments.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="px-5 py-3">{p.profiles?.full_name || 'Unknown'}</td>
                        <td className="px-5 py-3">{p.amount?.toLocaleString()} FCFA</td>
                        <td className="px-5 py-3">{p.payment_method || 'Mobile Money'}</td>
                        <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-5 py-3 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="font-bold text-lg">Platform Analytics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Users by Region</h3>
                  <div className="space-y-3">
                    {stats.regionData.slice(0, 6).map((r) => (
                      <div key={r.name}><div className="flex justify-between text-sm"><span>{r.name}</span><span>{r.count}</span></div>
                      <div className="h-2 bg-muted rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${(r.count / stats.totalUsers) * 100}%` }} /></div></div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-bold mb-4">Popular Subjects</h3>
                  <div className="space-y-2">
                    {stats.subjectData.map((s) => (
                      <div key={s.subject} className="flex justify-between text-sm"><span>{s.subject}</span><span>{s.count} quizzes</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="font-bold text-lg">Platform Settings</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {Object.entries(settings).map(([key, value], i, arr) => (
                  <div key={key} className={`flex justify-between items-center px-5 py-4 ${i < arr.length - 1 ? 'border-b' : ''}`}>
                    <div><p className="font-semibold capitalize">{key.replace(/_/g, ' ')}</p></div>
                    <button onClick={() => updateSetting(key, !value)} className="text-primary">{value ? '✓ Enabled' : '✗ Disabled'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Security</h2>
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-center text-muted-foreground">Security logs coming soon. Admin actions will be tracked here.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}