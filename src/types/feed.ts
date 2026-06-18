// src/types/feed.ts

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  status: 'draft' | 'published' | 'archived';
  author_id?: string;
  author_name?: string;
  category?: string;
  is_featured?: boolean;
  views?: number;
  created_at: string;
  updated_at?: string;
  published_at?: string;
}

export interface PostFormData {
  title: string;
  content: string;
  image_url: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  is_featured: boolean;
}

export type PostStatus = 'draft' | 'published' | 'archived';
export type PostFilter = 'all' | PostStatus;