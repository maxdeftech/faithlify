// Reading Plan Service - Supabase operations for reading plans
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables } from '../types/database.types';

export type ReadingPlan = Tables<'reading_plans'>;

export interface ReadingPlanWithCreator extends ReadingPlan {
    creator: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
    subscriber_count: number;
    is_subscribed?: boolean;
}

// Get all reading plans
export async function getReadingPlans(currentUserId?: string): Promise<ReadingPlanWithCreator[]> {
    const { data, error } = await supabase
        .from('reading_plans')
        .select(`
      *,
      creator:users!creator_id(id, name, avatar_url)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reading plans:', error);
        return [];
    }

    const planIds = (data || []).map(p => p.id);

    // Get subscriber counts
    const { data: subsData } = await supabase
        .from('reading_plan_subscribers')
        .select('plan_id, user_id')
        .in('plan_id', planIds);

    const subCounts: Record<string, number> = {};
    const userSubs = new Set<string>();

    (subsData || []).forEach((s: any) => {
        subCounts[s.plan_id] = (subCounts[s.plan_id] || 0) + 1;
        if (currentUserId && s.user_id === currentUserId) {
            userSubs.add(s.plan_id);
        }
    });

    return (data || []).map((plan: any) => ({
        ...plan,
        subscriber_count: subCounts[plan.id] || 0,
        is_subscribed: userSubs.has(plan.id),
    }));
}

// Create reading plan
export async function createReadingPlan(
    creatorId: string,
    title: string,
    description: string,
    verses: string[]
): Promise<ReadingPlan | null> {
    const { data, error } = await supabase
        .from('reading_plans')
        .insert({
            creator_id: creatorId,
            title,
            description,
            verses,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating reading plan:', error);
        return null;
    }

    // Auto-subscribe creator
    await supabase
        .from('reading_plan_subscribers')
        .insert({ plan_id: (data as ReadingPlan).id, user_id: creatorId });

    return data as ReadingPlan;
}

// Subscribe to plan
export async function subscribeToPlan(planId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('reading_plan_subscribers')
        .insert({ plan_id: planId, user_id: userId });

    return !error;
}

// Unsubscribe from plan
export async function unsubscribeFromPlan(planId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('reading_plan_subscribers')
        .delete()
        .eq('plan_id', planId)
        .eq('user_id', userId);

    return !error;
}

// Get user's subscribed plans
export async function getUserSubscribedPlans(userId: string): Promise<ReadingPlanWithCreator[]> {
    const { data: subData } = await supabase
        .from('reading_plan_subscribers')
        .select('plan_id')
        .eq('user_id', userId);

    if (!subData || subData.length === 0) return [];

    const planIds = subData.map(s => s.plan_id);

    const { data, error } = await supabase
        .from('reading_plans')
        .select(`
      *,
      creator:users!creator_id(id, name, avatar_url)
    `)
        .in('id', planIds);

    if (error) {
        console.error('Error fetching subscribed plans:', error);
        return [];
    }

    return (data || []).map((plan: any) => ({
        ...plan,
        subscriber_count: 0, // Can be fetched if needed
        is_subscribed: true,
    }));
}

// Delete reading plan
export async function deleteReadingPlan(planId: string): Promise<boolean> {
    const { error } = await supabase
        .from('reading_plans')
        .delete()
        .eq('id', planId);

    return !error;
}
