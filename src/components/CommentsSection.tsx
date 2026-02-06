import React, { useEffect, useState } from 'react';
import { Send, Trash2, X, Loader2 } from 'lucide-react';
import { getComments, addComment, deleteComment, type CommentWithUser } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';

interface CommentsSectionProps {
    postId: string;
    onClose: () => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId, onClose }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        setLoading(true);
        const data = await getComments(postId);
        setComments(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setSubmitting(true);
        const comment = await addComment(postId, user.id, newComment.trim());
        setSubmitting(false);

        if (comment) {
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        const success = await deleteComment(commentId);
        if (success) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    return (
        <div className="border-t border-white/5 bg-slate-950/30 rounded-b-2xl animate-in slide-in-from-top-2">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h3 className="font-bold text-sm text-slate-300">Comments ({comments.length})</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                    <X size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-500" /></div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-4">No comments yet. Be the first to share your thoughts.</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <img
                                src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-slate-200">{comment.user?.name || 'Unknown User'}</span>
                                        <span className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-300">{comment.content}</p>

                                    {(user?.id === comment.user_id || user?.role === 'admin' || user?.role === 'moderator') && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl disabled:opacity-50 transition-colors"
                >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
};
