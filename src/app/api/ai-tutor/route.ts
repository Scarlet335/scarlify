import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(userId, {
            count: 1,
            resetTime: now + windowMs
        });
        return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
    }
    
    if (userLimit.count >= limit) {
        return { allowed: false, remaining: 0, resetTime: userLimit.resetTime };
    }
    
    userLimit.count++;
    rateLimitMap.set(userId, userLimit);
    return { allowed: true, remaining: limit - userLimit.count, resetTime: userLimit.resetTime };
}

// ========== POST endpoint - Ask Study Coach ==========
export async function POST(request: NextRequest) {
    try {
        const { question, subject } = await request.json();
        
        // Validate input
        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }
        
        if (question.length < 3) {
            return NextResponse.json({ error: 'Question must be at least 3 characters' }, { status: 400 });
        }
        
        if (question.length > 2000) {
            return NextResponse.json({ error: 'Question is too long (max 2000 characters)' }, { status: 400 });
        }
        
        // Check if user is logged in
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Please login first' }, { status: 401 });
        }
        
        // Check rate limit (10 requests per minute)
        const rateLimit = checkRateLimit(user.id, 10, 60000);
        if (!rateLimit.allowed) {
            const waitSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
            return NextResponse.json({ 
                error: `Too many requests. Please try again in ${waitSeconds} seconds.`,
                remaining: 0,
                resetAfter: waitSeconds
            }, { status: 429 });
        }
        
        // Check daily limit for free users
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
        
        const isPremium = profile?.subscription_tier === 'Premium' || profile?.subscription_tier === 'Pro';
        
        if (!isPremium) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const { count } = await supabase
                .from('ai_conversations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString());
            
            if (count && count >= 6) {
                return NextResponse.json({ 
                    error: 'Daily limit reached (6 questions per day). Upgrade to Premium for unlimited coaching!',
                    limitReached: true,
                    upgradeUrl: '/pricing'
                }, { status: 429 });
            }
        }

        // Build prompt for full assistant
        const prompt = `Subject: ${subject || 'General'}
Student's request: ${question}

Please provide a complete, thorough answer. Include step-by-step working if applicable. Be detailed and helpful.`;

        // Call Groq API (using free Llama model)
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are Scarlify, a powerful study coach for GCE students in Cameroon.

Your role: Provide complete, thorough help with any academic question.
- Answer questions directly and fully
- Solve problems completely with step-by-step working
- Give clear explanations
- Provide examples when helpful
- Don't hold back - give the full answer
- Be thorough and detailed
- Help with any subject, any difficulty level
- For calculations, show all steps
- For essays, provide structure and key points
- For past papers, explain the solution fully

You are a full assistant - give complete answers, not just guidance. Be friendly and encouraging!`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1500,  // Increased for detailed answers
        });

        const answer = completion.choices[0]?.message?.content || "I'm having trouble answering right now. Could you rephrase your question?";

        // Save conversation to Supabase
        try {
            await supabase.from('ai_conversations').insert({
                user_id: user.id,
                subject: subject || 'General',
                question: question,
                answer: answer,
                created_at: new Date().toISOString()
            });
        } catch (dbError) {
            console.error('Failed to save conversation:', dbError);
        }

        return NextResponse.json({ 
            success: true, 
            answer,
            remaining: rateLimit.remaining,
            isPremium
        });
        
    } catch (error) {
        console.error('Study Coach error:', error);
        
        return NextResponse.json({ 
            error: 'Service temporarily unavailable. Please try again.',
            answer: "I'm having a moment! Please try again in a few seconds."
        }, { status: 500 });
    }
}

// ========== GET endpoint - Check user's remaining quota ==========
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Get user's subscription tier
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
        
        const isPremium = profile?.subscription_tier === 'Premium' || profile?.subscription_tier === 'Pro';
        
        if (isPremium) {
            return NextResponse.json({
                isPremium: true,
                message: 'Premium users have unlimited coaching sessions'
            });
        }
        
        // Count today's queries for free users
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
            .from('ai_conversations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString());
        
        if (error) {
            console.error('Error counting queries:', error);
            return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
        }
        
        const used = count || 0;
        const remaining = Math.max(0, 6 - used);
        
        return NextResponse.json({
            isPremium: false,
            used: used,
            remaining: remaining,
            limit: 6,
            resetAt: new Date(today.setHours(24, 0, 0, 0)).toISOString()
        });
        
    } catch (error) {
        console.error('Error checking quota:', error);
        return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
    }
}