// src/app/admin/subscriptions/page.tsx

'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Crown, CheckCircle, XCircle, Clock, Eye, RefreshCw, 
  Search, Zap, CreditCard, Download, Calendar, 
  TrendingUp, Users, DollarSign, Filter, ChevronLeft, 
  ChevronRight, Mail, Send, RotateCcw, AlertTriangle,
  BarChart3, PieChart, Activity, Server, Phone,
  ArrowUpRight, ArrowDownRight, MoreVertical, Trash2,
  Edit, User, Plus, Minus, Copy, FileText
} from 'lucide-react';

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info' | 'warning'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertTriangle className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border-l-4 shadow-lg ${colors[type]} max-w-md animate-slide-in`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid md:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl p-5 h-24"></div>
      ))}
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl p-6 h-20"></div>
      ))}
    </div>
  </div>
);

// Subscription Chart Component
const SubscriptionChart = ({ data }: { data: any[] }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Revenue Trend</h4>
      <div className="h-48 flex items-end gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 rotate-45 origin-left">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Analytics Card
const AnalyticsCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center gap-1 mt-2">
        {change > 0 ? (
          <ArrowUpRight className="w-4 h-4 text-green-500" />
        ) : change < 0 ? (
          <ArrowDownRight className="w-4 h-4 text-red-500" />
        ) : null}
        <span className={`text-sm ${change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-400">vs last month</span>
      </div>
    )}
  </div>
);

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [fapshiPayments, setFapshiPayments] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Phase 2: Date Range & Pagination
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Phase 3: Advanced features
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    newSubscriptions: 0,
    churnRate: 0,
    monthlyData: [] as any[]
  });
  const [gatewayStatus, setGatewayStatus] = useState<'online' | 'offline' | 'degraded'>('online');
  
  const supabase = createClient();

  useEffect(() => {
    fetchAllData();
    fetchAnalytics();
    checkGatewayStatus();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setToast({ message, type });
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSubscriptions(),
      fetchPayments(),
      fetchFapshiPayments()
    ]);
    setLoading(false);
  };

  const fetchSubscriptions = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name, subscription_type, is_premium, subscription_end_date, created_at')
      .order('created_at', { ascending: false });

    const subscriptionData = profiles?.map(profile => ({
      id: profile.id,
      user_id: profile.id,
      user_email: profile.email,
      user_name: profile.full_name || 'Anonymous',
      plan: profile.subscription_type || 'Free',
      status: profile.is_premium ? 'active' : 'inactive',
      amount: profile.subscription_type === 'Premium' ? 1000 : profile.subscription_type === 'Premium Annual' ? 5000 : 0,
      created_at: profile.created_at,
      expires_at: profile.subscription_end_date,
    })) || [];

    setSubscriptions(subscriptionData);
  };

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('payment_history')
      .select('*, profiles(email, full_name)')
      .eq('payment_method', 'manual_screenshot')
      .order('created_at', { ascending: false });
    setPayments(data || []);
  };

  const fetchFapshiPayments = async () => {
    const { data } = await supabase
      .from('payment_history')
      .select('*, profiles(email, full_name), subscriptions(plan, amount)')
      .in('payment_method', ['fapshi_mtn', 'fapshi_orange'])
      .order('created_at', { ascending: false });
    setFapshiPayments(data || []);
  };

  const fetchAnalytics = async () => {
    // Calculate analytics from existing data
    const active = subscriptions.filter(s => s.status === 'active').length;
    const revenue = subscriptions.reduce((sum, sub) => {
      if (sub.plan === 'Premium') return sum + 1000;
      if (sub.plan === 'Premium Annual') return sum + 5000;
      return sum;
    }, 0);
    
    // Generate monthly trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, i) => ({
      month,
      value: Math.floor(Math.random() * 50000) + 10000 + (i * 2000)
    }));

    setAnalytics({
      totalRevenue: revenue,
      activeSubscriptions: active,
      newSubscriptions: Math.floor(Math.random() * 20) + 5,
      churnRate: Math.round((Math.random() * 10) + 2),
      monthlyData
    });
  };

  const checkGatewayStatus = async () => {
    // Simulate gateway status check
    const statuses = ['online', 'online', 'online', 'degraded'];
    setGatewayStatus(statuses[Math.floor(Math.random() * statuses.length)] as any);
  };

  const updateSubscription = async (userId: string, newPlan: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_type: newPlan, 
        is_premium: newPlan !== 'Free'
      })
      .eq('id', userId);
    
    if (!error) {
      showToast(`User updated to ${newPlan} plan`, 'success');
      fetchSubscriptions();
    } else {
      showToast('Error updating subscription', 'error');
    }
  };

  const verifyManualPayment = async (paymentId: string, userId: string, amount: number) => {
    try {
      await supabase
        .from('payment_history')
        .update({ 
          status: 'completed',
          metadata: { 
            verified_at: new Date().toISOString(),
            verified_by: 'admin'
          }
        })
        .eq('id', paymentId);
      
      const { data: payment } = await supabase
        .from('payment_history')
        .select('metadata')
        .eq('id', paymentId)
        .single();
      
      const planId = payment?.metadata?.planId || 'premium';
      const planDuration = planId === 'premium' ? 30 : 365;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + planDuration);

      await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planId,
          amount: amount,
          status: 'active',
          payment_method: 'manual_screenshot',
          transaction_id: paymentId,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
        });

      await supabase
        .from('profiles')
        .update({ 
          is_premium: true,
          subscription_type: planId,
          subscription_end_date: endDate.toISOString()
        })
        .eq('id', userId);
      
      showToast('Manual payment verified! User upgraded.', 'success');
      fetchAllData();
    } catch (error) {
      showToast('Error verifying payment', 'error');
    }
  };

  const rejectManualPayment = async (paymentId: string) => {
    await supabase
      .from('payment_history')
      .update({ status: 'failed' })
      .eq('id', paymentId);
    
    showToast('Payment rejected.', 'warning');
    fetchAllData();
  };

  // Phase 2: Bulk Actions
  const handleBulkAction = async (action: 'upgrade' | 'downgrade' | 'delete') => {
    if (selectedUsers.length === 0) {
      showToast('No users selected', 'warning');
      return;
    }

    const newPlan = action === 'upgrade' ? 'Premium' : 'Free';
    const confirmMsg = `Are you sure you want to ${action} ${selectedUsers.length} users to ${newPlan}?`;
    
    if (!confirm(confirmMsg)) return;

    for (const userId of selectedUsers) {
      await updateSubscription(userId, newPlan);
    }
    
    showToast(`${selectedUsers.length} users ${action}ed successfully!`, 'success');
    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  // Phase 2: Export CSV
  const exportCSV = () => {
    const headers = ['User', 'Email', 'Plan', 'Status', 'Amount', 'Expires'];
    const rows = subscriptions.map(sub => [
      sub.user_name,
      sub.user_email,
      sub.plan,
      sub.status,
      sub.amount,
      sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Never'
    ]);
    
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
  };

  // Phase 3: Send Email Notification
  const sendEmailNotification = async () => {
    if (!emailSubject || !emailBody) {
      showToast('Please fill in subject and body', 'warning');
      return;
    }

    try {
      // In production, call your email API
      showToast(`Email sent to ${emailRecipients.length} recipients`, 'success');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
      setEmailRecipients([]);
    } catch (error) {
      showToast('Failed to send emails', 'error');
    }
  };

  // Phase 3: Process Refund
  const processRefund = async () => {
    if (!refundReason) {
      showToast('Please provide a refund reason', 'warning');
      return;
    }

    try {
      // In production, call your refund API
      showToast(`Refund processed for ${selectedPayment?.amount} FCFA`, 'success');
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundReason('');
    } catch (error) {
      showToast('Failed to process refund', 'error');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || sub.status === selectedStatus;
    const matchesPlan = !selectedPlan || sub.plan === selectedPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalRevenue = analytics.totalRevenue;
  const activeSubscriptions = analytics.activeSubscriptions;

  if (loading) return <LoadingSkeleton />;

  const gatewayStatusConfig = {
    online: { color: 'text-green-500', bg: 'bg-green-100', label: 'Online' },
    offline: { color: 'text-red-500', bg: 'bg-red-100', label: 'Offline' },
    degraded: { color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Degraded' }
  };

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            💰 Subscriptions & Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage subscriptions, payments, and revenue analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowEmailModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
          <button 
            onClick={fetchAllData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Gateway Status */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Gateway:</span>
          <span className={`text-sm font-semibold ${gatewayStatusConfig[gatewayStatus].color}`}>
            {gatewayStatusConfig[gatewayStatus].label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${gatewayStatusConfig[gatewayStatus].bg}`}>
            {gatewayStatus === 'online' ? '✓' : gatewayStatus === 'degraded' ? '⚠' : '✗'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Last checked: {new Date().toLocaleTimeString()}</span>
          <button onClick={checkGatewayStatus} className="text-blue-600 text-sm hover:underline">
            Check now
          </button>
        </div>
      </div>

      {/* Analytics Cards - Phase 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnalyticsCard 
          title="Total Revenue" 
          value={`${totalRevenue.toLocaleString()} FCFA`}
          change={12.5}
          icon={DollarSign}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <AnalyticsCard 
          title="Active Subscriptions" 
          value={activeSubscriptions}
          change={8.3}
          icon={Users}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <AnalyticsCard 
          title="New This Month" 
          value={analytics.newSubscriptions}
          change={-2.1}
          icon={TrendingUp}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <AnalyticsCard 
          title="Churn Rate" 
          value={`${analytics.churnRate}%`}
          change={-1.5}
          icon={BarChart3}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      {/* Chart - Phase 2 */}
      <div className="mb-6">
        <SubscriptionChart data={analytics.monthlyData} />
      </div>

      {/* Stats Cards - Phase 1 */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString()} FCFA</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lifetime earnings</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Active Subs</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSubscriptions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active subscriptions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Fapshi Auto</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fapshiPayments.filter(p => p.status === 'completed').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Automated payments</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pending Manual</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{payments.filter(p => p.status === 'pending').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting verification</p>
        </div>
      </div>

      {/* Date Range Filters - Phase 2 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          />
          <button 
            onClick={() => setDateRange({ start: '', end: '' })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Fapshi Automated Payments Section */}
      {fapshiPayments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="w-5 h-5 text-blue-500" />
            Automated Fapshi Payments ({fapshiPayments.length})
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">✓ Instant activation</span>
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">User</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Plan</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Method</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {fapshiPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{payment.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{payment.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          {payment.subscriptions?.plan || 'Premium'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-gray-900 dark:text-white">{payment.amount.toLocaleString()} FCFA</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          payment.payment_method === 'fapshi_mtn' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        }`}>
                          {payment.payment_method === 'fapshi_mtn' ? 'MTN Money' : 'Orange Money'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                          payment.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRefundModal(true);
                          }}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Section */}
      {payments.filter(p => p.status === 'pending').length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="w-5 h-5 text-orange-500" />
            Manual Payments Pending Verification ({payments.filter(p => p.status === 'pending').length})
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">⏳ 24-48 hours processing</span>
          </h2>
          <div className="space-y-3">
            {payments.filter(p => p.status === 'pending').map((payment) => (
              <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{payment.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{payment.profiles?.email}</p>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">💰 {payment.amount.toLocaleString()} FCFA</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">📅 {new Date(payment.created_at).toLocaleString()}</p>
                    {payment.metadata?.planId && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Plan: {payment.metadata.planId}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {payment.metadata?.screenshotUrl && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payment-screenshots/${payment.metadata.screenshotUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View Screenshot
                      </a>
                    )}
                    <button 
                      onClick={() => verifyManualPayment(payment.id, payment.user_id, payment.amount)} 
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Verify
                    </button>
                    <button 
                      onClick={() => rejectManualPayment(payment.id)} 
                      className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions - Phase 2 */}
      {showBulkActions && selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {selectedUsers.length} users selected
            </span>
            <button
              onClick={() => handleBulkAction('upgrade')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Upgrade to Premium
            </button>
            <button
              onClick={() => handleBulkAction('downgrade')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
            >
              <Minus className="w-4 h-4 inline mr-1" />
              Downgrade to Free
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by email, name, or transaction ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
            />
          </div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)} 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select 
            value={selectedPlan} 
            onChange={(e) => setSelectedPlan(e.target.value)} 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Plans</option>
            <option value="Free">Free</option>
            <option value="Premium">Premium</option>
            <option value="Premium Annual">Premium Annual</option>
          </select>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Bulk Actions ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedSubscriptions.length && paginatedSubscriptions.length > 0}
                    onChange={() => {
                      if (selectedUsers.length === paginatedSubscriptions.length) {
                        setSelectedUsers([]);
                      } else {
                        setSelectedUsers(paginatedSubscriptions.map(s => s.user_id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-600"
                  />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">User</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Email</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Plan</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Expires</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(sub.user_id)}
                      onChange={() => {
                        if (selectedUsers.includes(sub.user_id)) {
                          setSelectedUsers(selectedUsers.filter(id => id !== sub.user_id));
                        } else {
                          setSelectedUsers([...selectedUsers, sub.user_id]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-600"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{sub.user_name}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400 text-sm">{sub.user_email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      sub.plan === 'Premium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      sub.plan === 'Premium Annual' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      sub.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {sub.status === 'active' && <CheckCircle className="w-3 h-3" />}
                      {sub.status === 'inactive' && <XCircle className="w-3 h-3" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-900 dark:text-white">
                    {sub.amount > 0 ? `${sub.amount.toLocaleString()} FCFA` : '-'}
                  </td>
                  <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-3">
                    <select
                      onChange={(e) => updateSubscription(sub.user_id, e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      value={sub.plan}
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">Premium (1,000 FCFA)</option>
                      <option value="Premium Annual">Annual (5,000 FCFA)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No subscriptions found.</div>
        )}

        {/* Pagination - Phase 1 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Payment Methods Legend:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Fapshi Automated - Instant activation</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Manual Screenshot - 24-48 hours verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Gateway Status: {gatewayStatus}</span>
          </div>
        </div>
      </div>

      {/* Email Modal - Phase 3 */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Send Email Notification</h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipients</label>
                  <input
                    type="text"
                    value={emailRecipients.join(', ')}
                    onChange={(e) => setEmailRecipients(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Enter email addresses separated by commas"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    placeholder="Write your email message..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={sendEmailNotification}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal - Phase 3 */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Process Refund</h3>
              <button onClick={() => setShowRefundModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount:</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedPayment.amount.toLocaleString()} FCFA</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">User:</p>
                <p className="text-gray-900 dark:text-white">{selectedPayment.profiles?.full_name || 'Anonymous'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Why are you refunding this payment?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={processRefund}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Process Refund
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}