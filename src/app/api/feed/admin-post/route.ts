import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const { title, content, postType, subject, level, isPinned } = await request.json();
        const supabase = await createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('feed_posts')
            .insert({
                title,
                content,
                post_type: postType,
                author_id: user?.id,
                author_type: 'admin',
                subject,
                level,
                is_pinned: isPinned || false,
                is_published: true,
                published_at: new Date().toISOString(),
            });
        
        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating admin post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}