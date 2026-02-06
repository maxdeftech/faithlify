import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { createReport } from '../services/reportService';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: 'post' | 'chat' | 'user' | 'message';
    targetId: string;
    reporterId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, targetType, targetId, reporterId }) => {
    const [reason, setReason] = useState('');
    const [customDetails, setCustomDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const reasons = [
        'Spam or misleading',
        'Inappropriate content',
        'Harassment or hate speech',
        'Violence or physical harm',
        'Other'
    ];

    const handleSubmit = async () => {
        if (!reason) return;
        setIsSubmitting(true);

        const fullReason = reason === 'Other' ? `Other: ${customDetails}` : reason;

        const result = await createReport(reporterId, targetType, targetId, fullReason);

        setIsSubmitting(false);
        if (result) {
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setReason('');
                setCustomDetails('');
                onClose();
            }, 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">Report Submitted</h2>
                        <p className="text-slate-400">Thank you for helping keep our community safe.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" />
                            Report Content
                        </h2>

                        <div className="space-y-4 mb-6">
                            <p className="text-sm text-slate-400">Why are you reporting this?</p>
                            {reasons.map((r) => (
                                <label key={r} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border border-transparent has-[:checked]:border-blue-500/50">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={r}
                                        checked={reason === r}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-4 h-4 text-blue-500 bg-slate-800 border-white/20 focus:ring-blue-500 focus:ring-offset-0"
                                    />
                                    <span className="text-slate-200">{r}</span>
                                </label>
                            ))}

                            {reason === 'Other' && (
                                <textarea
                                    value={customDetails}
                                    onChange={(e) => setCustomDetails(e.target.value)}
                                    placeholder="Please provide more details..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                />
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!reason || isSubmitting}
                                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Report'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
