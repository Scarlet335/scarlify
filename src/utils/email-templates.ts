export const emailTemplates = {
    welcome: (name: string) => ({
        subject: 'Welcome to Scarlify! 🎓',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7C3AED, #F59E0B); padding: 20px; text-align: center;">
                    <h1 style="color: white;">Welcome to Scarlify</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello ${name}!</h2>
                    <p>Welcome to Scarlify, Cameroon's premier GCE exam prep platform.</p>
                    <p>Here's what you can do:</p>
                    <ul>
                        <li>🤖 Ask our AI Tutor any question 24/7</li>
                        <li>📚 Practice with 20+ years of past questions</li>
                        <li>📊 Track your progress and compete on leaderboards</li>
                        <li>🎯 Take subject-specific quizzes</li>
                    </ul>
                    <a href="https://scarlify.com/student-dashboard" style="background: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Go to Dashboard →</a>
                    <p style="margin-top: 20px;">Good luck with your GCE exams! 💪</p>
                    <p>- The Scarlify Team</p>
                </div>
            </div>
        `
    }),

    paymentVerified: (name: string, plan: string) => ({
        subject: '🎉 Payment Verified! You are now Premium',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; text-align: center;">
                    <h1 style="color: white;">Payment Verified! ✅</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello ${name}!</h2>
                    <p>Your payment has been verified successfully.</p>
                    <p>You are now on the <strong>${plan}</strong> plan! 🎉</p>
                    <p>Here's what you can now access:</p>
                    <ul>
                        <li>✅ Unlimited AI Tutor questions</li>
                        <li>✅ All 20+ years of past questions</li>
                        <li>✅ Download lessons for offline use</li>
                        <li>✅ Detailed analytics and progress tracking</li>
                    </ul>
                    <a href="https://scarlify.com/student-dashboard" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Access Premium Content →</a>
                    <p style="margin-top: 20px;">Thank you for supporting Scarlify!</p>
                </div>
            </div>
        `
    }),

    quizCompleted: (name: string, subject: string, score: number) => ({
        subject: `📊 Quiz Result: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #7C3AED; padding: 20px; text-align: center;">
                    <h1 style="color: white;">Quiz Completed! 🎯</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello ${name}!</h2>
                    <p>You completed a quiz on <strong>${subject}</strong>.</p>
                    <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 10px;">
                        <p style="font-size: 48px; font-weight: bold; margin: 0;">${score}%</p>
                        <p style="color: #6B7280;">Your Score</p>
                    </div>
                    <a href="https://scarlify.com/quiz" style="background: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">Take Another Quiz →</a>
                </div>
            </div>
        `
    }),

    paymentRequestReceived: (name: string, amount: number, reference: string) => ({
        subject: '💰 Payment Request Received',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #F59E0B; padding: 20px; text-align: center;">
                    <h1 style="color: white;">Payment Request Received</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Hello ${name}!</h2>
                    <p>We have received your payment request for <strong>${amount.toLocaleString()} FCFA</strong>.</p>
                    <p><strong>Reference:</strong> ${reference}</p>
                    <p>Please send payment to the provided MTN/Orange number and upload the screenshot.</p>
                    <p>Once verified, your account will be upgraded within 24 hours.</p>
                    <a href="https://scarlify.com/student-dashboard" style="background: #F59E0B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Check Status →</a>
                </div>
            </div>
        `
    }),
};