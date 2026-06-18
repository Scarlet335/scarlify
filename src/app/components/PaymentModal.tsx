'use client';
import { useState } from 'react';
import { X, Smartphone, Upload, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
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
    
    // Fapshi payment states (NEW - Primary)
    const [paymentMethod, setPaymentMethod] = useState<'mtn' | 'orange' | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showBackupOption, setShowBackupOption] = useState(false);
    
    // Manual payment states (EXISTING - Backup)
    const [step, setStep] = useState<'info' | 'payment' | 'upload'>('info');
    const [provider, setProvider] = useState<'MTN' | 'Orange'>('MTN');
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [requestId, setRequestId] = useState<string | null>(null);
    
    // YOUR EXISTING MTN/ORANGE NUMBERS (keep as backup)
    const YOUR_MTN_NUMBER = "671834918";
    const YOUR_ORANGE_NUMBER = "671834918";

    // --- FAPSHI PAYMENT (NEW PRIMARY METHOD) ---
    const initiateFapshiPayment = async () => {
        if (!paymentMethod || !phoneNumber) {
            setError('Please select a payment method and enter your phone number');
            return;
        }

        const phoneRegex = /^(6|7)\d{8}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            setError('Please enter a valid Cameroon phone number (e.g., 6XXXXXXXX or 7XXXXXXXX)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const callbackUrl = `${window.location.origin}/payment-callback`;

            const response = await supabase.functions.invoke('fapshi-payment', {
                body: {
                    userId: userId,
                    planId: planId,
                    amount: 1000, // Your premium price
                    currency: 'XAF',
                    phoneNumber: phoneNumber.replace(/\s/g, ''),
                    provider: paymentMethod,
                    callbackUrl,
                },
            });

            if (response.error) {
                throw new Error(response.error.message);
            }

            const data = response.data;
            
            if (data.success && data.paymentUrl) {
                // Redirect to Fapshi payment page
                window.location.href = data.paymentUrl;
            } else if (data.success) {
                setSuccess('Payment initiated! Check your phone for the payment prompt.');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            }
            
        } catch (err: any) {
            setError(err.message || 'Payment initiation failed. Please try again.');
            // If Fapshi fails, show backup option
            setShowBackupOption(true);
        } finally {
            setLoading(false);
        }
    };

    // --- MANUAL PAYMENT (EXISTING CODE - KEPT AS BACKUP) ---
    const initiateManualPayment = async () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            setError('Enter a valid phone number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/payment/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 2500,
                    phoneNumber: phoneNumber,
                    provider: provider
                })
            });

            const data = await res.json();
            if (res.ok) {
                setRequestId(data.requestId);
                setStep('payment');
                setError('');
            } else {
                setError(data.error || 'Failed to submit request');
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

        const formData = new FormData();
        formData.append('screenshot', screenshot);
        formData.append('requestId', requestId!);
        formData.append('transactionId', transactionId);

        try {
            const res = await fetch('/api/payment/upload-screenshot', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('Payment submitted! Admin will verify within 24 hours.');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 3000);
            } else {
                setError(data.error || 'Failed to upload');
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
        setRequestId(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Upgrade to Premium</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Show error/success messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start text-sm">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* PRIMARY PAYMENT FLOW - FAPSHI (AUTOMATED) */}
                    {step === 'info' && !showBackupOption && (
                        <div className="space-y-4">
                            {/* Instant Activation Badge */}
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">Instant Activation</p>
                                        <p className="text-xs text-green-700">Pay with MTN/Orange Money & get instant access</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <p className="text-sm font-semibold text-blue-800">Pay 1,000 FCFA via Mobile Money</p>
                                <p className="text-xs text-blue-700 mt-1">Automatic activation upon successful payment</p>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('mtn');
                                            setError('');
                                        }}
                                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'mtn'
                                                ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500'
                                                : 'border-gray-200 hover:border-yellow-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📱</div>
                                        <div className="font-semibold text-sm">MTN Mobile Money</div>
                                        <div className="text-xs text-green-600">✓ Instant</div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPaymentMethod('orange');
                                            setError('');
                                        }}
                                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                                            paymentMethod === 'orange'
                                                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                                                : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                    >
                                        <div className="text-2xl mb-1">📱</div>
                                        <div className="font-semibold text-sm">Orange Money</div>
                                        <div className="text-xs text-green-600">✓ Instant</div>
                                    </button>
                                </div>
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX or 7XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                        if (error) setError('');
                                    }}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the number registered with your mobile money account
                                </p>
                            </div>

                            {/* Pay Button - Fapshi Primary */}
                            <button
                                onClick={initiateFapshiPayment}
                                disabled={loading || !paymentMethod || !phoneNumber}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Smartphone className="w-4 h-4" />
                                        Pay with Mobile Money
                                    </>
                                )}
                            </button>

                            {/* Backup Option - Hidden under "Having issues?" */}
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowBackupOption(true)}
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center w-full"
                                >
                                    <span>Having payment issues?</span>
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BACKUP PAYMENT FLOW - MANUAL (Existing Code) */}
                    {step === 'info' && showBackupOption && (
                        <div className="space-y-4">
                            {/* Back to Primary */}
                            <button
                                onClick={resetToPrimary}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                ← Back to instant payment
                            </button>

                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                <div className="flex items-start">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800">Manual Payment - 24-48 Hours</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            This option requires admin verification. For instant activation, use Mobile Money above.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="border rounded-lg p-3">
                                    <p className="font-semibold text-sm">MTN Mobile Money:</p>
                                    <p className="text-lg font-mono mt-1">{YOUR_MTN_NUMBER}</p>
                                </div>
                                <div className="border rounded-lg p-3">
                                    <p className="font-semibold text-sm">Orange Money:</p>
                                    <p className="text-lg font-mono mt-1">{YOUR_ORANGE_NUMBER}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600">After sending money, you'll need to:</p>
                                <ol className="text-xs text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                                    <li>Take a screenshot of the transaction confirmation</li>
                                    <li>Enter your phone number and transaction ID</li>
                                    <li>Upload the screenshot</li>
                                    <li>Wait for admin verification (within 24 hours)</li>
                                </ol>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Your Mobile Money Provider</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setProvider('MTN')}
                                        className={`flex-1 py-2 rounded-lg border font-semibold ${
                                            provider === 'MTN'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        MTN
                                    </button>
                                    <button
                                        onClick={() => setProvider('Orange')}
                                        className={`flex-1 py-2 rounded-lg border font-semibold ${
                                            provider === 'Orange'
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        Orange
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Your Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="6XXXXXXXX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <button
                                onClick={initiateManualPayment}
                                disabled={loading}
                                className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'I Have Sent Payment →'}
                            </button>
                        </div>
                    )}

                    {/* Upload Screenshot Step (Existing) */}
                    {step === 'payment' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setStep('info')}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                ← Back
                            </button>

                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm font-semibold text-green-800">Payment Initiated</p>
                                <p className="text-xs text-green-700 mt-1">Now upload your transaction details</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Transaction ID / Reference</label>
                                <input
                                    type="text"
                                    placeholder="e.g., TRX-12345678"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Screenshot</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <button
                                onClick={uploadManualScreenshot}
                                disabled={loading}
                                className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Uploading...' : <Upload className="w-4 h-4" />}
                                {loading ? 'Uploading...' : 'Submit for Verification'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}