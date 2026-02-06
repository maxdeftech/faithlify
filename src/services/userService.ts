// User Service - Supabase operations for users
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables, UpdateTables } from '../types/database.types';

export type User = Tables<'users'>;

// Sync Auth0 user to Supabase
export async function syncUserFromAuth0(auth0User: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
}): Promise<User | null> {
    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth0_id', auth0User.sub)
        .single();

    if (existingUser) {
        return existingUser as User;
    }

    // Create new user
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            auth0_id: auth0User.sub,
            email: auth0User.email,
            name: auth0User.name,
            avatar_url: auth0User.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth0User.name)}&background=random`,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating user:', error);
        return null;
    }

    return newUser as User;
}

// Get user by auth0_id
export async function getUserByAuth0Id(auth0Id: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth0_id', auth0Id)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

    return data as User;
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data as User;
}

// Get all users (for search, admin)
export async function getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return (data || []) as User[];
}

// Update user profile
export async function updateUser(userId: string, updates: UpdateTables<'users'>): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user:', error);
        return null;
    }

    return data as User;
}

// Get user followers
export async function getFollowers(userId: string): Promise<User[]> {
    const { data, error } = await supabase
        .from('user_follows')
        .select('follower:users!follower_id(*)')
        .eq('following_id', userId);

    if (error) {
        console.error('Error fetching followers:', error);
        return [];
    }

    return (data || []).map((d: any) => d.follower).filter(Boolean);
}

// Get user following
export async function getFollowing(userId: string): Promise<User[]> {
    const { data, error } = await supabase
        .from('user_follows')
        .select('following:users!following_id(*)')
        .eq('follower_id', userId);

    if (error) {
        console.error('Error fetching following:', error);
        return [];
    }

    return (data || []).map((d: any) => d.following).filter(Boolean);
}

// Follow user
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId });

    return !error;
}

// Unfollow user
export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

    return !error;
}

// Block user
export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_blocks')
        .insert({ blocker_id: blockerId, blocked_id: blockedId });

    return !error;
}

// Unblock user
export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
    const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', blockerId)
        .eq('blocked_id', blockedId);

    return !error;
}

// Get blocked users
export async function getBlockedUsers(userId: string): Promise<User[]> {
    const { data, error } = await supabase
        .from('user_blocks')
        .select('blocked:users!blocked_id(*)')
        .eq('blocker_id', userId);

    if (error) {
        console.error('Error fetching blocked users:', error);
        return [];
    }

    return (data || []).map((d: any) => d.blocked).filter(Boolean);
}
