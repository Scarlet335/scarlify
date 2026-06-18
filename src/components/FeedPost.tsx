'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Award, Lightbulb, Megaphone, Sparkles, BookOpen, Zap, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface FeedPostProps {
    post: {
        id: string;
        title: string;
        content: string;
        type: string;
        author_id: string;
        author_name?: string;
        author_avatar?: string;
        image_url?: string;
        likes_count: number;
        comments_count: number;
        is_liked?: boolean;
        published_at: string;
    };
    onLike?: () => void;
    onComment?: () => void;
}

export default function FeedPost({ post, onLike, onComment }: FeedPostProps) {
    const [isLiked, setIsLiked] = useState(post.is_liked || false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const supabase = createClient();

    const getPostIcon = () => {
        switch (post.type) {
            case 'announcement':
                return <Megaphone className="w-5 h-5 text-blue-500" />;
            case 'study_tip':
                return <Lightbulb className="w-5 h-5 text-amber-500" />;
            case 'exam_info':
                return <Award className="w-5 h-5 text-green-500" />;
            case 'motivation':
                return <Sparkles className="w-5 h-5 text-purple-500" />;
            case 'new_lesson':
                return <BookOpen className="w-5 h-5 text-indigo-500" />;
            case 'quiz_update':
                return <Zap className="w-5 h-5 text-orange-500" />;
            case 'mock_exam_release':
                return <Target className="w-5 h-5 text-red-500" />;
            default:
                return <Megaphone className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeBadge = () => {
        const badges: Record<string, { label: string; color: string }> = {
            announcement: { label: 'Announcement', color: 'bg-blue-100 text-blue-700' },
            study_tip: { label: 'Study Tip', color: 'bg-amber-100 text-amber-700' },
            exam_info: { label: 'Exam Info', color: 'bg-green-100 text-green-700' },
            motivation: { label: 'Motivation', color: 'bg-purple-100 text-purple-700' },
            new_lesson: { label: 'New Lesson', color: 'bg-indigo-100 text-indigo-700' },
            quiz_update: { label: 'Quiz Update', color: 'bg-orange-100 text-orange-700' },
            mock_exam_release: { label: 'Mock Exam', color: 'bg-red-100 text-red-700' },
        };
        return badges[post.type] || { label: 'Post', color: 'bg-gray-100 text-gray-700' };
    };

    const handleLike = async () => {
        if (isLiked) {
            await supabase
                .from('feed_likes')
                .delete()
                .eq('post_id', post.id);
            setLikesCount(prev => prev - 1);
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('feed_likes')
                    .insert({ post_id: post.id, user_id: user.id });
                setLikesCount(prev => prev + 1);
            }
        }
        setIsLiked(!isLiked);
        if (onLike) onLike();
    };

    const loadComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }
        
        setLoadingComments(true);
        const { data } = await supabase
            .from('feed_comments')
            .select('*, profiles(full_name, avatar_url)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });
        
        setComments(data || []);
        setShowComments(true);
        setLoadingComments(false);
    };

    const addComment = async () => {
        if (!commentText.trim()) return;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: newComment } = await supabase
            .from('feed_comments')
            .insert({
                post_id: post.id,
                user_id: user.id,
                content: commentText
            })
            .select('*, profiles(full_name, avatar_url)')
            .single();
        
        if (newComment) {
            setComments([...comments, newComment]);
            setCommentText('');
            
            // Update comment count
            await supabase
                .from('feed_posts')
                .update({ comments_count: comments.length + 1 })
                .eq('id', post.id);
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

    const typeBadge = getTypeBadge();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Post Header */}
            <div className="p-5 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {post.author_name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {post.author_name || 'Scarlify Admin'}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge.color}`}>
                                    {typeBadge.label}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(post.published_at)}
                            </p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Post Content */}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                    {post.content}
                </p>

                {/* Post Image */}
                {post.image_url && (
                    <div className="rounded-lg overflow-hidden mb-4">
                        <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-96"
                        />
                    </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 transition-colors ${
                            isLiked ? 'text-red-500' : 'hover:text-red-500'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                        <span>{likesCount}</span>
                    </button>
                    <button 
                        onClick={loadComments}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto">
                        <Bookmark className="w-4 h-4" />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-5 pb-5 pt-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                    {/* Add Comment */}
                    <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-bold">You</span>
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={2}
                            />
                            {commentText.trim() && (
                                <button
                                    onClick={addComment}
                                    className="mt-2 px-4 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                                >
                                    Post Comment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold">
                                            {comment.profiles?.full_name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {comment.profiles?.full_name || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {comment.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <button className="hover:text-primary">Like</button>
                                            <button className="hover:text-primary">Reply</button>
                                            <span>{formatDate(comment.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}