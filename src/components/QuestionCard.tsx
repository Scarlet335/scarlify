'use client';
import Link from 'next/link';
import { MessageCircle, ThumbsUp, Eye, Award, CheckCircle } from 'lucide-react';

interface QuestionCardProps {
    question: {
        id: string;
        title: string;
        content: string;
        subject: string;
        subject_code: string;
        level: string;
        answers_count: number;
        views_count: number;
        upvotes_count: number;
        has_accepted_answer: boolean;
        is_resolved: boolean;
        tags: string[];
        created_at: string;
        user?: {
            full_name: string;
        };
    };
}

export default function QuestionCard({ question }: QuestionCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Link href={`/questions-and-answers/${question.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {question.subject} ({question.subject_code})
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {question.level}
                        </span>
                        {question.has_accepted_answer && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Solved
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400">
                        {formatDate(question.created_at)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {question.title}
                </h3>

                {/* Content Preview */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {question.content}
                </p>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{question.answers_count} answers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{question.upvotes_count} votes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>{question.views_count} views</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}