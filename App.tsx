
import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Book,
  Church as ChurchIcon,
  User as UserIcon,
  Shield,
  Search,
  Bell,
  PlusCircle,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Video,
  Sun,
  ListTodo,
  Bookmark,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  X,
  Sparkles,
  CheckCircle,
  Users,
  Archive,
  Settings,
  ShieldAlert,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { AppView } from './types';
import { BIBLE_BOOKS } from './constants';
import { GoogleGenAI, Type } from "@google/genai";
import { useAuth } from './src/contexts/AuthContext';
import { usePosts, useChurches, useChats, useMessages, useReadingPlans, useBookmarks, useAllUsers, useDevotionals } from './src/hooks/useSupabase';
import { GlassCard } from './src/components/GlassCard';
import { FeedPost } from './src/components/FeedPost';
import { EditProfileModal } from './src/components/EditProfileModal';
import { AdminReportsPanel } from './src/components/AdminReportsPanel';
import { ReportModal } from './src/components/ReportModal';

// UI Components
// UI Components removed GlassCard as it's imported now


const Badge: React.FC<{ count: number }> = ({ count }) => (
  count > 0 ? (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
      {count}
    </span>
  ) : null
);

const NavButton: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  mobile?: boolean;
  badgeCount?: number;
}> = ({ active, icon, label, onClick, mobile, badgeCount = 0 }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-gradient-accent text-white shadow-lg shadow-blue-500/20'
      : 'text-slate-400 hover:text-white hover:bg-white/5'
      } ${mobile ? 'flex-col gap-1 py-2 text-[10px]' : 'w-full'}`}
  >
    {icon}
    <span className={mobile ? 'hidden xs:block' : ''}>{label}</span>
    {badgeCount > 0 && <Badge count={badgeCount} />}
  </button>
);

const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <GlassCard className="max-w-md w-full p-8 md:p-10 border-white/10 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-xl shadow-blue-500/40 mx-auto mb-4">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Faithlify</h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? "Welcome back to your faith community" : "Join the world's most trusted faith platform"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-white transition-all" required />
            </div>
          )}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input type="email" placeholder="Email address" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-white transition-all" required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input type="password" placeholder="Password" className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-white transition-all" required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-accent text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? "Sign In" : "Create Account"}</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          {isLogin ? "New to Faithlify?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 font-bold hover:underline">
            {isLogin ? "Sign up now" : "Log in"}
          </button>
        </p>
      </GlassCard>
    </div>
  );
};

const App: React.FC = () => {
  // Auth from context
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();

  // View state
  const [currentView, setCurrentView] = useState<AppView>(AppView.FEED);
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase data hooks
  const { posts, loading: postsLoading, createPost, removePost, uploadPostMedia, toggleLike } = usePosts(user?.id);
  const { churches, pendingChurches, loading: churchesLoading, joinChurch, leaveChurch, verifyChurch, rejectChurch } = useChurches(user?.id);
  const { chats, loading: chatsLoading, createChat, deleteChat: deleteChatAction, archiveChat, addMember } = useChats(user?.id);
  const { plans: readingPlans, loading: plansLoading, createPlan, toggleSubscription } = useReadingPlans(user?.id);
  const { bookmarks: bookmarkedVerses, toggleBookmark } = useBookmarks(user?.id);
  const { devotionals, loading: devosLoading } = useDevotionals();
  const allUsers = useAllUsers();

  // Local UI state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isBibleLoading, setIsBibleLoading] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [isBulkChatMode, setIsBulkChatMode] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planGenLoading, setPlanGenLoading] = useState(false);
  const [newPlan, setNewPlan] = useState<{ title: string; description: string; verses: string[] }>({ title: '', description: '', verses: [] });
  const [dailyVerse, setDailyVerse] = useState<{ text: string; ref: string } | null>(null);

  const [bibleContent, setBibleContent] = useState<{ book: string; chapter: number; verses: { v: number; t: string }[] }>({
    book: 'John',
    chapter: 3,
    verses: []
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'verification' | 'reports'>('verification');
  const [reportData, setReportData] = useState<{ type: 'chat' | 'post' | 'user' | 'message', id: string } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Messages for active chat
  const { messages: chatMessages, sendMessage } = useMessages(activeChatId, user?.id);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const universalResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return {
      users: allUsers.filter(u => u.name.toLowerCase().includes(q) && u.id !== user?.id),
      churches: churches.filter(c => c.name.toLowerCase().includes(q)),
      plans: readingPlans.filter(p => p.title.toLowerCase().includes(q)),
      books: BIBLE_BOOKS.filter(b => b.toLowerCase().includes(q)).slice(0, 5)
    };
  }, [searchQuery, user?.id, churches, readingPlans, allUsers]);

  const hasAnyResults = universalResults && (
    universalResults.users.length > 0 ||
    universalResults.churches.length > 0 ||
    universalResults.plans.length > 0 ||
    universalResults.books.length > 0
  );

  useEffect(() => {
    fetchBibleChapter('John', 3);
    const fetchDailyVerse = async () => {
      try {
        // Fix: Use new GoogleGenAI instance for API call following guidelines
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Provide an inspiring KJV Bible verse for today with its reference. Format: JSON with 'text' and 'reference' keys.",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: { text: { type: Type.STRING }, reference: { type: Type.STRING } }
            }
          }
        });
        const data = JSON.parse(response.text);
        setDailyVerse({ text: data.text, ref: data.reference });
      } catch (e) {
        setDailyVerse({ text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5" });
      }
    };
    fetchDailyVerse();
  }, []);

  const fetchBibleChapter = async (book: string, chapter: number) => {
    setIsBibleLoading(true);
    try {
      const response = await fetch(`https://bible-api.com/${book}+${chapter}`);
      const data = await response.json();
      if (data.verses) {
        setBibleContent({ book, chapter, verses: data.verses.map((v: any) => ({ v: v.verse, t: v.text })) });
      }
    } catch (e) {
      console.error("Bible fetch failed", e);
    } finally {
      setIsBibleLoading(false);
    }
  };

  const generateAIPlan = async () => {
    if (!newPlan.title) return;
    setPlanGenLoading(true);
    try {
      // Fix: Use new GoogleGenAI instance for API call following guidelines
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 5-day Bible reading plan for the topic: "${newPlan.title}". Format: JSON with 'description' and 'verses' (array of strings like "John 3:16").`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              verses: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      const data = JSON.parse(response.text);
      setNewPlan(prev => ({ ...prev, description: data.description, verses: data.verses }));
    } catch (e) { console.error(e); } finally { setPlanGenLoading(false); }
  };

  const handleSearchResultClick = async (type: string, item: any) => {
    setSearchQuery('');
    if (type === 'user' && user) {
      const existing = chats.find(c => !c.is_group && c.participants.some(p => p.user_id === item.id));
      if (existing) setActiveChatId(existing.id);
      else {
        const newChat = await createChat([user.id, item.id]);
        if (newChat) setActiveChatId(newChat.id);
      }
      setCurrentView(AppView.MESSAGES);
    }
    if (type === 'church') setCurrentView(AppView.CHURCHES);
    if (type === 'plan') setCurrentView(AppView.READING_PLANS);
    if (type === 'book') { fetchBibleChapter(item, 1); setCurrentView(AppView.BIBLE); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId || !user) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleCreateGroup = async (name: string, participantIds: string[]) => {
    if (!user) return;
    const chat = await createChat([user.id, ...participantIds], true, name);
    if (chat) {
      setIsCreatingGroup(false);
      setActiveChatId(chat.id);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.FEED:
        return (
          <div className="max-w-2xl mx-auto py-6 px-4">
            {postsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
            ) : (
              <>
                <GlassCard className="mb-8 border-none shadow-xl shadow-blue-500/5">
                  <div className="flex gap-4">
                    <img src={user?.avatar_url || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-full" alt="" />
                    <div className="flex-1">
                      <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="What's on your heart?" className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 resize-none h-16" />

                      {previewUrl && (
                        <div className="relative mb-4 inline-block">
                          <img src={previewUrl} alt="Preview" className="h-32 rounded-xl object-cover border border-white/10" />
                          <button
                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                            className="absolute -top-2 -right-2 bg-slate-900 rounded-full p-1 text-slate-400 hover:text-white border border-white/10"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="flex gap-2">
                          <label className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-blue-400">
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                            <ImageIcon size={20} />
                          </label>
                        </div>
                        <button onClick={async () => {
                          if (user && (newPostContent.trim() || selectedFile)) {
                            let mediaUrl = undefined;
                            if (selectedFile) {
                              mediaUrl = await uploadPostMedia(selectedFile);
                              if (!mediaUrl && !newPostContent.trim()) return; // Failed upload and no text
                            }

                            await createPost(newPostContent, mediaUrl, selectedFile ? 'image' : undefined);
                            setNewPostContent('');
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }
                        }} disabled={!newPostContent.trim() && !selectedFile} className="bg-gradient-accent px-6 py-1.5 rounded-full font-bold text-sm">Post</button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
                {posts.map(post => (
                  <FeedPost
                    key={post.id}
                    post={post}
                    onLike={toggleLike}
                    onDelete={removePost}
                  />
                ))}

              </>
            )}
          </div>
        );

      case AppView.BIBLE:
        return (
          <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gradient font-serif">KJV Bible</h1>
              <div className="flex gap-4 items-center">
                <select value={bibleContent.book} onChange={(e) => fetchBibleChapter(e.target.value, 1)} className="glass px-4 py-2 rounded-lg text-sm bg-transparent outline-none border-white/10 appearance-none pr-8 cursor-pointer">
                  {BIBLE_BOOKS.map(b => <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchBibleChapter(bibleContent.book, Math.max(1, bibleContent.chapter - 1))} className="p-2 glass rounded-lg hover:bg-white/10"><ChevronLeft size={16} /></button>
                  <span className="text-sm font-bold min-w-[20px] text-center">{bibleContent.chapter}</span>
                  <button onClick={() => fetchBibleChapter(bibleContent.book, bibleContent.chapter + 1)} className="p-2 glass rounded-lg hover:bg-white/10"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
            <GlassCard className="flex-1 overflow-y-auto custom-scrollbar bg-white/[0.02] relative">
              {isBibleLoading && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm z-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
              <h2 className="text-2xl font-serif mb-8 pb-4 border-b border-white/5">{bibleContent.book} {bibleContent.chapter}</h2>
              <div className={`space-y-6 text-xl font-serif leading-relaxed text-slate-200 ${isBibleLoading ? 'opacity-30' : 'opacity-100'}`}>
                {bibleContent.verses.map(v => (
                  <div key={v.v} className="group relative">
                    <span className="text-xs text-blue-400 mr-3 align-top font-sans font-bold">{v.v}</span>
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => toggleBookmark(`${bibleContent.book} ${bibleContent.chapter}:${v.v}`)}>{v.t}</span>
                    <div className="inline-flex ml-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bookmarkedVerses.includes(`${bibleContent.book} ${bibleContent.chapter}:${v.v}`) ? (
                        <Bookmark className="w-4 h-4 text-blue-400 fill-current" />
                      ) : (
                        <button onClick={() => toggleBookmark(`${bibleContent.book} ${bibleContent.chapter}:${v.v}`)} className="text-slate-500 hover:text-blue-400"><Bookmark size={14} /></button>
                      )}
                      <button
                        onClick={() => {
                          setNewPostContent(`"${v.t}" - ${bibleContent.book} ${bibleContent.chapter}:${v.v}`);
                          setCurrentView(AppView.FEED);
                        }}
                        className="text-slate-500 hover:text-green-400"
                        title="Share to Feed"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        );

      case AppView.READING_PLANS:
        return (
          <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-10">
              <div><h1 className="text-3xl font-bold text-gradient">Scripture Paths</h1><p className="text-slate-400">Curated plans to grow your spiritual walk.</p></div>
              <button onClick={() => setIsCreatingPlan(true)} className="bg-gradient-accent px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"><PlusCircle size={18} /> Create Plan</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {readingPlans.map(plan => (
                <GlassCard key={plan.id} className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-100">{plan.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">{plan.verses.length} DAYS</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 flex-1">{plan.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">BY {plan.creator?.name}</span>
                    <button onClick={() => toggleSubscription(plan.id, plan.is_subscribed || false)} className={`text-xs font-bold px-4 py-2 rounded-lg ${plan.is_subscribed ? 'bg-white/10 text-slate-400' : 'bg-blue-500/10 text-blue-400'}`}>{plan.is_subscribed ? 'Following' : 'Follow'}</button>
                  </div>
                </GlassCard>
              ))}
            </div>
            {isCreatingPlan && (
              <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
                <GlassCard className="max-w-lg w-full animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">New Reading Plan</h2>
                    <button onClick={() => setIsCreatingPlan(false)}><X /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Topic or Goal</label>
                      <div className="flex gap-2">
                        <input type="text" value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="e.g. Forgiveness" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <button onClick={generateAIPlan} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20">{planGenLoading ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent animate-spin rounded-full" /> : <Sparkles size={20} />}</button>
                      </div>
                    </div>
                    {newPlan.description && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm leading-relaxed animate-in slide-in-from-top-2">
                        <p className="font-bold text-blue-400 mb-2">AI Summary</p>
                        {newPlan.description}
                        <div className="mt-4 space-y-2">
                          {newPlan.verses?.map((v, i) => <div key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /><span>{v}</span></div>)}
                        </div>
                      </div>
                    )}
                    <button onClick={async () => {
                      if (newPlan.title && newPlan.verses?.length) {
                        await createPlan(newPlan.title, newPlan.description || 'Custom', newPlan.verses);
                        setIsCreatingPlan(false);
                        setNewPlan({ title: '', description: '', verses: [] });
                      }
                    }} disabled={!newPlan.title || !newPlan.verses?.length} className="w-full py-3 bg-gradient-accent text-white font-bold rounded-xl disabled:opacity-30">Launch Plan</button>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        );

      case AppView.PROFILE:
        return (
          <div className="max-w-3xl mx-auto py-6 px-4">
            <GlassCard className="mb-8 p-0 overflow-hidden border-none shadow-2xl relative">
              <div className="h-40 bg-gradient-accent opacity-80" />
              <div className="px-8 pb-8 -mt-12 relative">
                <div className="flex justify-between items-end mb-6">
                  <img src={user?.avatar_url || 'https://ui-avatars.com/api/?name=User'} className="w-32 h-32 rounded-3xl border-4 border-slate-950 shadow-2xl" />
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingProfile(true)} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/10 border border-white/10 hover:bg-white/15 transition-colors">Edit Profile</button>
                    <button onClick={logout} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/20">Sign Out</button>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-slate-100">{user?.name}</h1>
                <p className="text-slate-400 mb-6">{user?.bio || 'Walking by faith, not by sight.'}</p>
                <div className="flex gap-10 pt-6 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-100">0</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-100">0</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Following</p>
                  </div>
                </div>
              </div>
            </GlassCard>
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ListTodo size={20} className="text-blue-400" /> Active Paths</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {readingPlans.filter(p => p.is_subscribed).map(p => (
                    <GlassCard key={p.id} className="border-l-4 border-l-blue-500">
                      <h3 className="font-bold text-sm mb-2">{p.title}</h3>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[35%]" /></div>
                    </GlassCard>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bookmark size={20} className="text-purple-400" /> Saved Scripture</h2>
                <div className="grid gap-3">
                  {bookmarkedVerses.map(v => <GlassCard key={v} className="py-3 px-4 flex justify-between items-center"><span className="text-sm font-serif">{v}</span><button onClick={() => toggleBookmark(v)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button></GlassCard>)}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Home size={20} className="text-green-400" /> My Activity</h2>
                {posts.filter(p => p.user_id === user?.id).map(p => (
                  <GlassCard key={p.id} className="mb-4 text-sm bg-white/5 border-white/5"><p>{p.content}</p></GlassCard>
                ))}
              </section>
            </div>

            <EditProfileModal isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} />
          </div>
        );

      case AppView.DEVO:
        return (
          <div className="max-w-4xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gradient mb-8">Daily Devotionals</h1>
            <h1 className="text-3xl font-bold text-gradient mb-8">Daily Devotionals</h1>
            {devosLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
            ) : devotionals.length === 0 ? (
              <div className="text-center p-12 text-slate-500">No devotionals for today.</div>
            ) : devotionals.map(devo => (
              <GlassCard key={devo.id} className="mb-8 p-0 overflow-hidden border-none shadow-2xl">
                <img src={devo.image || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80'} className="w-full h-64 object-cover" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4 text-blue-400 text-sm font-bold uppercase tracking-wider"><Sun className="w-4 h-4" /> Today's Reflection</div>
                  <h2 className="text-3xl font-bold mb-4">{devo.title}</h2>
                  <p className="text-slate-300 text-lg leading-relaxed mb-8">{devo.content}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">P</div>
                      <div><p className="text-sm font-bold">{devo.author}</p><p className="text-xs text-slate-500">Grace Community Church</p></div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"><Bookmark size={20} /> Save</button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case AppView.MESSAGES:
        return (
          <div className="max-w-6xl mx-auto py-6 px-4 flex gap-6 h-[calc(100vh-140px)]">
            <div className={`flex-1 md:flex-[0.35] glass rounded-3xl overflow-hidden flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Inbox</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setIsBulkChatMode(!isBulkChatMode)} className={`p-2 rounded-lg transition-all ${isBulkChatMode ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-slate-400'}`}><Settings size={20} /></button>
                    <button onClick={() => setIsCreatingGroup(true)} className="p-2 bg-gradient-accent rounded-lg text-white hover:scale-105 transition-all"><Users size={20} /></button>
                  </div>
                </div>
                {isBulkChatMode && (
                  <div className="flex gap-3 mb-4 animate-in slide-in-from-top-2">
                    <button onClick={handleArchiveChats} disabled={!selectedChatIds.length} className="flex-1 py-2 bg-white/5 rounded-xl text-xs font-bold border border-white/10 disabled:opacity-30 flex items-center justify-center gap-1"><Archive size={14} /> Archive</button>
                    <button onClick={handleBulkDeleteChats} disabled={!selectedChatIds.length} className="flex-1 py-2 bg-red-500/10 rounded-xl text-xs font-bold border border-red-500/20 text-red-400 disabled:opacity-30 flex items-center justify-center gap-1"><Trash2 size={14} /> Delete</button>
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search chats..." className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.filter(c => !c.is_archived).map(chat => {
                  const otherParticipant = chat.participants?.find(p => p.user_id !== user?.id);
                  const displayName = chat.is_group ? chat.group_name : otherParticipant?.user?.name || 'Unknown';
                  const displayAvatar = chat.is_group ? `https://ui-avatars.com/api/?name=${chat.group_name}&background=random` : otherParticipant?.user?.avatar_url;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => isBulkChatMode ? setSelectedChatIds(prev => prev.includes(chat.id) ? prev.filter(i => i !== chat.id) : [...prev, chat.id]) : setActiveChatId(chat.id)}
                      className={`p-4 border-b border-white/5 cursor-pointer transition-all flex items-center gap-4 ${activeChatId === chat.id ? 'bg-white/10 border-l-4 border-l-blue-500' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                    >
                      {isBulkChatMode && <input type="checkbox" checked={selectedChatIds.includes(chat.id)} readOnly className="rounded-full w-5 h-5 border-white/20 bg-white/5 checked:bg-blue-500" />}
                      <img src={displayAvatar} className="w-12 h-12 rounded-2xl" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold truncate text-slate-100">{displayName}</span><span className="text-[10px] text-slate-500 font-medium">10:35 AM</span></div>
                        <p className="text-sm text-slate-400 truncate leading-tight">Start chatting...</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`flex-[0.65] glass rounded-3xl flex flex-col relative overflow-hidden ${!activeChatId ? 'hidden md:flex items-center justify-center opacity-30' : 'flex'}`}>
              {!activeChat ? (
                <div className="text-center p-12"><MessageCircle size={64} className="mx-auto mb-4" /><p className="text-xl font-bold">Select a conversation to begin</p></div>
              ) : (
                <>
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                      {(() => {
                        const otherP = activeChat.participants?.find(p => p.user_id !== user?.id);
                        return (
                          <>
                            <img src={activeChat.is_group ? `https://ui-avatars.com/api/?name=${activeChat.group_name}` : otherP?.user?.avatar_url} className="w-10 h-10 rounded-xl" />
                            <div><h3 className="font-bold text-slate-100">{activeChat.is_group ? activeChat.group_name : otherP?.user?.name}</h3><p className="text-[10px] text-slate-500">{activeChat.is_group ? `${activeChat.participants?.length} members` : 'Active now'}</p></div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2 relative group">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5"><Settings size={20} /></button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 hidden group-hover:block nav-dropdown animate-in zoom-in-95">
                        {activeChat.is_group && (
                          <button
                            onClick={() => {
                              const userId = prompt("Enter User ID to add:"); // Simple prompt for now
                              if (userId) addMember(activeChat.id, userId);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2"
                          >
                            <Users size={14} className="text-blue-400" /> Add Member
                          </button>
                        )}
                        <button
                          onClick={() => setReportData({ type: 'chat', id: activeChat.id })}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2 text-red-400 hover:text-red-300"
                        >
                          <ShieldAlert size={14} /> Report Chat
                        </button>
                        <button onClick={async () => { setActiveChatId(null); await deleteChatAction(activeChatId!); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-sm font-bold flex items-center gap-2 text-red-400 hover:text-red-300"><Trash2 size={14} /> Delete Chat</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {chatMessages.map(m => (
                      <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'} group relative`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl relative ${m.sender_id === user?.id ? 'bg-gradient-accent text-white' : 'bg-white/10 text-slate-100'}`}>
                          {activeChat.is_group && m.sender_id !== user?.id && <p className="text-[10px] font-bold text-blue-400 mb-1">{m.sender?.name}</p>}
                          <p className="text-sm">{m.text}</p>
                          <p className="text-[8px] opacity-50 mt-1 text-right">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white/5 border-t border-white/5">
                    <div className="flex gap-2 glass p-2 rounded-2xl border border-white/5">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Write a message..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm pl-2" />
                      <button onClick={handleSendMessage} className="bg-gradient-accent p-2 rounded-xl text-white shadow-lg shadow-blue-500/20"><Send size={20} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div >
        );

      case AppView.CHURCHES:
        return (
          <div className="max-w-5xl mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-10">
              <div><h1 className="text-3xl font-bold text-gradient">Explore Churches</h1><p className="text-slate-400">Trusted global communities.</p></div>
              <button className="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"><PlusCircle size={18} /> Register Church</button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {churches.map(c => (
                <GlassCard key={c.id} className="p-0 overflow-hidden flex flex-col h-full border-none shadow-xl">
                  <img src={c.coverImage} className="w-full h-40 object-cover" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div><h3 className="font-bold text-slate-100">{c.name}</h3><p className="text-xs text-slate-500">{c.location}</p></div>
                      {c.isVerified && <CheckCircle2 className="text-blue-400 w-5 h-5" />}
                    </div>
                    <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{c.membersCount} Members</span>
                      <button className="text-sm font-bold text-blue-400 px-4 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all">Join</button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      case AppView.ADMIN_PANEL:
        return (
          <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><ShieldAlert className="text-red-500" /> Admin Control</h1>

            <div className="flex gap-6 mb-8 border-b border-white/5">
              <button
                onClick={() => setActiveAdminTab('verification')}
                className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeAdminTab === 'verification' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
              >
                Church Verification
              </button>
              <button
                onClick={() => setActiveAdminTab('reports')}
                className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeAdminTab === 'reports' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-white'}`}
              >
                Reports
              </button>
            </div>

            {activeAdminTab === 'verification' ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-4 text-slate-400">Pending Churches ({pendingChurches.length})</h2>
                {pendingChurches.length === 0 ? <p className="text-slate-500 italic">No pending verifications.</p> : pendingChurches.map(c => (
                  <GlassCard key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">{c.name[0]}</div>
                      <div><h3 className="font-bold text-slate-100">{c.name}</h3><p className="text-xs text-slate-500">{c.admin_email}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => verifyChurch(c.id)} className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-all">Verify</button>
                      <button onClick={() => rejectChurch(c.id)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all">Reject</button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <AdminReportsPanel />
            )}
          </div>
        );

      case AppView.LIVE:
        return (
          <div className="max-w-5xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gradient mb-8 flex items-center gap-3"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> Live Worship</h1>
            <div className="grid md:grid-cols-2 gap-6">
              {churches.filter(c => c.livestreamUrl).map(church => (
                <GlassCard key={church.id} className="overflow-hidden p-0 border-none shadow-xl">
                  <div className="aspect-video w-full bg-slate-900 flex items-center justify-center">
                    <iframe src={church.livestreamUrl} className="w-full h-full" allowFullScreen></iframe>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-slate-900/50">
                    <div><h3 className="font-bold">{church.name}</h3><p className="text-xs text-slate-500">{church.location}</p></div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold"><Video className="w-3 h-3" /> LIVE</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );

      default: return <div className="p-12 text-center text-slate-500 italic">Faithfully loading...</div>;
    }
  };

  const handleArchiveChats = async () => {
    for (const id of selectedChatIds) {
      await archiveChat(id);
    }
    setSelectedChatIds([]);
    setIsBulkChatMode(false);
  };

  const handleBulkDeleteChats = async () => {
    for (const id of selectedChatIds) {
      await deleteChatAction(id);
    }
    setSelectedChatIds([]);
    setIsBulkChatMode(false);
    setActiveChatId(null);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 overflow-x-hidden">
      {searchQuery && (
        <div className="fixed inset-0 z-[100] p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in flex justify-center pt-20">
          <GlassCard className="max-w-2xl w-full h-fit max-h-[80vh] overflow-y-auto border-blue-500/30 shadow-2xl p-6 custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Universal Search</h4>
              <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
            </div>
            {hasAnyResults ? (
              <div className="space-y-8">
                {universalResults.users.length > 0 && (
                  <section>
                    <h5 className="text-[10px] text-blue-400 font-bold mb-3 uppercase tracking-tighter">Believers</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {universalResults.users.map(u => (
                        <div key={u.id} onClick={() => handleSearchResultClick('user', u)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer group transition-all">
                          <img src={u.avatar} className="w-8 h-8 rounded-lg" />
                          <span className="font-medium group-hover:text-blue-400">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {universalResults.churches.length > 0 && (
                  <section>
                    <h5 className="text-[10px] text-purple-400 font-bold mb-3 uppercase tracking-tighter">Churches</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {universalResults.churches.map(c => (
                        <div key={c.id} onClick={() => handleSearchResultClick('church', c)} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer group transition-all">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/20">{c.name[0]}</div>
                          <span className="font-medium group-hover:text-purple-400 truncate">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {universalResults.books.length > 0 && (
                  <section>
                    <h5 className="text-[10px] text-green-400 font-bold mb-3 uppercase tracking-tighter">Scripture</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {universalResults.books.map(b => (
                        <div key={b} onClick={() => handleSearchResultClick('book', b)} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all border border-white/5">
                          <Book size={16} className="text-green-400" />
                          <span className="font-serif">Open the book of {b}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : <div className="text-center py-12"><p className="text-slate-500 italic">No matches found.</p></div>}
          </GlassCard>
        </div>
      )}

      {isCreatingGroup && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6">
          <GlassCard className="max-w-md w-full animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6">New Community</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Group Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/30" />
              <button onClick={() => handleCreateGroup("Study Group", ['u2', 'u3'])} className="w-full py-3 bg-gradient-accent rounded-xl font-bold text-white shadow-lg">Create</button>
              <button onClick={() => setIsCreatingGroup(false)} className="w-full py-2 font-bold text-slate-500">Cancel</button>
            </div>
          </GlassCard>
        </div>
      )}

      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 glass-dark border-r border-white/5 z-40 px-6 py-8">
        <div className="flex items-center gap-3 mb-10 px-4 cursor-pointer" onClick={() => setCurrentView(AppView.FEED)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-lg shadow-blue-500/40"><span className="text-2xl font-bold">F</span></div>
          <h1 className="text-2xl font-bold tracking-tighter">Faithlify</h1>
        </div>
        <nav className="flex-1 space-y-1">
          <NavButton active={currentView === AppView.FEED} icon={<Home size={20} />} label="Community" onClick={() => setCurrentView(AppView.FEED)} />
          <NavButton active={currentView === AppView.DEVO} icon={<Sun size={20} />} label="Devotional" onClick={() => setCurrentView(AppView.DEVO)} />
          <NavButton active={currentView === AppView.LIVE} icon={<Video size={20} />} label="Live Worship" onClick={() => setCurrentView(AppView.LIVE)} />
          <NavButton active={currentView === AppView.BIBLE} icon={<Book size={20} />} label="KJV Bible" onClick={() => setCurrentView(AppView.BIBLE)} />
          <NavButton active={currentView === AppView.READING_PLANS} icon={<ListTodo size={20} />} label="Scripture Paths" onClick={() => setCurrentView(AppView.READING_PLANS)} />
          <NavButton active={currentView === AppView.MESSAGES} icon={<MessageCircle size={20} />} label="Messages" onClick={() => setCurrentView(AppView.MESSAGES)} />
          <NavButton active={currentView === AppView.CHURCHES} icon={<ChurchIcon size={20} />} label="Explore" onClick={() => setCurrentView(AppView.CHURCHES)} />
          <NavButton active={currentView === AppView.PROFILE} icon={<UserIcon size={20} />} label="My Profile" onClick={() => setCurrentView(AppView.PROFILE)} />
          {user?.role === 'admin' && <NavButton active={currentView === AppView.ADMIN_PANEL} icon={<Shield size={20} />} label="Admin Control" onClick={() => setCurrentView(AppView.ADMIN_PANEL)} />}
        </nav>
        <div className="mt-8">
          <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-blue-400 mb-2">Daily Bread</h4>
            <p className="text-xs text-slate-300 italic mb-2 leading-relaxed">"{dailyVerse?.text}"</p>
            <p className="text-[10px] text-white font-bold">— {dailyVerse?.ref}</p>
          </GlassCard>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 pb-24 lg:pb-0">
        <header className="fixed top-0 inset-x-0 lg:left-72 h-16 lg:h-20 glass-dark border-b border-white/5 z-30 flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center font-bold">F</div>
            <div className="relative hidden md:block w-64 lg:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search believers, churches, scriptures..." className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative p-2 hover:bg-white/5 rounded-full"><Bell size={22} className="text-slate-400" /><div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" /></button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer group" onClick={() => setCurrentView(AppView.PROFILE)}>
              <div className="text-right hidden xl:block"><span className="block font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{user?.name}</span><span className="block text-[10px] text-slate-500 uppercase tracking-widest">{user?.role}</span></div>
              <img src={user?.avatar_url || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-blue-500/50 shadow-lg" />
            </div>
          </div>
        </header>
        <div className="mt-16 lg:mt-20">{renderContent()}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 glass-dark border-t border-white/10 z-50 px-2 py-2 flex justify-around items-center h-20">
        <NavButton mobile active={currentView === AppView.FEED} icon={<Home size={22} />} label="Home" onClick={() => setCurrentView(AppView.FEED)} />
        <NavButton mobile active={currentView === AppView.LIVE} icon={<Video size={22} />} label="Live" onClick={() => setCurrentView(AppView.LIVE)} />
        <div className="relative -top-4"><button onClick={() => setCurrentView(AppView.FEED)} className="w-14 h-14 rounded-full bg-gradient-accent shadow-xl shadow-blue-500/40 flex items-center justify-center border-4 border-slate-950"><PlusCircle className="w-8 h-8" /></button></div>
        <NavButton mobile active={currentView === AppView.BIBLE} icon={<Book size={22} />} label="Bible" onClick={() => setCurrentView(AppView.BIBLE)} />
        <NavButton mobile active={currentView === AppView.MESSAGES} icon={<MessageCircle size={22} />} label="Inbox" onClick={() => setCurrentView(AppView.MESSAGES)} />
      </nav>
    </div>
  );
};

export default App;
