import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { userId, title, message, type, data } = await request.json();
    
    // ✅ Correct: Server client - await is needed here
    const supabase = await createClient();

    // Save to database
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Get user email and preferences
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User fetch error:', userError);
    }

    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Send email if enabled
    const shouldSendEmail = 
      (type === 'reminder' && preferences?.reminder_alerts) ||
      (type === 'quiz_alert' && preferences?.quiz_alerts) ||
      (type === 'announcement' && preferences?.announcement_alerts);

    if (shouldSendEmail && userData?.email) {
      await resend.emails.send({
        from: 'Scarlify <notifications@scarlify.com>',
        to: userData.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7C3AED, #F59E0B); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Scarlify</h1>
            </div>
            <div style="padding: 20px;">
              <h2>${title}</h2>
              <p>${message}</p>
              ${data?.link ? `<a href="${data.link}" style="background: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">View Details</a>` : ''}
            </div>
            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>You received this email because you're a Scarlify user.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/student-dashboard/settings/notifications">Manage notification preferences</a></p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}