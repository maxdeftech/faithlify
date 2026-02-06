export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    auth0_id: string
                    email: string
                    name: string
                    avatar_url: string | null
                    role: 'user' | 'moderator' | 'church_admin' | 'admin'
                    username: string | null
                    bio: string | null
                    website: string | null
                    is_public: boolean
                    theme_preference: 'system' | 'light' | 'dark'
                    created_at: string
                }
                Insert: {
                    id?: string
                    auth0_id: string
                    email: string
                    name: string
                    avatar_url?: string | null
                    role?: 'user' | 'moderator' | 'church_admin' | 'admin'
                    username?: string | null
                    bio?: string | null
                    website?: string | null
                    is_public?: boolean
                    theme_preference?: 'system' | 'light' | 'dark'
                    created_at?: string
                }
                Update: {
                    id?: string
                    auth0_id?: string
                    email?: string
                    name?: string
                    avatar_url?: string | null
                    role?: 'user' | 'moderator' | 'church_admin' | 'admin'
                    username?: string | null
                    bio?: string | null
                    website?: string | null
                    is_public?: boolean
                    theme_preference?: 'system' | 'light' | 'dark'
                    created_at?: string
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    media_url: string | null
                    media_type: 'image' | 'video' | 'youtube' | null
                    likes_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    media_url?: string | null
                    media_type?: 'image' | 'video' | 'youtube' | null
                    likes_count?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    media_url?: string | null
                    media_type?: 'image' | 'video' | 'youtube' | null
                    likes_count?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post_likes: {
                Row: {
                    post_id: string
                    user_id: string
                }
                Insert: {
                    post_id: string
                    user_id: string
                }
                Update: {
                    post_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "post_likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            post_comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "post_comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "post_comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            churches: {
                Row: {
                    id: string
                    name: string
                    location: string | null
                    description: string | null
                    cover_image: string | null
                    is_verified: boolean
                    is_pending: boolean
                    livestream_url: string | null
                    admin_email: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    location?: string | null
                    description?: string | null
                    cover_image?: string | null
                    is_verified?: boolean
                    is_pending?: boolean
                    livestream_url?: string | null
                    admin_email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    location?: string | null
                    description?: string | null
                    cover_image?: string | null
                    is_verified?: boolean
                    is_pending?: boolean
                    livestream_url?: string | null
                    admin_email?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            church_members: {
                Row: {
                    church_id: string
                    user_id: string
                }
                Insert: {
                    church_id: string
                    user_id: string
                }
                Update: {
                    church_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "church_members_church_id_fkey"
                        columns: ["church_id"]
                        isOneToOne: false
                        referencedRelation: "churches"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "church_members_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            chats: {
                Row: {
                    id: string
                    is_group: boolean
                    group_name: string | null
                    is_archived: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    is_group?: boolean
                    group_name?: string | null
                    is_archived?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    is_group?: boolean
                    group_name?: string | null
                    is_archived?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            chat_participants: {
                Row: {
                    chat_id: string
                    user_id: string
                    is_admin: boolean
                }
                Insert: {
                    chat_id: string
                    user_id: string
                    is_admin?: boolean
                }
                Update: {
                    chat_id?: string
                    user_id?: string
                    is_admin?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "chat_participants_chat_id_fkey"
                        columns: ["chat_id"]
                        isOneToOne: false
                        referencedRelation: "chats"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chat_participants_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            messages: {
                Row: {
                    id: string
                    chat_id: string
                    sender_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    sender_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    sender_id?: string
                    text?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_chat_id_fkey"
                        columns: ["chat_id"]
                        isOneToOne: false
                        referencedRelation: "chats"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reading_plans: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    creator_id: string
                    verses: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    creator_id: string
                    verses?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    creator_id?: string
                    verses?: string[]
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reading_plans_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reading_plan_subscribers: {
                Row: {
                    plan_id: string
                    user_id: string
                }
                Insert: {
                    plan_id: string
                    user_id: string
                }
                Update: {
                    plan_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reading_plan_subscribers_plan_id_fkey"
                        columns: ["plan_id"]
                        isOneToOne: false
                        referencedRelation: "reading_plans"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reading_plan_subscribers_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            bookmarked_verses: {
                Row: {
                    id: string
                    user_id: string
                    verse_reference: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    verse_reference: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    verse_reference?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookmarked_verses_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_follows: {
                Row: {
                    follower_id: string
                    following_id: string
                }
                Insert: {
                    follower_id: string
                    following_id: string
                }
                Update: {
                    follower_id?: string
                    following_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_follows_follower_id_fkey"
                        columns: ["follower_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_follows_following_id_fkey"
                        columns: ["following_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reports: {
                Row: {
                    id: string
                    reporter_id: string
                    target_type: 'post' | 'chat' | 'user' | 'message'
                    target_id: string
                    reason: string
                    status: 'pending' | 'resolved' | 'dismissed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    reporter_id: string
                    target_type: 'post' | 'chat' | 'user' | 'message'
                    target_id: string
                    reason: string
                    status?: 'pending' | 'resolved' | 'dismissed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    reporter_id?: string
                    target_type?: 'post' | 'chat' | 'user' | 'message'
                    target_id?: string
                    reason?: string
                    status?: 'pending' | 'resolved' | 'dismissed'
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reports_reporter_id_fkey"
                        columns: ["reporter_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_blocks: {
                Row: {
                    blocker_id: string
                    blocked_id: string
                    created_at: string
                }
                Insert: {
                    blocker_id: string
                    blocked_id: string
                    created_at?: string
                }
                Update: {
                    blocker_id?: string
                    blocked_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_blocks_blocker_id_fkey"
                        columns: ["blocker_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_blocks_blocked_id_fkey"
                        columns: ["blocked_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }

            devotionals: {
                Row: {
                    id: string
                    title: string
                    content: string
                    author: string
                    church_id: string
                    date: string
                    image: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    author: string
                    church_id: string
                    date: string
                    image?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    author?: string
                    church_id?: string
                    date?: string
                    image?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "devotionals_church_id_fkey"
                        columns: ["church_id"]
                        isOneToOne: false
                        referencedRelation: "churches"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type InsertTables<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type UpdateTables<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
