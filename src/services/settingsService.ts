// Settings Service - Supabase operations for user settings
import supabase from '../lib/supabaseClient';

export interface UserSettings {
    theme: 'light' | 'dark';
    isPrivate: boolean;
}

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase
        .from('users')
        .select('theme_preference, is_private')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return { theme: 'dark', isPrivate: false };
    }

    return {
        theme: data.theme_preference || 'dark',
        isPrivate: data.is_private || false,
    };
}

// Update theme preference
export async function updateTheme(userId: string, theme: 'light' | 'dark'): Promise<boolean> {
    const { error } = await supabase
        .from('users')
        .update({ theme_preference: theme })
        .eq('id', userId);

    if (!error) {
        localStorage.setItem('faithlify_theme', theme);
    }

    return !error;
}

// Update privacy setting
export async function updatePrivacy(userId: string, isPrivate: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('users')
        .update({ is_private: isPrivate })
        .eq('id', userId);

    return !error;
}

// Get theme from localStorage (for initial load before auth)
export function getLocalTheme(): 'light' | 'dark' {
    const stored = localStorage.getItem('faithlify_theme');
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
}

// Set theme in localStorage
export function setLocalTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem('faithlify_theme', theme);
}
