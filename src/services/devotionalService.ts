// Devotional Service - Supabase operations for devotionals
import supabase from '../lib/supabaseClient';
import type { Tables } from '../types/database.types';

export type Devotional = Tables<'devotionals'>;

// Get today's devotional
export async function getDailyDevotional(): Promise<Devotional | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('date', today)
        .single();

    if (error) {
        console.error('Error fetching devotional:', error);
        // Fallback to most recent if today's is missing
        const { data: recent, error: recentError } = await supabase
            .from('devotionals')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (recentError) return null;
        return recent as Devotional;
    }

    return data as Devotional;
}

// Get all devotionals
export async function getAllDevotionals(): Promise<Devotional[]> {
    const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching devotionals:', error);
        return [];
    }

    return (data || []) as Devotional[];
}
