import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user after successful sign in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if profile exists, if not create it
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, created_at')
        .eq('id', user.id)
        .single();
      
      const isNewUser = !existingProfile;
      
      // Create profile if it doesn't exist
      if (isNewUser) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
          subscription_tier: 'Free',
          is_admin: false
        });
        
        // Send welcome email to new users
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
        
        const welcomeHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7C3AED, #F59E0B); padding: 20px; text-align: center;">
              <h1 style="color: white;">Welcome to Scarlify! 🎓</h1>
            </div>
            <div style="padding: 20px;">
              <h2>Hello ${userName}!</h2>
              <p>Welcome to Scarlify, Cameroon's premier GCE exam prep platform.</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>🤖 Ask our AI Tutor any question 24/7</li>
                <li>📚 Practice with 20+ years of past questions</li>
                <li>📊 Track your progress and compete on leaderboards</li>
                <li>🎯 Take subject-specific quizzes</li>
              </ul>
              <a href="${requestUrl.origin}/student-dashboard" style="background: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Go to Dashboard →</a>
              <p style="margin-top: 20px;">Good luck with your GCE exams! 💪</p>
              <p>- The Scarlify Team</p>
            </div>
          </div>
        `;
        
        // Send email asynchronously
        fetch(`${requestUrl.origin}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: 'Welcome to Scarlify! 🎓',
            html: welcomeHtml,
            name: userName
          })
        }).catch(err => console.error('Welcome email error:', err));
      }
      
      // CHECK IF USER IS ADMIN AND REDIRECT ACCORDINGLY
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (profile?.is_admin === true) {
        // Admin goes to admin panel
        return NextResponse.redirect(new URL('/content-management', requestUrl.origin));
      } else {
        // Student goes to student dashboard
        return NextResponse.redirect(new URL('/student-dashboard', requestUrl.origin));
      }
    }
  }

  // Default redirect (should not reach here normally)
  return NextResponse.redirect(new URL('/student-dashboard', requestUrl.origin));
}