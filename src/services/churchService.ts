// Church Service - Supabase operations for churches
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables, UpdateTables } from '../types/database.types';

export type Church = Tables<'churches'>;

export interface ChurchWithMembers extends Church {
    members_count: number;
    is_member?: boolean;
}

// Get all churches
export async function getChurches(currentUserId?: string): Promise<ChurchWithMembers[]> {
    const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching churches:', error);
        return [];
    }

    // Get member counts
    const churchIds = (data || []).map(c => c.id);
    const { data: membersData } = await supabase
        .from('church_members')
        .select('church_id, user_id')
        .in('church_id', churchIds);

    const memberCounts: Record<string, number> = {};
    const userMemberships = new Set<string>();

    (membersData || []).forEach((m: any) => {
        memberCounts[m.church_id] = (memberCounts[m.church_id] || 0) + 1;
        if (currentUserId && m.user_id === currentUserId) {
            userMemberships.add(m.church_id);
        }
    });

    return (data || []).map(church => ({
        ...(church as Church),
        members_count: memberCounts[(church as Church).id] || 0,
        is_member: userMemberships.has((church as Church).id),
    })) as ChurchWithMembers[];
}

// Get verified churches with livestream
export async function getLiveChurches(): Promise<Church[]> {
    const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('is_verified', true)
        .not('livestream_url', 'is', null)
        .order('name');

    if (error) {
        console.error('Error fetching live churches:', error);
        return [];
    }

    return (data || []) as Church[];
}

// Get pending churches (for admin)
export async function getPendingChurches(): Promise<Church[]> {
    const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('is_pending', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending churches:', error);
        return [];
    }

    return (data || []) as Church[];
}

// Register a new church
export async function registerChurch(church: InsertTables<'churches'>): Promise<Church | null> {
    const { data, error } = await supabase
        .from('churches')
        .insert({
            ...church,
            is_pending: true,
            is_verified: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error registering church:', error);
        return null;
    }

    return data as Church;
}

// Verify church (admin action)
export async function verifyChurch(churchId: string): Promise<boolean> {
    const { error } = await supabase
        .from('churches')
        .update({ is_verified: true, is_pending: false })
        .eq('id', churchId);

    return !error;
}

// Reject church (admin action)
export async function rejectChurch(churchId: string): Promise<boolean> {
    const { error } = await supabase
        .from('churches')
        .delete()
        .eq('id', churchId);

    return !error;
}

// Join church
export async function joinChurch(churchId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('church_members')
        .insert({ church_id: churchId, user_id: userId });

    return !error;
}

// Leave church
export async function leaveChurch(churchId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('church_members')
        .delete()
        .eq('church_id', churchId)
        .eq('user_id', userId);

    return !error;
}

// Update church
export async function updateChurch(churchId: string, updates: UpdateTables<'churches'>): Promise<Church | null> {
    const { data, error } = await supabase
        .from('churches')
        .update(updates)
        .eq('id', churchId)
        .select()
        .single();

    if (error) {
        console.error('Error updating church:', error);
        return null;
    }

    return data as Church;
}
