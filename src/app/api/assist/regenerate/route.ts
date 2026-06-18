import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { questionId, questionTitle, questionContent, subject, level } = await request.json();
        
        const supabase = await createClient();
        
        const prompt = `You are Scarlify Assist. Please explain this DIFFERENTLY using a new approach or different examples.
Subject: ${subject || 'General'}
Student's question: ${questionTitle}\n\n${questionContent}

Provide a DIFFERENT explanation than before. Use fresh examples and a new teaching approach.`;

        let newAnswer = "Let me explain this another way...";
        
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are Scarlify Assist. Provide a DIFFERENT explanation using a new approach.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.8,
                max_tokens: 800,
            });

            newAnswer = completion.choices[0]?.message?.content || newAnswer;
        } catch (aiError) {
            console.error('AI Error:', aiError);
        }

        await supabase
            .from('qa_answers')
            .update({ content: newAnswer })
            .eq('question_id', questionId)
            .eq('is_assist', true);
        
        return NextResponse.json({ success: true, answer: newAnswer });
    } catch (error) {
        console.error('Regenerate error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}