import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('screenshot') as File;
        const requestId = formData.get('requestId') as string;
        const transactionId = formData.get('transactionId') as string;

        if (!file || !requestId || !transactionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Upload screenshot to storage
        const fileName = `${user.id}_${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment-screenshots')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(fileName);

        // Update payment request
        const { error: updateError } = await supabase
            .from('payment_requests')
            .update({
                transaction_id: transactionId,
                transaction_screenshot: publicUrl,
                status: 'pending'
            })
            .eq('id', requestId)
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Screenshot uploaded successfully. Admin will verify shortly.'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
    }
}