'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CheckCircle, XCircle, Clock, Download, Mail, Loader2 } from 'lucide-react';

export default function VerifyPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        const { data } = await supabase
            .from('payment_requests')
            .select('*, profiles(email, full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        setPayments(data || []);
        setLoading(false);
    };

    const sendEmailNotification = async (to: string, name: string, plan: string) => {
        const html = `
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
                    <p>- The Scarlify Team</p>
                </div>
            </div>
        `;

        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: to,
                    subject: '🎉 Payment Verified! You are now Premium',
                    html: html,
                    name: name
                })
            });
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    };

    const verifyPayment = async (paymentId: string, userId: string, userEmail: string, userName: string) => {
        setVerifyingId(paymentId);
        
        // Update payment status
        await supabase
            .from('payment_requests')
            .update({ status: 'verified', verified_at: new Date().toISOString() })
            .eq('id', paymentId);

        // Upgrade user to Premium
        await supabase
            .from('profiles')
            .update({ subscription_tier: 'Premium', payment_verified: true })
            .eq('id', userId);

        // Send email notification
        await sendEmailNotification(userEmail, userName || 'Student', 'Premium');

        alert('User upgraded to Premium and email sent!');
        fetchPayments();
        setVerifyingId(null);
    };

    const rejectPayment = async (paymentId: string) => {
        if (confirm('Reject this payment request? The user will not be upgraded.')) {
            await supabase
                .from('payment_requests')
                .update({ status: 'rejected' })
                .eq('id', paymentId);
            fetchPayments();
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Loading payments...</span>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-2">💰 Verify Mobile Money Payments</h1>
            <p className="text-gray-500 mb-6">Approve pending payment requests to upgrade users to Premium</p>

            {payments.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-500">No pending payments</p>
                </div>
            )}

            <div className="grid gap-4">
                {payments.map((payment) => (
                    <div key={payment.id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg">{payment.profiles?.full_name || 'Anonymous'}</p>
                                <p className="text-sm text-gray-500">{payment.profiles?.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-primary">{payment.amount?.toLocaleString()} FCFA</p>
                                <p className="text-xs text-gray-400">{new Date(payment.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div>
                                <p className="text-xs text-gray-500">Phone Number</p>
                                <p className="font-mono">{payment.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Provider</p>
                                <p>{payment.provider}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Transaction ID</p>
                                <p className="font-mono text-sm">{payment.transaction_id || 'Not provided'}</p>
                            </div>
                            {payment.transaction_screenshot && (
                                <div>
                                    <p className="text-xs text-gray-500">Screenshot</p>
                                    <a 
                                        href={payment.transaction_screenshot} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary text-sm flex items-center gap-1 hover:underline"
                                    >
                                        <Download className="w-3 h-3" />
                                        View Screenshot
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4 pt-3 border-t">
                            <button
                                onClick={() => verifyPayment(
                                    payment.id, 
                                    payment.user_id, 
                                    payment.profiles?.email, 
                                    payment.profiles?.full_name
                                )}
                                disabled={verifyingId === payment.id}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifyingId === payment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {verifyingId === payment.id ? 'Processing...' : 'Verify & Upgrade'}
                            </button>
                            <button
                                onClick={() => rejectPayment(payment.id)}
                                disabled={verifyingId === payment.id}
                                className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject
                            </button>
                        </div>
                        
                        {/* Email indicator */}
                        <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email will be sent to {payment.profiles?.email} upon verification
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}