import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Shield, Lock, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUser, getBlockedUsers, unblockUser, type User as DatabaseUser } from '../services/userService';
import { uploadMedia } from '../services/postService';
import { GlassCard } from './GlassCard';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, refreshUser } = useAuth(); // Need to ensure AuthContext provides refreshUser or similar
    // Actually AuthContext usually updates state if we update Auth0, but here we update Supabase user.
    // We might need to manually update local user state or rely on AuthContext re-fetching.
    // Based on AuthContext.tsx, it listens to Auth0 and fetches Supabase user. We might need a way to trigger refetch.
    // For now, let's assume we can just update local state or user object in context updates automatically?
    // Looking at AuthContext, it has `refreshUser` or we can just reload.
    // Let's check AuthContext later. For now, we assume we update DB and maybe refresh page or context.

    const [activeTab, setActiveTab] = useState<'profile' | 'blocks'>('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        website: user?.website || '',
        is_public: user?.is_public ?? true,
        theme_preference: user?.theme_preference || 'system'
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);

    // Blocked Users State
    const [blockedUsers, setBlockedUsers] = useState<DatabaseUser[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'blocks' && user) {
            loadBlockedUsers();
        }
    }, [isOpen, activeTab, user]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                website: user.website || '',
                is_public: user.is_public ?? true,
                theme_preference: user.theme_preference || 'system'
            });
            setAvatarPreview(user.avatar_url);
        }
    }, [isOpen, user]);

    const loadBlockedUsers = async () => {
        if (!user) return;
        setLoadingBlocks(true);
        const users = await getBlockedUsers(user.id);
        setBlockedUsers(users);
        setLoadingBlocks(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        let avatarUrl = user.avatar_url;
        if (avatarFile) {
            const uploadedUrl = await uploadMedia(avatarFile);
            if (uploadedUrl) avatarUrl = uploadedUrl;
        }

        const updates = {
            ...formData,
            avatar_url: avatarUrl
        };

        const updatedUser = await updateUser(user.id, updates);

        if (updatedUser) {
            // Ideally notify auth context
            // window.location.reload(); // Simple way to refresh app state for now
            // Or better, assume parents re-render if we can update context.
            onClose();
            // Force reload to update context if we don't have refreshUser
            window.location.reload();
        }
        setLoading(false);
    };

    const handleUnblock = async (blockedId: string) => {
        if (!user) return;
        if (confirm('Unblock this user?')) {
            await unblockUser(user.id, blockedId);
            setBlockedUsers(prev => prev.filter(u => u.id !== blockedId));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <GlassCard className="max-w-2xl w-full h-[80vh] flex flex-col p-0 overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Settings</h2>
                    <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
                </div>

                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('blocks')}
                        className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'blocks' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        Blocked Users
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'profile' ? (
                        <div className="space-y-6 max-w-lg mx-auto">
                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <img
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${formData.name}`}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-800"
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <ImageIcon className="text-white" size={24} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Profile Photo</h3>
                                    <p className="text-xs text-slate-400">Click to upload a new one.</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Username (Unique)</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 h-24 resize-none"
                                        placeholder="Tell us about your faith journey..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Website</label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                        placeholder="https://"
                                    />
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="pt-4 border-t border-white/5">
                                <h3 className="font-bold text-sm text-slate-300 mb-4 flex items-center gap-2"><Lock size={16} /> Privacy</h3>
                                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                                    <div>
                                        <span className="font-bold text-sm block">Public Profile</span>
                                        <span className="text-xs text-slate-400">Anyone can see your posts and profile</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_public ? 'bg-blue-500' : 'bg-slate-700'}`} onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}>
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loadingBlocks ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-500" /></div>
                            ) : blockedUsers.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>You haven't blocked anyone.</p>
                                </div>
                            ) : (
                                blockedUsers.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar_url || ''} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <h4 className="font-bold">{u.name}</h4>
                                                <p className="text-xs text-slate-400">@{u.username || 'user'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnblock(u.id)}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20"
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-slate-900/50">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-sm text-slate-400 hover:text-white">Cancel</button>
                    {activeTab === 'profile' && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2 rounded-xl font-bold text-sm bg-gradient-accent text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
