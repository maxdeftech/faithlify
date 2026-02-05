// Custom hooks for data fetching from Supabase
import { useState, useEffect, useCallback } from 'react';
import * as postService from '../services/postService';
import * as churchService from '../services/churchService';
import * as messageService from '../services/messageService';
import * as readingPlanService from '../services/readingPlanService';
import * as bookmarkService from '../services/bookmarkService';
import * as userService from '../services/userService';

// Posts hook
export function usePosts(userId?: string) {
    const [posts, setPosts] = useState<postService.PostWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const data = await postService.getPosts(userId);
        setPosts(data);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const createPost = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'youtube') => {
        if (!userId) return null;
        const post = await postService.createPost(userId, content, mediaUrl, mediaType);
        if (post) await fetchPosts();
        return post;
    };

    const toggleLike = async (postId: string, isLiked: boolean) => {
        if (!userId) return;
        if (isLiked) await postService.unlikePost(postId, userId);
        else await postService.likePost(postId, userId);
        await fetchPosts();
    };

    return { posts, loading, createPost, toggleLike, refetch: fetchPosts };
}

// Churches hook
export function useChurches(userId?: string) {
    const [churches, setChurches] = useState<churchService.ChurchWithMembers[]>([]);
    const [pendingChurches, setPendingChurches] = useState<churchService.Church[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChurches = useCallback(async () => {
        setLoading(true);
        const [all, pending] = await Promise.all([
            churchService.getChurches(userId),
            churchService.getPendingChurches()
        ]);
        setChurches(all);
        setPendingChurches(pending);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchChurches(); }, [fetchChurches]);

    const joinChurch = async (churchId: string) => {
        if (!userId) return;
        await churchService.joinChurch(churchId, userId);
        await fetchChurches();
    };

    const leaveChurch = async (churchId: string) => {
        if (!userId) return;
        await churchService.leaveChurch(churchId, userId);
        await fetchChurches();
    };

    const verifyChurch = async (churchId: string) => {
        await churchService.verifyChurch(churchId);
        await fetchChurches();
    };

    const rejectChurch = async (churchId: string) => {
        await churchService.rejectChurch(churchId);
        await fetchChurches();
    };

    return { churches, pendingChurches, loading, joinChurch, leaveChurch, verifyChurch, rejectChurch, refetch: fetchChurches };
}

// Chats hook
export function useChats(userId?: string) {
    const [chats, setChats] = useState<messageService.ChatWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const data = await messageService.getUserChats(userId);
        setChats(data);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchChats(); }, [fetchChats]);

    const createChat = async (participantIds: string[], isGroup = false, groupName?: string) => {
        const chat = await messageService.createChat(participantIds, isGroup, groupName);
        if (chat) await fetchChats();
        return chat;
    };

    const deleteChat = async (chatId: string) => {
        await messageService.deleteChat(chatId);
        await fetchChats();
    };

    const archiveChat = async (chatId: string) => {
        await messageService.archiveChat(chatId);
        await fetchChats();
    };

    return { chats, loading, createChat, deleteChat, archiveChat, refetch: fetchChats };
}

// Messages hook with real-time
export function useMessages(chatId: string | null, userId?: string) {
    const [messages, setMessages] = useState<messageService.MessageWithSender[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chatId) { setMessages([]); setLoading(false); return; }

        const fetchMessages = async () => {
            setLoading(true);
            const data = await messageService.getChatMessages(chatId);
            setMessages(data);
            setLoading(false);
        };
        fetchMessages();

        // Subscribe to real-time updates
        const channel = messageService.subscribeToMessages(chatId, (newMsg) => {
            setMessages(prev => [...prev, newMsg as messageService.MessageWithSender]);
        });

        return () => { messageService.unsubscribeFromMessages(channel); };
    }, [chatId]);

    const sendMessage = async (text: string) => {
        if (!chatId || !userId) return;
        await messageService.sendMessage(chatId, userId, text);
    };

    return { messages, loading, sendMessage };
}

// Reading Plans hook
export function useReadingPlans(userId?: string) {
    const [plans, setPlans] = useState<readingPlanService.ReadingPlanWithCreator[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        const data = await readingPlanService.getReadingPlans(userId);
        setPlans(data);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const createPlan = async (title: string, description: string, verses: string[]) => {
        if (!userId) return null;
        const plan = await readingPlanService.createReadingPlan(userId, title, description, verses);
        if (plan) await fetchPlans();
        return plan;
    };

    const toggleSubscription = async (planId: string, isSubscribed: boolean) => {
        if (!userId) return;
        if (isSubscribed) await readingPlanService.unsubscribeFromPlan(planId, userId);
        else await readingPlanService.subscribeToPlan(planId, userId);
        await fetchPlans();
    };

    return { plans, loading, createPlan, toggleSubscription, refetch: fetchPlans };
}

// Bookmarks hook
export function useBookmarks(userId?: string) {
    const [bookmarks, setBookmarks] = useState<string[]>([]);

    const fetchBookmarks = useCallback(async () => {
        if (!userId) return;
        const data = await bookmarkService.getBookmarkedVerses(userId);
        setBookmarks(data);
    }, [userId]);

    useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

    const toggleBookmark = async (verseRef: string) => {
        if (!userId) return;
        await bookmarkService.toggleBookmark(userId, verseRef);
        await fetchBookmarks();
    };

    return { bookmarks, toggleBookmark };
}

// All Users hook (for search)
export function useAllUsers() {
    const [users, setUsers] = useState<userService.User[]>([]);

    useEffect(() => {
        userService.getAllUsers().then(setUsers);
    }, []);

    return users;
}
