import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, ExternalLink, MessageCircle, User as UserIcon, Loader2 } from 'lucide-react';
import { getReports, updateReportStatus, type ReportWithReporter } from '../services/reportService';
import { GlassCard } from './GlassCard';
import { useAuth } from '../contexts/AuthContext';

export const AdminReportsPanel: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<ReportWithReporter[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        const data = await getReports();
        setReports(data);
        setLoading(false);
    };

    const handleUpdateStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
        const result = await updateReportStatus(reportId, status);
        if (result) {
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
        }
    };

    const filteredReports = reports.filter(r => r.status === filter);

    const getTargetIcon = (type: string) => {
        switch (type) {
            case 'post': return <MessageCircle size={16} />;
            case 'user': return <UserIcon size={16} />;
            case 'chat': return <MessageCircle size={16} />;
            case 'message': return <MessageCircle size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'pending' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('resolved')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'resolved' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Resolved
                    </button>
                    <button
                        onClick={() => setFilter('dismissed')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === 'dismissed' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Dismissed
                    </button>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {filteredReports.length} Reports
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-400" /></div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400">No {filter} reports found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map(report => (
                        <GlassCard key={report.id} className="border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${report.status === 'pending' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700/50 text-slate-400'}`}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-100 uppercase text-xs tracking-wider flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                                                {getTargetIcon(report.target_type)} {report.target_type}
                                            </span>
                                            <span className="text-xs text-slate-500">• {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-200">Reason: {report.reason}</p>
                                    </div>
                                </div>
                                {report.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                            className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'resolved')}
                                            className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            <CheckCircle size={14} className="inline mr-1" /> Resolve
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl text-sm text-slate-300 mb-3 border border-white/5">
                                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Target ID</span>
                                <code className="font-mono text-xs text-blue-400">{report.target_id}</code>
                                {/* In a real app, we'd fetch the preview content here based on target_type and ID */}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <img src={report.reporter.avatar_url || ''} className="w-5 h-5 rounded-full" />
                                <span>Reported by <span className="text-slate-300 font-bold">{report.reporter.name}</span></span>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};
