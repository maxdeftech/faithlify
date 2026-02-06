import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, Trash2 } from 'lucide-react';
import { type PostWithUser, deletePost } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { CommentsSection } from './CommentsSection';
import { ReportModal } from './ReportModal';
import { GlassCard } from './GlassCard';

interface FeedPostProps {
    post: PostWithUser;
    onLike: (postId: string, isLiked: boolean) => void;
    onDelete?: (postId: string) => void;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post, onLike, onDelete }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        setIsDeleting(true);
        const success = await deletePost(post.id);
        if (success && onDelete) {
            onDelete(post.id);
        }
        setIsDeleting(false);
    };

    return (
        <>
            <GlassCard className="mb-6 border-white/5 group relative transition-all hover:bg-slate-900/70">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-800"
                            alt=""
                        />
                        <div>
                            <h3 className="font-semibold text-slate-100">{post.user?.name || 'Unknown User'}</h3>
                            <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showOptions && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10 animate-in slide-in-from-top-2 fade-in">
                                {(user?.id === post.user_id || user?.role === 'admin') && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete Post
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowReportModal(true);
                                        setShowOptions(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Flag size={16} /> Report
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                {post.media_url && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/5">
                        {post.media_type === 'image' ? (
                            <img src={post.media_url} alt="Post content" className="w-full h-auto max-h-96 object-cover" />
                        ) : post.media_type === 'video' ? (
                            <video src={post.media_url} controls className="w-full" />
                        ) : null}
                    </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-white/5 text-slate-400">
                    <button
                        onClick={() => onLike(post.id, post.isLiked || false)}
                        className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                    >
                        <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                        <span className="text-sm font-medium">{post.likes_count}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-2 transition-colors ${showComments ? 'text-blue-400' : 'hover:text-blue-400'}`}
                    >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">Comments</span>
                    </button>

                    <button className="flex items-center gap-2 hover:text-purple-400 transition-colors ml-auto">
                        <Share2 size={20} />
                    </button>
                </div>

                {showComments && (
                    <div className="mt-4 pt-4">
                        <CommentsSection postId={post.id} onClose={() => setShowComments(false)} />
                    </div>
                )}
            </GlassCard>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                targetType="post"
                targetId={post.id}
                reporterId={user?.id || ''}
            />
        </>
    );
};
