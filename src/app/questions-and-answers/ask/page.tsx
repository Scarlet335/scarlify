'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Send, X, Plus, Loader2, Sparkles } from 'lucide-react';

export default function AskQuestionPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [userSelection, setUserSelection] = useState({ level: '', section: '', subject: '', subjectCode: '' });
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const level = localStorage.getItem('student_level');
        const section = localStorage.getItem('student_section');
        const subject = localStorage.getItem('student_subject');
        const subjectCode = localStorage.getItem('student_subject_code');
        
        if (level && section && subject) {
            setUserSelection({ level, section, subject, subjectCode: subjectCode || '' });
        }
    }, []);

    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !content) {
            alert('Please fill in title and content');
            return;
        }

        setSubmitting(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        // Insert question
        const { data: newQuestion, error } = await supabase
            .from('qa_questions')
            .insert({
                title,
                content,
                subject: userSelection.subject,
                subject_code: userSelection.subjectCode,
                level: userSelection.level,
                section: userSelection.section,
                tags,
                user_id: user?.id,
            })
            .select()
            .single();

        if (error) {
            alert('Error: ' + error.message);
            setSubmitting(false);
        } else {
            // ===== CREATE FEED POST DIRECTLY (NOT VIA API) =====
            await supabase
                .from('feed_posts')
                .insert({
                    content: `❓ ${title}\n\n✨ Scarlify Assist is preparing an answer...`,
                    post_type: 'student_question',
                    author_id: user?.id,
                    author_type: 'student',
                    title: title,
                    subject: userSelection.subject,
                    subject_code: userSelection.subjectCode,
                    level: userSelection.level,
                    source_id: newQuestion.id,
                    source_type: 'qa_question',
                    is_published: true,
                    published_at: new Date().toISOString()
                });
            
            // Generate Assist answer
            fetch('/api/assist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: newQuestion.id,
                    questionTitle: title,
                    questionContent: content,
                    subject: userSelection.subject,
                    level: userSelection.level,
                })
            }).catch(console.error);
            
            router.push(`/questions-and-answers/${newQuestion.id}`);
        }
        
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {userSelection.subject && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm">Your question will be categorized under: <strong>{userSelection.level} • {userSelection.section} • {userSelection.subject}</strong></p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Question Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Question Details *</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 border rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Tags</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg"
                            />
                            <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 rounded-lg">Add</button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)}>✕</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-lg w-full">
                        {submitting ? 'Posting...' : 'Post Question'}
                    </button>
                </form>
            </div>
        </div>
    );
}