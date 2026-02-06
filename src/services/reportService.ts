// Report Service - Supabase operations for reporting content
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables, UpdateTables } from '../types/database.types';

export type Report = Tables<'reports'>;

export interface ReportWithReporter extends Report {
    reporter: {
        id: string;
        name: string;
        avatar_url: string | null;
        email: string;
    };
}

// Create a new report
export async function createReport(
    reporterId: string,
    targetType: 'post' | 'chat' | 'user' | 'message',
    targetId: string,
    reason: string
): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .insert({
            reporter_id: reporterId,
            target_type: targetType,
            target_id: targetId,
            reason,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating report:', error);
        return null;
    }

    return data as Report;
}

// Get all reports (Admin only)
export async function getReports(): Promise<ReportWithReporter[]> {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            reporter:users!reporter_id(id, name, avatar_url, email)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }

    return (data || []) as ReportWithReporter[];
}

// Update report status (Admin only)
export async function updateReportStatus(
    reportId: string,
    status: 'pending' | 'resolved' | 'dismissed'
): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)
        .select()
        .single();

    if (error) {
        console.error('Error updating report status:', error);
        return null;
    }

    return data as Report;
}
