'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Save, RefreshCw, Shield, Bell, Globe, Lock } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'Scarlify',
        maintenanceMode: false,
        allowRegistrations: true,
        emailNotifications: true,
        aiTutorEnabled: true,
        quizLimit: 3
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const { data } = await supabase
            .from('platform_settings')
            .select('*');
        
        if (data && data.length > 0) {
            const settingsObj: any = {};
            data.forEach((s: any) => {
                settingsObj[s.key] = s.value;
            });
            setSettings(prev => ({ ...prev, ...settingsObj }));
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        
        for (const [key, value] of Object.entries(settings)) {
            await supabase
                .from('platform_settings')
                .upsert({ key, value, updated_at: new Date() });
        }
        
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⚙️ Platform Settings</h1>

            {saved && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                    Settings saved successfully!
                </div>
            )}

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Globe className="w-5 h-5 text-primary" />
                        General Settings
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Site Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 max-w-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Take the site offline for maintenance</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Allow New Registrations</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to sign up</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.allowRegistrations}
                                    onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Bell className="w-5 h-5 text-primary" />
                        Feature Settings
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send email notifications to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">AI Tutor</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Enable/disable AI Tutor feature</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.aiTutorEnabled}
                                    onChange={(e) => setSettings({ ...settings, aiTutorEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Free User Quiz Limit</label>
                            <input
                                type="number"
                                className="w-32 border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={settings.quizLimit}
                                onChange={(e) => setSettings({ ...settings, quizLimit: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Questions per day for free users</p>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <Shield className="w-5 h-5" />
                        Danger Zone
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-400">Clear All Cache</p>
                                <p className="text-sm text-red-600 dark:text-red-300">Clear all cached data from the platform</p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                <RefreshCw className="w-4 h-4 inline mr-2" />
                                Clear Cache
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-red-700 dark:text-red-400">Reset All User Sessions</p>
                                <p className="text-sm text-red-600 dark:text-red-300">Force all users to log in again</p>
                            </div>
                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Reset Sessions
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}