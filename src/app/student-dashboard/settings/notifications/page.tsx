'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bell, Mail, Calendar, Zap, Megaphone, Save, CheckCircle } from 'lucide-react';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_alerts: boolean;
  quiz_alerts: boolean;
  announcement_alerts: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    reminder_alerts: true,
    quiz_alerts: true,
    announcement_alerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const supabase = createClient();

  useEffect(() => {
    loadPreferences();
    checkPushPermission();
  }, []);

  const checkPushPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const requestPushPermission = async () => {
    const permission = await Notification.requestPermission();
    setPushPermission(permission);
    if (permission === 'granted') {
      alert('Notifications enabled! You will now receive updates.');
    }
  };

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences(data);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settings = [
    { 
      key: 'email_notifications', 
      label: 'Email Notifications', 
      icon: Mail, 
      description: 'Receive notifications via email' 
    },
    { 
      key: 'push_notifications', 
      label: 'Push Notifications', 
      icon: Bell, 
      description: 'Receive browser notifications',
      requiresPermission: true
    },
    { 
      key: 'reminder_alerts', 
      label: 'Study Reminders', 
      icon: Calendar, 
      description: 'Get daily study reminders' 
    },
    { 
      key: 'quiz_alerts', 
      label: 'Quiz Alerts', 
      icon: Zap, 
      description: 'Get notified about recommended quizzes' 
    },
    { 
      key: 'announcement_alerts', 
      label: 'Announcements', 
      icon: Megaphone, 
      description: 'Platform news and updates' 
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🔔 Notification Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Manage how you receive notifications</p>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}

      {/* Push Notification Permission Button */}
      {pushPermission !== 'granted' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Enable push notifications to get alerts even when you're not on the site.
          </p>
          <button
            onClick={requestPushPermission}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Enable Push Notifications
          </button>
        </div>
      )}

      <div className="space-y-4">
        {settings.map((setting) => {
          const Icon = setting.icon;
          const value = preferences[setting.key as keyof NotificationPreferences];
          return (
            <div key={setting.key} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{setting.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={value}
                    onChange={(e) => setPreferences({ ...preferences, [setting.key]: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}