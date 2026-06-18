import { createClient } from '@/utils/supabase/server';

export async function addToFeed({
    content,
    postType,
    authorId,
    authorType,
    title,
    subject,
    subjectCode,
    level,
    sourceId,
    sourceType
}: {
    content: string;
    postType: 'announcement' | 'study_tip' | 'student_question' | 'exam_info' | 'new_lesson' | 'quiz_update' | 'mock_exam' | 'assist_answer';
    authorId?: string;
    authorType: 'admin' | 'student' | 'assist';
    title?: string;
    subject?: string;
    subjectCode?: string;
    level?: string;
    sourceId?: string;
    sourceType?: 'qa_question' | 'qa_answer' | 'admin_post';
}) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from('feed_posts')
        .insert({
            content,
            post_type: postType,
            author_id: authorId,
            author_type: authorType,
            title: title || null,
            subject,
            subject_code: subjectCode,
            level,
            source_id: sourceId,
            source_type: sourceType,
            is_published: true,
            published_at: new Date().toISOString(),
        });
    
    if (error) {
        console.error('Error adding to feed:', error);
    }
    
    return { error };
}