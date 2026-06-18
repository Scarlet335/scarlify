import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { amount, phoneNumber, provider } = await request.json();
        const supabase = await createClient();

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Please login first' }, { status: 401 });
        }

        // Check if user already has a pending request
        const { data: existing } = await supabase
            .from('payment_requests')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .single();

        if (existing) {
            return NextResponse.json({ 
                error: 'You already have a pending payment request. Please wait for verification.' 
            }, { status: 400 });
        }

        // Create payment request
        const { data: paymentRequest, error } = await supabase
            .from('payment_requests')
            .insert({
                user_id: user.id,
                amount: amount,
                phone_number: phoneNumber,
                provider: provider,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Payment request submitted. Complete payment and upload screenshot.',
            requestId: paymentRequest.id
        });

    } catch (error) {
        console.error('Payment request error:', error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}