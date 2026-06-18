import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { content, postType, authorId, authorType, title, subject, subjectCode, level, sourceId, sourceType } = await request.json();
        
        const supabase = await createClient();
        
        await supabase
            .from('feed_posts')
            .insert({
                content: `❓ ${title}\n\n✨ Scarlify Assist is preparing an answer...`,
                post_type: postType,
                author_id: authorId || null,
                author_type: authorType,
                title: title,
                subject: subject,
                subject_code: subjectCode,
                level: level,
                source_id: sourceId,
                source_type: sourceType,
                is_published: true,
                published_at: new Date().toISOString()
            });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feed add error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}