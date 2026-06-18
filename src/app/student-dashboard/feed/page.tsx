'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    Heart, MessageCircle, Bookmark, Share2, 
    Filter, TrendingUp, Clock, ThumbsUp, 
    Sparkles, Megaphone, Lightbulb, HelpCircle,
    Award, Zap, Target, Send, MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

interface FeedPost {
    id: string;
    title: string;
    content: string;
    post_type: string;
    author_id: string;
    author_type: 'admin' | 'student';
    subject: string;
    subject_code: string;
    level: string;
    likes_count: number;
    comments_count: number;
    saves_count: number;
    is_pinned: boolean;
    published_at: string;
    author_name?: string;
    is_liked?: boolean;
    is_saved?: boolean;
    source_id?: string;
    source_type?: string;
    comments?: Comment[];
}

interface Comment {
    id: string;
    content: string;
    user_id: string;
    user_name: string;
    created_at: string;
}

export default function HomeFeedPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('latest');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<'study_tip' | 'student_question'>('study_tip');
    const [newPostSubject, setNewPostSubject] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedComments, setExpandedComments] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        getCurrentUser();
        fetchPosts();
    }, [filter]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchPosts = async () => {
        setLoading(true);
        
        let query = supabase
            .from('feed_posts')
            .select('*')
            .eq('is_published', true)
            .order('is_pinned', { ascending: false });

        if (filter === 'latest') {
            query = query.order('published_at', { ascending: false });
        } else if (filter === 'popular') {
            query = query.order('likes_count', { ascending: false });
        } else if (filter === 'trending') {
            query = query.order('comments_count', { ascending: false });
        }

        const { data } = await query;
        
        if (data && user) {
            const { data: likes } = await supabase
                .from('feed_likes')
                .select('post_id')
                .eq('user_id', user.id);
            
            const likedIds = new Set(likes?.map(l => l.post_id));
            
            const { data: saves } = await supabase
                .from('feed_saves')
                .select('post_id')
                .eq('user_id', user.id);
            
            const savedIds = new Set(saves?.map(s => s.post_id));
            
            const postsWithDetails = await Promise.all(data.map(async (post) => {
                let authorName = post.author_type === 'admin' ? 'Scarlify Admin' : 'Student';
                
                if (post.author_type === 'student' && post.author_id) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', post.author_id)
                        .single();
                    authorName = profile?.full_name || 'Student';
                }
                
                return {
                    ...post,
                    author_name: authorName,
                    is_liked: likedIds.has(post.id),
                    is_saved: savedIds.has(post.id),
                };
            }));
            
            setPosts(postsWithDetails);
        } else if (data) {
            setPosts(data);
        }
        
        setLoading(false);
    };

    const fetchComments = async (postId: string) => {
        const { data } = await supabase
            .from('feed_comments')
            .select('*, profiles(full_name)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        
        const commentsWithNames = data?.map(comment => ({
            ...comment,
            user_name: comment.profiles?.full_name || 'Anonymous'
        })) || [];
        
        setPosts(prev => prev.map(post => 
            post.id === postId 
                ? { ...post, comments: commentsWithNames }
                : post
        ));
    };

    const handleLike = async (postId: string) => {
        if (!user) return;
        
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        if (post.is_liked) {
            await supabase
                .from('feed_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);
            
            setPosts(prev => prev.map(p =>
                p.id === postId 
                    ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
                    : p
            ));
        } else {
            await supabase
                .from('feed_likes')
                .insert({ post_id: postId, user_id: user.id });
            
            setPosts(prev => prev.map(p =>
                p.id === postId 
                    ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
                    : p
            ));
        }
    };

    const handleSave = async (postId: string) => {
        if (!user) return;
        
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        if (post.is_saved) {
            await supabase
                .from('feed_saves')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);
            
            setPosts(prev => prev.map(p =>
                p.id === postId 
                    ? { ...p, is_saved: false, saves_count: p.saves_count - 1 }
                    : p
            ));
        } else {
            await supabase
                .from('feed_saves')
                .insert({ post_id: postId, user_id: user.id });
            
            setPosts(prev => prev.map(p =>
                p.id === postId 
                    ? { ...p, is_saved: true, saves_count: p.saves_count + 1 }
                    : p
            ));
        }
    };

    const handleComment = async (postId: string) => {
        if (!user || !commentText.trim()) return;
        
        const { data } = await supabase
            .from('feed_comments')
            .insert({
                post_id: postId,
                user_id: user.id,
                content: commentText
            })
            .select();
        
        if (data) {
            setCommentText('');
            await fetchComments(postId);
            
            setPosts(prev => prev.map(p =>
                p.id === postId 
                    ? { ...p, comments_count: p.comments_count + 1 }
                    : p
            ));
        }
    };

    const createPost = async () => {
        if (!newPostContent.trim()) return;
        
        setSubmitting(true);
        
        const { error } = await supabase
            .from('feed_posts')
            .insert({
                content: newPostContent,
                post_type: newPostType,
                author_id: user?.id,
                author_type: 'student',
                subject: newPostSubject || null,
                is_published: true,
                published_at: new Date().toISOString(),
            });

        if (!error) {
            setNewPostContent('');
            setShowCreateModal(false);
            fetchPosts();
        }
        
        setSubmitting(false);
    };

    const getPostIcon = (type: string) => {
        switch (type) {
            case 'announcement': return <Megaphone className="w-4 h-4 text-blue-500" />;
            case 'study_tip': return <Lightbulb className="w-4 h-4 text-amber-500" />;
            case 'student_question': return <HelpCircle className="w-4 h-4 text-green-500" />;
            case 'exam_info': return <Award className="w-4 h-4 text-purple-500" />;
            case 'new_lesson': return <Zap className="w-4 h-4 text-indigo-500" />;
            case 'quiz_update': return <Target className="w-4 h-4 text-orange-500" />;
            default: return <Megaphone className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTypeBadge = (type: string, authorType: string) => {
        if (authorType === 'admin') {
            return { label: 'Official', color: 'bg-blue-100 text-blue-700' };
        }
        switch (type) {
            case 'study_tip': return { label: 'Study Tip', color: 'bg-amber-100 text-amber-700' };
            case 'student_question': return { label: 'Question', color: 'bg-green-100 text-green-700' };
            default: return { label: 'Post', color: 'bg-gray-100 text-gray-700' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const filters = [
        { id: 'latest', label: 'Latest', icon: Clock },
        { id: 'popular', label: 'Most Liked', icon: ThumbsUp },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-8">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">📱 Home Feed</h1>
                            <p className="text-white/80">Ask questions, share study tips, and learn together</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            + Create Post
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Filter Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 mb-6 flex gap-1 border border-gray-200 dark:border-gray-700">
                    {filters.map((f) => {
                        const Icon = f.icon;
                        const isActive = filter === f.id;
                        return (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Post Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewPostType('study_tip')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            newPostType === 'study_tip'
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        💡 Study Tip
                                    </button>
                                    <button
                                        onClick={() => setNewPostType('student_question')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            newPostType === 'student_question'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        ❓ Question
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Subject (Optional)</label>
                                <input
                                    type="text"
                                    value={newPostSubject}
                                    onChange={(e) => setNewPostSubject(e.target.value)}
                                    placeholder="e.g., Mathematics, Physics"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows={4}
                                    placeholder={newPostType === 'student_question' 
                                        ? "What would you like to ask?" 
                                        : "Share your study tip with the community..."}
                                    className="w-full px-3 py-2 border rounded-lg resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 border rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createPost}
                                    disabled={submitting || !newPostContent.trim()}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Posts Feed */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Be the first to share a study tip or ask a question!
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary text-white px-5 py-2 rounded-lg font-semibold"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => {
                            const typeBadge = getTypeBadge(post.post_type, post.author_type);
                            const Icon = getPostIcon(post.post_type);
                            const isExpanded = expandedComments === post.id;
                            const isQuestionPost = post.post_type === 'student_question' || post.source_type === 'qa_question';
                            const hasAnswerPreview = post.content?.includes('Scarlify Assist answered');
                            
                            return (
                                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {/* Post Header */}
                                    <div className="p-5 pb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">
                                                        {post.author_name?.charAt(0) || 'S'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            {post.author_name}
                                                        </p>
                                                        {post.author_type === 'admin' && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Official</span>
                                                        )}
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge.color}`}>
                                                            {typeBadge.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(post.published_at)}
                                                        {post.subject && ` • ${post.subject} ${post.subject_code ? `(${post.subject_code})` : ''}`}
                                                        {post.level && ` • ${post.level}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        {post.title && (
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                                {post.title}
                                            </h3>
                                        )}
                                        
                                        {/* ===== FIX 2: Show answer preview for questions ===== */}
                                        {isQuestionPost && hasAnswerPreview ? (
                                            <div className="mb-4">
                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">
                                                    {post.content}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        if (post.source_id) {
                                                            router.push(`/questions-and-answers/${post.source_id}`);
                                                        } else if (post.id) {
                                                            router.push(`/questions-and-answers?post=${post.id}`);
                                                        }
                                                    }}
                                                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                                                >
                                                    View full answer →
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                        )}

                                        {/* AI Assist Badge for Questions (before answer) */}
                                        {post.post_type === 'student_question' && !hasAnswerPreview && (
                                            <div className="mb-3 p-2 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/20 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    <span className="font-medium text-primary">Scarlify Assist</span> is preparing an answer...
                                                </p>
                                            </div>
                                        )}

                                        {/* ===== FIX 2: Show the actual answer if available ===== */}
                                        {isQuestionPost && hasAnswerPreview && (
                                            <div className="mb-3 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <span className="text-xs font-medium text-primary">✨ Scarlify Assist</span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {post.content.includes('Scarlify Assist answered:') 
                                                        ? post.content.split('Scarlify Assist answered:')[1]?.substring(0, 200) + '...'
                                                        : 'Click to view the full explanation'}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        if (post.source_id) {
                                                            router.push(`/questions-and-answers/${post.source_id}`);
                                                        }
                                                    }}
                                                    className="mt-2 text-xs text-primary hover:underline"
                                                >
                                                    Read full explanation →
                                                </button>
                                            </div>
                                        )}

                                        {/* Engagement Buttons */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-1.5 transition-colors ${
                                                    post.is_liked ? 'text-red-500' : 'hover:text-red-500'
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-red-500' : ''}`} />
                                                <span>{post.likes_count}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!isExpanded) {
                                                        fetchComments(post.id);
                                                    }
                                                    setExpandedComments(isExpanded ? null : post.id);
                                                }}
                                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                <span>{post.comments_count}</span>
                                            </button>
                                            <button
                                                onClick={() => handleSave(post.id)}
                                                className={`flex items-center gap-1.5 transition-colors ${
                                                    post.is_saved ? 'text-primary' : 'hover:text-primary'
                                                }`}
                                            >
                                                <Bookmark className={`w-4 h-4 ${post.is_saved ? 'fill-primary' : ''}`} />
                                                <span>Save</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors ml-auto">
                                                <Share2 className="w-4 h-4" />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                                            {/* Add Comment */}
                                            <div className="flex gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">You</span>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                    {commentText.trim() && (
                                                        <button
                                                            onClick={() => handleComment(post.id)}
                                                            className="mt-2 px-4 py-1.5 bg-primary text-white rounded-lg text-sm"
                                                        >
                                                            Post
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Comments List */}
                                            {post.comments && post.comments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.id} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold">
                                                                    {comment.user_name?.charAt(0) || 'U'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                                                    <p className="font-semibold text-sm">{comment.user_name}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{comment.content}</p>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                                                    <button className="hover:text-primary">Like</button>
                                                                    <span>{formatDate(comment.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 text-sm py-2">No comments yet</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}