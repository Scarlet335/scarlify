import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { questionId, questionTitle, questionContent, subject, level } = await request.json();
        
        console.log('Assist API called for:', questionTitle);
        
        const supabase = await createClient();
        
        // Build prompt for AI
        const prompt = `You are Scarlify Assist, a helpful study coach for GCE students in Cameroon.
Subject: ${subject || 'General'}
Student's question: ${questionTitle}\n\n${questionContent}

Provide a clear, helpful, detailed answer suitable for a GCE student. Include examples. Keep it concise but educational.`;

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are Scarlify Assist, a helpful GCE study coach. Provide clear, educational answers with examples.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 600,
        });

        const assistAnswer = completion.choices[0]?.message?.content || "I'm here to help! Could you please rephrase?";

        // Save answer to qa_answers
        await supabase
            .from('qa_answers')
            .insert({
                question_id: questionId,
                content: assistAnswer,
                is_assist: true,
                user_id: null,
                created_at: new Date().toISOString()
            });
        
        // ===== UPDATE THE HOME FEED POST WITH THE ANSWER =====
        const { data: feedPost } = await supabase
            .from('feed_posts')
            .select('id')
            .eq('source_id', questionId)
            .eq('source_type', 'qa_question')
            .single();
        
        if (feedPost) {
            // Update the existing feed post with the answer
            await supabase
                .from('feed_posts')
                .update({
                    content: `❓ ${questionTitle}\n\n✨ Scarlify Assist answered:\n${assistAnswer.substring(0, 400)}${assistAnswer.length > 400 ? '...' : ''}\n\n💡 Click to view the full answer.`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', feedPost.id);
            console.log('Feed post updated with answer for:', questionId);
        }
        
        console.log('Answer saved for question:', questionId);
        
        return NextResponse.json({ success: true, answer: assistAnswer });
    } catch (error) {
        console.error('Assist error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}