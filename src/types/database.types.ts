// Database Types for Supabase
// These types define the structure of our Supabase tables

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    auth0_id: string;
                    email: string;
                    name: string;
                    avatar_url: string | null;
                    role: 'user' | 'moderator' | 'church_admin' | 'admin';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    auth0_id: string;
                    email: string;
                    name: string;
                    avatar_url?: string | null;
                    role?: 'user' | 'moderator' | 'church_admin' | 'admin';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    auth0_id?: string;
                    email?: string;
                    name?: string;
                    avatar_url?: string | null;
                    role?: 'user' | 'moderator' | 'church_admin' | 'admin';
                    created_at?: string;
                };
                Relationships: [];
            };
            posts: {
                Row: {
                    id: string;
                    user_id: string;
                    content: string;
                    media_url: string | null;
                    media_type: 'image' | 'video' | 'youtube' | null;
                    likes_count: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    content: string;
                    media_url?: string | null;
                    media_type?: 'image' | 'video' | 'youtube' | null;
                    likes_count?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    content?: string;
                    media_url?: string | null;
                    media_type?: 'image' | 'video' | 'youtube' | null;
                    likes_count?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            post_likes: {
                Row: {
                    post_id: string;
                    user_id: string;
                };
                Insert: {
                    post_id: string;
                    user_id: string;
                };
                Update: {
                    post_id?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            churches: {
                Row: {
                    id: string;
                    name: string;
                    location: string | null;
                    description: string | null;
                    cover_image: string | null;
                    is_verified: boolean;
                    is_pending: boolean;
                    livestream_url: string | null;
                    admin_email: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    location?: string | null;
                    description?: string | null;
                    cover_image?: string | null;
                    is_verified?: boolean;
                    is_pending?: boolean;
                    livestream_url?: string | null;
                    admin_email?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    location?: string | null;
                    description?: string | null;
                    cover_image?: string | null;
                    is_verified?: boolean;
                    is_pending?: boolean;
                    livestream_url?: string | null;
                    admin_email?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            church_members: {
                Row: {
                    church_id: string;
                    user_id: string;
                };
                Insert: {
                    church_id: string;
                    user_id: string;
                };
                Update: {
                    church_id?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            chats: {
                Row: {
                    id: string;
                    is_group: boolean;
                    group_name: string | null;
                    is_archived: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    is_group?: boolean;
                    group_name?: string | null;
                    is_archived?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    is_group?: boolean;
                    group_name?: string | null;
                    is_archived?: boolean;
                    created_at?: string;
                };
                Relationships: [];
            };
            chat_participants: {
                Row: {
                    chat_id: string;
                    user_id: string;
                    is_admin: boolean;
                };
                Insert: {
                    chat_id: string;
                    user_id: string;
                    is_admin?: boolean;
                };
                Update: {
                    chat_id?: string;
                    user_id?: string;
                    is_admin?: boolean;
                };
                Relationships: [];
            };
            messages: {
                Row: {
                    id: string;
                    chat_id: string;
                    sender_id: string;
                    text: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    chat_id: string;
                    sender_id: string;
                    text: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    chat_id?: string;
                    sender_id?: string;
                    text?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            reading_plans: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    creator_id: string;
                    verses: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    creator_id: string;
                    verses?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    creator_id?: string;
                    verses?: string[];
                    created_at?: string;
                };
                Relationships: [];
            };
            reading_plan_subscribers: {
                Row: {
                    plan_id: string;
                    user_id: string;
                };
                Insert: {
                    plan_id: string;
                    user_id: string;
                };
                Update: {
                    plan_id?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            bookmarked_verses: {
                Row: {
                    id: string;
                    user_id: string;
                    verse_reference: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    verse_reference: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    verse_reference?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            user_follows: {
                Row: {
                    follower_id: string;
                    following_id: string;
                };
                Insert: {
                    follower_id: string;
                    following_id: string;
                };
                Update: {
                    follower_id?: string;
                    following_id?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
