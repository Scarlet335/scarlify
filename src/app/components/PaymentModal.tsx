'use client';
import { useState, useEffect } from 'react';
import { 
  X, Smartphone, Upload, CheckCircle, Loader2, AlertCircle, 
  ChevronDown, ChevronUp, Zap, ExternalLink, RefreshCw, HelpCircle,
  Image, File, Trash2, CreditCard, ShieldCheck, Clock, ArrowLeft,
  Link2, Phone, User, Calendar, AlertTriangle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userEmail: string;
    userId?: string;
    planId?: string;
}

type PaymentErrorType = {
    title: string;
    message: string;
    suggestions: string[];
    action: string;
    actionLink?: string;
};

type PaymentStatus = 'idle' | 'redirecting' | 'success' | 'failed' | 'pending_verification';

export default function PaymentModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    userEmail,
    userId,
    planId = 'premium'
}: PaymentModalProps) {
    const supabase = createClient();
    
    // Fapshi payment states
    const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange' | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBackupOption, setShowBackupOption] = useState(false);
    const [paymentError, setPaymentError] = useState<PaymentErrorType | null>(null);
    const [redirecting, setRedirecting] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
    const [showFallback, setShowFallback] = useState(false);
    const [paymentAttempted, setPaymentAttempted] = useState(false);
    
    // ✅ All manual payment states in one place
    const [manualProvider, setManualProvider] = useState<'MTN' | 'Orange'>('MTN');
    const [manualPhoneNumber, setManualPhoneNumber] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Payment links
    const FAPSHI_LINKS = {
        premium: 'https://pay.fapshi.com/44297647',
        pro: 'https://pay.fapshi.com/71177247',
        annual: 'https://pay.fapshi.com/71177247'
    };

    const BANK_DETAILS = {
        mtn: "671834918",
        orange: "671834918",
        bankName: "Scarlify GCE",
        accountName: "Scarlify GCE Platform",
        accountNumber: "1234567890"
    };

    // --- CREATE PAYMENT RECORD ---
    const createPaymentRecord = async (status: string, method: string, transactionId?: string) => {
        try {
            let amount = 1000;
            if (planId === 'pro' || planId === 'annual') {
                amount = 5000;
            }

            const { data, error } = await supabase
                .from('payments')
                .insert({
                    user_id: userId,
                    amount: amount,
                    payment_method: method,
                    status: status,
                    transaction_id: transactionId || null,
                    phone_number: manualPhoneNumber || phoneNumber || null,
                    provider: paymentMethod || null,
                    plan_id: planId,
                    user_email: userEmail,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error creating payment record:', err);
            return null;
        }
    };

    // --- CHECK EXISTING PAYMENT ---
    const checkExistingPayment = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['pending', 'pending_verification', 'paid'])
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                const existing = data[0];
                
                if (existing.status === 'paid') {
                    setPaymentError({
                        title: 'Already Premium!',
                        message: 'You already have an active premium subscription.',
                        suggestions: ['Your account is already upgraded', 'Enjoy all premium features'],
                        action: 'Go to Dashboard',
                    });
                    setShowBackupOption(true);
                    return;
                }

                if (existing.status === 'pending_verification') {
                    setPaymentError({
                        title: 'Payment Under Review',
                        message: 'You have already submitted a manual payment. Our team is reviewing it.',
                        suggestions: ['Please wait for admin verification (24-48 hours)', 'Check your email for updates'],
                        action: 'I Understand',
                    });
                    setShowBackupOption(true);
                    return;
                }

                if (existing.status === 'pending') {
                    const timeSince = Date.now() - new Date(existing.created_at).getTime();
                    const minutesSince = Math.floor(timeSince / (1000 * 60));

                    if (minutesSince < 10) {
                        setPaymentError({
                            title: 'Pending Payment',
                            message: `You have a pending payment from ${minutesSince} minutes ago. Please check your phone.`,
                            suggestions: ['Check your phone for a payment request', 'Make sure you have sufficient balance'],
                            action: 'I\'ll check my phone',
                        });
                        setShowBackupOption(true);
                        return;
                    }
                }
            }
        } catch (err) {
            console.error('Error checking existing payment:', err);
        }
    };

    // --- FAPSHI PAYMENT ---
    const initiateFapshiPayment = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        setLoading(true);
        setError('');
        setPaymentError(null);
        setRedirecting(true);
        setPaymentStatus('redirecting');
        setPaymentAttempted(true);

        try {
            let paymentLink;
            let planDisplayName = '';
            
            if (planId === 'premium') {
                paymentLink = FAPSHI_LINKS.premium;
                planDisplayName = 'Premium Monthly';
            } else if (planId === 'pro') {
                paymentLink = FAPSHI_LINKS.pro;
                planDisplayName = 'Pro Annual';
            } else {
                paymentLink = FAPSHI_LINKS.annual;
                planDisplayName = 'Premium Annual';
            }

            const payment = await createPaymentRecord('pending', 'fapshi');

            if (payment?.id) {
                localStorage.setItem('pending_payment', payment.id);
                localStorage.setItem('pending_plan', planId || 'premium');
                localStorage.setItem('pending_amount', payment.amount.toString());
                localStorage.setItem('payment_attempted', 'true');
            }

            setSuccess(`Redirecting to Fapshi for ${planDisplayName}...`);
            
            setTimeout(() => {
                window.location.href = paymentLink;
            }, 800);
            
        } catch (err: any) {
            setRedirecting(false);
            setPaymentStatus('failed');
            setShowFallback(true);
            setShowBackupOption(true);
            setPaymentError({
                title: 'Payment Link Issue',
                message: 'We couldn\'t open the payment link. Please upload your proof below.',
                suggestions: ['Check your internet connection', 'Upload your payment proof below'],
                action: 'Show Upload Option',
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ SUBMIT MANUAL PAYMENT (All-in-One)
    const submitManualPayment = async () => {
        console.log('🔍 submitManualPayment called');
        
        // Validate all fields
        if (!manualPhoneNumber || manualPhoneNumber.length < 9) {
            setError('Please enter a valid phone number');
            return;
        }
        if (!transactionId) {
            setError('Please enter the transaction ID');
            return;
        }
        if (!screenshot) {
            setError('Please upload a payment screenshot');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setUploadProgress(0);

        try {
            // 1. Create payment record
            console.log('📝 Creating payment record...');
            const payment = await createPaymentRecord('pending_verification', 'manual', transactionId);

            if (!payment) {
                setError('Failed to create payment request. Please try again.');
                setIsSubmitting(false);
                return;
            }

            setRequestId(payment.id);

            // 2. Upload screenshot
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const fileExt = screenshot.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, screenshot);

            clearInterval(progressInterval);
            
            if (uploadError) throw uploadError;

            setUploadProgress(95);

            const { data: { publicUrl } } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(fileName);

            // 3. Update payment record with screenshot URL
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    screenshot_url: publicUrl,
                    status: 'pending_verification'
                })
                .eq('id', payment.id);

            if (updateError) throw updateError;

            setUploadProgress(100);
            setPaymentStatus('pending_verification');
            setSuccess('✅ Payment submitted! Admin will verify within 24-48 hours.');
            
            localStorage.removeItem('payment_attempted');

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 3000);
            
        } catch (err: any) {
            console.error('❌ Submission error:', err);
            setError(err.message || 'Failed to submit. Please try again.');
            setUploadProgress(0);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RESET ---
    const resetToPrimary = () => {
        setShowBackupOption(false);
        setShowFallback(false);
        setError('');
        setSuccess('');
        setPaymentError(null);
        setPaymentMethod(null);
        setPhoneNumber('');
        setManualPhoneNumber('');
        setTransactionId('');
        setScreenshot(null);
        setScreenshotPreview(null);
        setRequestId(null);
        setUploadProgress(0);
        setRedirecting(false);
        setPaymentStatus('idle');
        setIsSubmitting(false);
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File too large. Maximum size is 5MB.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file (PNG, JPG, JPEG)');
                return;
            }
            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const removeScreenshot = () => {
        setScreenshot(null);
        setScreenshotPreview(null);
        const fileInput = document.getElementById('screenshot-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    useEffect(() => {
        if (isOpen && userId) {
            checkExistingPayment();
            const attempted = localStorage.getItem('payment_attempted');
            if (attempted === 'true') {
                setPaymentAttempted(true);
                setShowFallback(true);
                setShowBackupOption(true);
            }
        }
    }, [isOpen, userId]);

    // Auto-show fallback after redirect attempt
    useEffect(() => {
        if (paymentStatus === 'redirecting') {
            const handleVisibilityChange = () => {
                if (!document.hidden && paymentStatus === 'redirecting') {
                    setTimeout(() => {
                        setPaymentStatus('failed');
                        setShowFallback(true);
                        setShowBackupOption(true);
                        setError('Payment not completed. You can upload proof below.');
                    }, 1000);
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, [paymentStatus]);

    if (!isOpen) return null;

    const getPlanInfo = () => {
        switch(planId) {
            case 'premium':
                return { name: 'Premium Monthly', amount: '1,000 FCFA', color: 'text-amber-600', duration: '30 days' };
            case 'pro':
                return { name: 'Pro Annual', amount: '5,000 FCFA', color: 'text-purple-600', duration: '365 days' };
            case 'annual':
                return { name: 'Premium Annual', amount: '5,000 FCFA', color: 'text-indigo-600', duration: '365 days' };
            default:
                return { name: 'Premium', amount: '1,000 FCFA', color: 'text-amber-600', duration: '30 days' };
        }
    };

    const planInfo = getPlanInfo();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            Upgrade to {planInfo.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {planInfo.duration} access • {planInfo.amount}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Error/Success */}
                    {error && !paymentError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start text-sm border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center text-sm border border-green-200 dark:border-green-800">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>{success}</span>
                            {redirecting && (
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            )}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    )}

                    {/* Payment Error Details */}
                    {paymentError && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-800 dark:text-red-300">{paymentError.title}</h4>
                                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{paymentError.message}</p>
                                    {paymentError.suggestions && (
                                        <div className="mt-2">
                                            <p className="text-xs font-semibold text-red-800 dark:text-red-300">Try this:</p>
                                            <ul className="text-xs text-red-700 dark:text-red-400 mt-1 space-y-1 list-disc list-inside">
                                                {paymentError.suggestions.map((suggestion, index) => (
                                                    <li key={index}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {paymentError.action && (
                                        <button
                                            onClick={() => {
                                                if (paymentError.action === 'Show Upload Option') {
                                                    setShowBackupOption(true);
                                                    setPaymentError(null);
                                                } else if (paymentError.action === 'Try Again') {
                                                    setPaymentError(null);
                                                    setError('');
                                                    setShowBackupOption(false);
                                                    setShowFallback(false);
                                                } else if (paymentError.action === 'I Understand') {
                                                    setPaymentError(null);
                                                    onClose();
                                                } else if (paymentError.action === 'Go to Dashboard') {
                                                    onClose();
                                                } else {
                                                    setPaymentError(null);
                                                }
                                            }}
                                            className="mt-3 text-sm text-red-700 dark:text-red-400 font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            {paymentError.action}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PRIMARY PAYMENT FLOW - FAPSHI */}
                    {!showBackupOption && !paymentError && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${planInfo.color} dark:text-green-300`}>
                                            {planInfo.name} - {planInfo.amount}
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-400">
                                            Pay with MTN/Orange Money • Instant access ⚡
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    Pay via Mobile Money
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                    You will be redirected to Fapshi to complete payment securely
                                </p>
                                <div className="mt-3 flex justify-center gap-3">
                                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">MTN</span>
                                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-semibold">Orange</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-2">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => { setPaymentMethod('mtn'); setError(''); }}
                                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'mtn'
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                                        }`}
                                    >
                                        <div className="text-3xl mb-1">📱</div>
                                        <div className="font-semibold text-sm dark:text-white">MTN Mobile Money</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Instant</div>
                                    </button>
                                    <button
                                        onClick={() => { setPaymentMethod('orange'); setError(''); }}
                                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'orange'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="text-3xl mb-1">📱</div>
                                        <div className="font-semibold text-sm dark:text-white">Orange Money</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Instant</div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    Your Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX or 7XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                        if (error) setError('');
                                    }}
                                    className="w-full border dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <button
                                onClick={initiateFapshiPayment}
                                disabled={loading || !paymentMethod}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {redirecting ? 'Redirecting...' : 'Processing...'}
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-5 h-5" />
                                        Pay with Mobile Money
                                    </>
                                )}
                            </button>

                            <div className="mt-3 pt-3 border-t dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        setShowBackupOption(true);
                                        setPaymentError(null);
                                        setShowFallback(true);
                                    }}
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center w-full gap-1"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                    Having payment issues? Upload proof instead
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ✅ ALL-IN-ONE FALLBACK PAYMENT FLOW */}
                    {showBackupOption && (
                        <div className="space-y-4">
                            <button
                                onClick={resetToPrimary}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to instant payment
                            </button>

                            {showFallback && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Universal Fallback</p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                Payment link not working? Fill in the form below and upload your proof.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Manual Payment - 24-48 Hours</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                            This option requires admin verification. For instant activation, use Mobile Money above.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Send payment to:</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MTN Mobile Money</span>
                                        <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{BANK_DETAILS.mtn}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Orange Money</span>
                                        <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">{BANK_DETAILS.orange}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">📋 Fill in all fields below:</p>
                                <ol className="text-xs text-blue-600 dark:text-blue-300 mt-1 space-y-1 list-decimal list-inside">
                                    <li>Enter your phone number</li>
                                    <li>Enter the transaction ID from your payment</li>
                                    <li>Upload a screenshot of the transaction confirmation</li>
                                    <li>Submit for admin verification (within 24-48 hours)</li>
                                </ol>
                            </div>

                            {/* ✅ All fields in one place */}
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Your Mobile Money Provider</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setManualProvider('MTN')}
                                        className={`flex-1 py-2.5 rounded-lg border font-semibold transition-all ${
                                            manualProvider === 'MTN'
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                                : 'border-gray-300 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        MTN
                                    </button>
                                    <button
                                        onClick={() => setManualProvider('Orange')}
                                        className={`flex-1 py-2.5 rounded-lg border font-semibold transition-all ${
                                            manualProvider === 'Orange'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                                                : 'border-gray-300 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        Orange
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    Your Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX"
                                    value={manualPhoneNumber}
                                    onChange={(e) => setManualPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    className="w-full border dark:border-gray-700 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    Transaction ID / Reference <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., TRX-12345678"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full border dark:border-gray-700 rounded-lg p-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                                    Payment Screenshot <span className="text-red-500">*</span>
                                </label>
                                {screenshotPreview ? (
                                    <div className="relative border dark:border-gray-700 rounded-lg overflow-hidden">
                                        <img 
                                            src={screenshotPreview} 
                                            alt="Payment screenshot" 
                                            className="w-full max-h-48 object-contain bg-gray-50 dark:bg-gray-800"
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/70 p-2 rounded-lg">
                                            <span className="text-xs text-white truncate">
                                                {screenshot?.name} ({formatFileSize(screenshot?.size || 0)})
                                            </span>
                                            <button
                                                onClick={removeScreenshot}
                                                className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleScreenshotChange}
                                            className="hidden"
                                            id="screenshot-upload"
                                        />
                                        <label htmlFor="screenshot-upload" className="cursor-pointer block">
                                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload screenshot</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, JPEG • Max 5MB</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">📱 Take a screenshot of your transaction confirmation</p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={submitManualPayment}
                                disabled={isSubmitting || !manualPhoneNumber || !transactionId || !screenshot}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Submit for Verification
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Admin verification: 24-48 hours • You'll receive an email confirmation
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}