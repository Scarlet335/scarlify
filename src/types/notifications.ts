export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'quiz_alert' | 'announcement' | 'streak' | 'achievement';
  is_read: boolean;
  created_at: string;
  data?: {
    link?: string;
    quiz_id?: string;
    lesson_id?: string;
  };
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  reminder_alerts: boolean;
  quiz_alerts: boolean;
  announcement_alerts: boolean;
}