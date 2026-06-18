'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    Megaphone, Lightbulb, Award, Sparkles, BookOpen, Zap, Target,
    Image as ImageIcon, X, Send, Eye
} from 'lucide-react';

const postTypes = [
    { id: 'announcement', label: 'Announcement', icon: Megaphone, color: 'blue', description: 'Important platform updates' },
    { id: 'study_tip', label: 'Study Tip', icon: Lightbulb, color: 'amber', description: 'Helpful study advice' },
    { id: 'exam_info', label: 'Exam Info', icon: Award, color: 'green', description: 'Exam schedules and updates' },
    { id: 'motivation', label: 'Motivation', icon: Sparkles, color: 'purple', description: 'Encouraging content' },
    { id: 'new_lesson', label: 'New Lesson', icon: BookOpen, color: 'indigo', description: 'New lesson announcements' },
    { id: 'quiz_update', label: 'Quiz Update', icon: Zap, color: 'orange', description: 'New quizzes available' },
    { id: 'mock_exam_release', label: 'Mock Exam', icon: Target, color: 'red', description: 'Mock exam releases' },
];

export default function CreateFeedPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('announcement');
    const [imageUrl, setImageUrl] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const [isPublished, setIsPublished] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [preview, setPreview] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title || !content) {
            alert('Please fill in title and content');
            return;
        }

        setSubmitting(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
            .from('feed_posts')
            .insert({
                title,
                content,
                type,
                image_url: imageUrl || null,
                is_pinned: isPinned,
                is_published: isPublished,
                author_id: user?.id,
                published_at: new Date().toISOString(),
            });

        if (error) {
            alert('Error creating post: ' + error.message);
        } else {
            alert('Post created successfully!');
            router.push('/admin/feed');
        }
        
        setSubmitting(false);
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
            green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
            indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
            red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
        };
        return colors[color] || colors.blue;
    };

    const selectedType = postTypes.find(t => t.id === type);
    const colorClasses = getColorClasses(selectedType?.color || 'blue');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Feed Post</h1>
                    <p className="text-gray-500 dark:text-gray-400">Share announcements, study tips, and updates with students</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
                        {/* Post Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Post Type</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {postTypes.map((pt) => {
                                    const Icon = pt.icon;
                                    const isSelected = type === pt.id;
                                    const ptColor = getColorClasses(pt.color);
                                    return (
                                        <button
                                            key={pt.id}
                                            type="button"
                                            onClick={() => setType(pt.id)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                                                isSelected
                                                    ? `${ptColor.bg} ${ptColor.border} ${ptColor.text}`
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 mx-auto mb-1" />
                                            <span className="text-xs font-medium">{pt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., GCE 2026 Timetable Released"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your post content here..."
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                required
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                <ImageIcon className="w-4 h-4 inline mr-1" /> Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPinned}
                                    onChange={(e) => setIsPinned(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Pin this post (appears at top)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Publish immediately</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setPreview(!preview)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Eye className="w-4 h-4 inline mr-2" />
                                Preview
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4 inline mr-2" />
                                {submitting ? 'Creating...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>

                    {/* Preview Panel */}
                    {preview && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Preview</h3>
                                <div className={`rounded-xl border-2 p-4 ${colorClasses.border} ${colorClasses.bg}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-xs">S</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Scarlify Admin</p>
                                            <p className="text-xs opacity-70">Just now</p>
                                        </div>
                                    </div>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${colorClasses.bg} ${colorClasses.text}`}>
                                        {selectedType?.label}
                                    </span>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title || 'Your Title Here'}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                        {content || 'Your content will appear here...'}
                                    </p>
                                    {imageUrl && (
                                        <img src={imageUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 w-full object-cover" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}