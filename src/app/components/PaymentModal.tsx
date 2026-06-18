'use client';
import { useState } from 'react';
import { X, Smartphone, Upload, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Zap, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userEmail: string;
    userId?: string;
    planId?: string;
}

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
    
    // Manual payment states
    const [step, setStep] = useState<'info' | 'payment' | 'upload'>('info');
    const [provider, setProvider] = useState<'MTN' | 'Orange'>('MTN');
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    
    // Payment links (YOUR TWO FAPSHI LINKS)
    const FAPSHI_LINKS = {
        premium: 'https://pay.fapshi.com/44297647',      // 1,000 XAF
        annual: 'https://pay.fapshi.com/71177247'        // 5,000 XAF
    };

    // YOUR BANK DETAILS for manual payment
    const BANK_DETAILS = {
        mtn: "671834918",
        orange: "671834918",
        bankName: "Example Bank",
        accountName: "Scarlify GCE",
        accountNumber: "1234567890"
    };

    // --- CREATE PAYMENT RECORD ---
    const createPaymentRecord = async (status: string, method: string, transactionId?: string) => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .insert({
                    user_id: userId,
                    amount: planId === 'premium' ? 1000 : 5000,
                    payment_method: method,
                    status: status,
                    transaction_id: transactionId || null,
                    phone_number: phoneNumber || null,
                    provider: paymentMethod || null,
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

    // --- FAPSHI PAYMENT (DIRECT LINK) ---
    const initiateFapshiPayment = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get the correct payment link
            const paymentLink = planId === 'premium' 
                ? FAPSHI_LINKS.premium 
                : FAPSHI_LINKS.annual;

            // Create payment record with 'pending' status
            await createPaymentRecord('pending', 'fapshi');

            // Add phone number to URL if needed (Fapshi supports URL params)
            const url = new URL(paymentLink);
            if (phoneNumber) {
                // Some payment links accept phone as param
                // If not, the user will enter it on the Fapshi page
            }

            // Redirect to Fapshi payment page
            window.location.href = paymentLink;
            
        } catch (err: any) {
            setError(err.message || 'Payment initiation failed. Please try manual payment.');
            setShowBackupOption(true);
        } finally {
            setLoading(false);
        }
    };

    // --- MANUAL PAYMENT ---
    const initiateManualPayment = async () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            setError('Enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create payment record with 'pending_verification' status
            const payment = await createPaymentRecord('pending_verification', 'manual');

            if (payment) {
                setRequestId(payment.id);
                setStep('upload');
                setError('');
            } else {
                setError('Failed to create payment request');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const uploadManualScreenshot = async () => {
        if (!transactionId) {
            setError('Enter transaction ID');
            return;
        }
        if (!screenshot) {
            setError('Upload payment screenshot');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Upload screenshot to Supabase Storage
            const fileExt = screenshot.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('payment-screenshots')
                .upload(fileName, screenshot);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(fileName);

            // Update payment record with screenshot URL and transaction ID
            const { error: updateError } = await supabase
                .from('payments')
                .update({
                    transaction_id: transactionId,
                    screenshot_url: publicUrl,
                    status: 'pending_verification'
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            setSuccess('Payment submitted! Admin will verify within 24 hours.');
            
            // Send notification to admin (you can add this later)
            // await notifyAdmin();

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 3000);
            
        } catch (err: any) {
            setError(err.message || 'Failed to upload. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetToPrimary = () => {
        setStep('info');
        setShowBackupOption(false);
        setError('');
        setSuccess('');
        setPaymentMethod(null);
        setPhoneNumber('');
        setTransactionId('');
        setScreenshot(null);
        setScreenshotPreview(null);
        setRequestId(null);
    };

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshotPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">Upgrade to Premium</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5 dark:text-gray-400" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Show error/success messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start text-sm border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center text-sm border border-green-200 dark:border-green-800">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* PRIMARY PAYMENT FLOW - FAPSHI LINKS */}
                    {step === 'info' && !showBackupOption && (
                        <div className="space-y-4">
                            {/* Plan Info */}
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                                            {planId === 'premium' ? 'Premium Monthly - 1,000 FCFA' : 'Premium Annual - 5,000 FCFA'}
                                        </p>
                                        <p className="text-xs text-green-700 dark:text-green-400">Pay with MTN/Orange Money & get instant access</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                    Pay via Mobile Money
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                    You will be redirected to Fapshi to complete payment
                                </p>
                                <div className="mt-2 flex justify-center gap-2">
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs">MTN</span>
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">Orange</span>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('mtn');
                                            setError('');
                                        }}
                                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'mtn'
                                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📱</div>
                                        <div className="font-semibold text-sm dark:text-white">MTN Mobile Money</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Instant</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('orange');
                                            setError('');
                                        }}
                                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'orange'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📱</div>
                                        <div className="font-semibold text-sm dark:text-white">Orange Money</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">✓ Instant</div>
                                    </button>
                                </div>
                            </div>

                            {/* Phone Number Input (optional - for tracking) */}
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Your Phone Number (Optional)</label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX or 7XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                        if (error) setError('');
                                    }}
                                    className="w-full border dark:border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Enter your phone number for reference (you'll enter it again on Fapshi)
                                </p>
                            </div>

                            {/* Pay Button - Fapshi Link */}
                            <button
                                onClick={initiateFapshiPayment}
                                disabled={loading || !paymentMethod}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4" />
                                        Pay with Mobile Money
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    You'll be redirected to Fapshi to complete payment securely
                                </p>
                            </div>

                            {/* Backup Option */}
                            <div className="mt-2">
                                <button
                                    onClick={() => setShowBackupOption(true)}
                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center w-full"
                                >
                                    <span>Having payment issues?</span>
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BACKUP PAYMENT FLOW - MANUAL */}
                    {step === 'info' && showBackupOption && (
                        <div className="space-y-4">
                            <button
                                onClick={resetToPrimary}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                ← Back to instant payment
                            </button>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                                <div className="flex items-start">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Manual Payment - 24-48 Hours</p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                            This option requires admin verification. For instant activation, use Mobile Money above.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="border dark:border-gray-700 rounded-lg p-3">
                                    <p className="font-semibold text-sm dark:text-gray-300">MTN Mobile Money:</p>
                                    <p className="text-lg font-mono mt-1 dark:text-white">{BANK_DETAILS.mtn}</p>
                                </div>
                                <div className="border dark:border-gray-700 rounded-lg p-3">
                                    <p className="font-semibold text-sm dark:text-gray-300">Orange Money:</p>
                                    <p className="text-lg font-mono mt-1 dark:text-white">{BANK_DETAILS.orange}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400">After sending money, you'll need to:</p>
                                <ol className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-decimal list-inside">
                                    <li>Take a screenshot of the transaction confirmation</li>
                                    <li>Enter your phone number and transaction ID</li>
                                    <li>Upload the screenshot</li>
                                    <li>Wait for admin verification (within 24 hours)</li>
                                </ol>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Your Mobile Money Provider</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setProvider('MTN')}
                                        className={`flex-1 py-2 rounded-lg border font-semibold ${
                                            provider === 'MTN'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300 dark:border-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        MTN
                                    </button>
                                    <button
                                        onClick={() => setProvider('Orange')}
                                        className={`flex-1 py-2 rounded-lg border font-semibold ${
                                            provider === 'Orange'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300 dark:border-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        Orange
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Your Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <button
                                onClick={initiateManualPayment}
                                disabled={loading}
                                className="w-full bg-gray-600 dark:bg-gray-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'I Have Sent Payment →'}
                                {loading ? 'Processing...' : ''}
                            </button>
                        </div>
                    )}

                    {/* Upload Screenshot Step */}
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setStep('info');
                                    setShowBackupOption(true);
                                }}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                            >
                                ← Back
                            </button>

                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Payment Initiated</p>
                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">Now upload your transaction details</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Transaction ID / Reference</label>
                                <input
                                    type="text"
                                    placeholder="e.g., TRX-12345678"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full border dark:border-gray-700 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Payment Screenshot</label>
                                {screenshotPreview ? (
                                    <div className="relative">
                                        <img 
                                            src={screenshotPreview} 
                                            alt="Payment screenshot" 
                                            className="max-h-48 object-cover rounded-lg mx-auto border dark:border-gray-700"
                                        />
                                        <button
                                            onClick={() => {
                                                setScreenshot(null);
                                                setScreenshotPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleScreenshotChange}
                                            className="hidden"
                                            id="screenshot-upload"
                                        />
                                        <label htmlFor="screenshot-upload" className="cursor-pointer">
                                            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload screenshot</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 5MB</p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={uploadManualScreenshot}
                                disabled={loading}
                                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Submit for Verification
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}