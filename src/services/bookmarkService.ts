// Bookmark Service - Supabase operations for bookmarked verses
import supabase from '../lib/supabaseClient';
import type { Tables } from '../types/database.types';

export type BookmarkedVerse = Tables<'bookmarked_verses'>;

// Get user's bookmarked verses
export async function getBookmarkedVerses(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('bookmarked_verses')
        .select('verse_reference')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }

    return (data || []).map(d => d.verse_reference);
}

// Bookmark a verse
export async function bookmarkVerse(userId: string, verseReference: string): Promise<boolean> {
    const { error } = await supabase
        .from('bookmarked_verses')
        .insert({ user_id: userId, verse_reference: verseReference });

    // Ignore duplicate errors
    if (error && error.code !== '23505') {
        console.error('Error bookmarking verse:', error);
        return false;
    }

    return true;
}

// Remove bookmark
export async function removeBookmark(userId: string, verseReference: string): Promise<boolean> {
    const { error } = await supabase
        .from('bookmarked_verses')
        .delete()
        .eq('user_id', userId)
        .eq('verse_reference', verseReference);

    return !error;
}

// Toggle bookmark
export async function toggleBookmark(userId: string, verseReference: string): Promise<boolean> {
    // Check if bookmark exists
    const { data } = await supabase
        .from('bookmarked_verses')
        .select('id')
        .eq('user_id', userId)
        .eq('verse_reference', verseReference)
        .single();

    if (data) {
        return await removeBookmark(userId, verseReference);
    } else {
        return await bookmarkVerse(userId, verseReference);
    }
}
