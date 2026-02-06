// Post Service - Supabase operations for posts
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables } from '../types/database.types';

export type Post = Tables<'posts'>;
export type Comment = Tables<'post_comments'>;

export interface PostWithUser extends Post {
    user: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
    isLiked?: boolean;
}

// Upload media file (requires Supabase Storage 'posts' bucket)
export async function uploadMedia(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading media:', error);
        return null;
    }

    const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
    return data.publicUrl;
}

export interface CommentWithUser extends Comment {
    user: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
}

// Get all posts with user info
export async function getPosts(currentUserId?: string): Promise<PostWithUser[]> {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      user:users(id, name, avatar_url)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    // If user is logged in, check which posts they've liked
    if (currentUserId && data) {
        const { data: likes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', currentUserId);

        const likedPostIds = new Set((likes || []).map(l => l.post_id));

        return data.map((post: any) => ({
            ...post,
            isLiked: likedPostIds.has(post.id),
        }));
    }

    return (data || []) as PostWithUser[];
}

// Create post
export async function createPost(
    userId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'video' | 'youtube'
): Promise<Post | null> {
    const { data, error } = await supabase
        .from('posts')
        .insert({
            user_id: userId,
            content,
            media_url: mediaUrl,
            media_type: mediaType,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating post:', error);
        return null;
    }

    return data as Post;
}

// Delete post
export async function deletePost(postId: string): Promise<boolean> {
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    return !error;
}

// Like post
export async function likePost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });

    return !error;
}

// Unlike post
export async function unlikePost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

    return !error;
}

// Get user's posts
export async function getUserPosts(userId: string): Promise<PostWithUser[]> {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      user:users(id, name, avatar_url)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user posts:', error);
        return [];
    }

    return (data || []) as PostWithUser[];
}

// Get comments for a post
export async function getComments(postId: string): Promise<CommentWithUser[]> {
    const { data, error } = await supabase
        .from('post_comments')
        .select(`
            *,
            user:users(id, name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return (data || []) as CommentWithUser[];
}

// Add comment
export async function addComment(postId: string, userId: string, content: string): Promise<CommentWithUser | null> {
    const { data, error } = await supabase
        .from('post_comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content,
        })
        .select(`
            *,
            user:users(id, name, avatar_url)
        `)
        .single();

    if (error) {
        console.error('Error adding comment:', error);
        return null;
    }

    return data as CommentWithUser;
}

// Delete comment
export async function deleteComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

    return !error;
}

