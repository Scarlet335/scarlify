// src/app/admin/tabs/FeedPosts.tsx

'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Plus, Edit, Trash2, Eye, Clock, Megaphone, 
  X, Loader2, AlertCircle, CheckCircle,
  Calendar, Tag, Search, FileText
} from 'lucide-react';

// Updated interface to include 'archived'
interface FeedPost {
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

// Updated to allow 'archived' as well
interface PostFormData {
  title: string;
  content: string;
  image_url: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  is_featured: boolean;
}

type PostStatus = 'draft' | 'published' | 'archived';
type PostFilter = 'all' | PostStatus;

export default function FeedPosts() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    image_url: '',
    status: 'draft',
    category: '',
    is_featured: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PostFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPosts(data as FeedPost[] || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      if (!formData.title.trim()) {
        setFormError('Title is required');
        return;
      }
      if (!formData.content.trim()) {
        setFormError('Content is required');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const newPost = {
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || null,
        status: formData.status,
        category: formData.category || null,
        is_featured: formData.is_featured || false,
        author_id: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('feed_posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;

      setPosts([data as FeedPost, ...posts]);
      resetForm();
      setShowCreateModal(false);
    } catch (error: any) {
      console.error('Error creating post:', error);
      setFormError(error.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      setSubmitting(true);
      setFormError(null);

      const updatedPost = {
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || null,
        status: formData.status,
        category: formData.category || null,
        is_featured: formData.is_featured || false,
        updated_at: new Date().toISOString(),
        published_at: formData.status === 'published' && editingPost.status !== 'published' 
          ? new Date().toISOString() 
          : editingPost.published_at
      };

      const { data, error } = await supabase
        .from('feed_posts')
        .update(updatedPost)
        .eq('id', editingPost.id)
        .select()
        .single();

      if (error) throw error;

      setPosts(posts.map(p => p.id === editingPost.id ? data as FeedPost : p));
      resetForm();
      setShowCreateModal(false);
      setEditingPost(null);
    } catch (error: any) {
      console.error('Error updating post:', error);
      setFormError(error.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post');
    }
  };

  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, status: newStatus } : p
      ));
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      status: 'draft',
      category: '',
      is_featured: false
    });
    setFormError(null);
  };

  const openEditModal = (post: FeedPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      image_url: post.image_url || '',
      status: post.status || 'draft',
      category: post.category || '',
      is_featured: post.is_featured || false
    });
    setShowCreateModal(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'archived':
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home Feed Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage posts displayed on the home feed</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingPost(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'published', 'draft', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as PostFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Create your first post to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                resetForm();
                setEditingPost(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                {post.image_url && (
                  <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                        {post.title || 'Untitled'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(post.status)}`}>
                        {getStatusIcon(post.status)}
                        {post.status}
                      </span>
                      {post.is_featured && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.category && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {post.category}
                      </span>
                    )}
                    {post.views !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} views
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {['draft', 'published', 'archived'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(post.id, status as PostStatus)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                            post.status === status
                              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => openEditModal(post)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                  setEditingPost(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter post title"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your post content..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                    {formData.image_url && (
                      <button
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="max-h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Announcement, Update"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-700 dark:text-gray-300">
                    Feature this post (appears prominently)
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                  setEditingPost(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPost ? handleUpdatePost : handleCreatePost}
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}