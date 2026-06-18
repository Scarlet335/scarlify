'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Shield, Users, Crown, Settings, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

export default function SuperAdminPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAdmins: 0,
        totalUsers: 0,
        totalRevenue: 0,
        activeSubscriptions: 0
    });
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch admin users
        const { data: adminData } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['admin', 'super_admin']);
        
        setAdmins(adminData || []);

        // Fetch total users
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Fetch revenue
        const { data: subscriptions } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('payment_verified', true);

        const revenue = subscriptions?.reduce((sum, sub) => {
            if (sub.subscription_tier === 'Premium') return sum + 2500;
            if (sub.subscription_tier === 'Pro') return sum + 20000;
            return sum;
        }, 0) || 0;

        const activeSubs = subscriptions?.length || 0;

        setStats({
            totalAdmins: adminData?.length || 0,
            totalUsers: totalUsers || 0,
            totalRevenue: revenue,
            activeSubscriptions: activeSubs
        });

        setLoading(false);
    };

    const handleMakeAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
        fetchData();
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading super admin panel...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Panel</h1>
                    <p className="text-gray-500 dark:text-gray-400">System-wide administration and oversight</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <Users className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Users</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <Shield className="w-5 h-5 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</p>
                    <p className="text-sm text-gray-500">Admin Users</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <Crown className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeSubscriptions}</p>
                    <p className="text-sm text-gray-500">Active Subscriptions</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <Activity className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue.toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
            </div>

            {/* Admin Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">👥 Admin Users Management</h2>
                    <p className="text-sm text-gray-500">Manage system administrators</p>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-left text-gray-700 dark:text-gray-300">User</th>
                            <th className="p-3 text-left text-gray-700 dark:text-gray-300">Email</th>
                            <th className="p-3 text-left text-gray-700 dark:text-gray-300">Role</th>
                            <th className="p-3 text-left text-gray-700 dark:text-gray-300">Joined</th>
                            <th className="p-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{admin.full_name || 'Anonymous'}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-400">{admin.email}</td>
                                <td className="p-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        admin.role === 'super_admin' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {admin.role || 'user'}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                    {admin.role !== 'super_admin' && (
                                        <button
                                            onClick={() => handleMakeAdmin(admin.id, admin.role || 'user')}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            {admin.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}