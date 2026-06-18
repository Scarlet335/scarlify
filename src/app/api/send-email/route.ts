import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { to, subject, html, name } = await request.json();

        const { data, error } = await resend.emails.send({
            from: 'Scarlify <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
            replyTo: 'support@scarlify.cm',  // ← Changed from 'reply_to' to 'replyTo'
        });

        if (error) {
            console.error('Email error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Send email error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}