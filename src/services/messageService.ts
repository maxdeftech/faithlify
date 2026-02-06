// Message Service - Supabase operations for chats and messages
import supabase from '../lib/supabaseClient';
import type { Tables, InsertTables } from '../types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type Chat = Tables<'chats'>;
export type Message = Tables<'messages'>;

export interface ChatWithDetails extends Chat {
    participants: Array<{
        user_id: string;
        is_admin: boolean;
        user: {
            id: string;
            name: string;
            avatar_url: string | null;
        };
    }>;
    last_message?: Message;
    unread_count: number;
}

export interface MessageWithSender extends Message {
    sender: {
        id: string;
        name: string;
        avatar_url: string | null;
    };
}

// Get user's chats
export async function getUserChats(userId: string): Promise<ChatWithDetails[]> {
    // Get chat IDs where user is participant
    const { data: participantData, error: pError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);

    if (pError || !participantData) {
        console.error('Error fetching user chats:', pError);
        return [];
    }

    const chatIds = participantData.map(p => p.chat_id);
    if (chatIds.length === 0) return [];

    // Get chat details
    const { data: chats, error: cError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

    if (cError || !chats) {
        console.error('Error fetching chats:', cError);
        return [];
    }

    // Get participants for each chat
    const { data: allParticipants } = await supabase
        .from('chat_participants')
        .select(`
      chat_id,
      user_id,
      is_admin,
      user:users(id, name, avatar_url)
    `)
        .in('chat_id', chatIds);

    // Get last message for each chat
    const chatDetails: ChatWithDetails[] = await Promise.all(
        chats.map(async (chat) => {
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const participants = (allParticipants || [])
                .filter((p: any) => p.chat_id === chat.id)
                .map((p: any) => ({
                    user_id: p.user_id,
                    is_admin: p.is_admin,
                    user: p.user,
                }));

            return {
                ...chat,
                participants,
                last_message: lastMsg || undefined,
                unread_count: 0, // Can implement read receipts later
            };
        })
    );

    return chatDetails as ChatWithDetails[];
}

// Get chat messages
export async function getChatMessages(chatId: string): Promise<MessageWithSender[]> {
    const { data, error } = await supabase
        .from('messages')
        .select(`
      *,
      sender:users!sender_id(id, name, avatar_url)
    `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return (data || []) as MessageWithSender[];
}

// Send message
export async function sendMessage(chatId: string, senderId: string, text: string): Promise<Message | null> {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: senderId,
            text,
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        return null;
    }

    return data as Message;
}

// Create new chat (1-on-1)
export async function createChat(participantIds: string[], isGroup = false, groupName?: string): Promise<Chat | null> {
    // Create the chat
    const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
            is_group: isGroup,
            group_name: groupName,
        })
        .select()
        .single();

    if (chatError || !chat) {
        console.error('Error creating chat:', chatError);
        return null;
    }

    // Add participants
    const participantInserts = participantIds.map((userId, index) => ({
        chat_id: chat.id,
        user_id: userId,
        is_admin: index === 0, // First user is admin
    }));

    const { error: pError } = await supabase
        .from('chat_participants')
        .insert(participantInserts);

    if (pError) {
        console.error('Error adding participants:', pError);
        // Rollback chat creation
        await supabase.from('chats').delete().eq('id', chat.id);
        return null;
    }

    return chat as Chat;
}

// Add participant to group chat
export async function addParticipant(chatId: string, userId: string, isAdmin = false): Promise<boolean> {
    const { error } = await supabase
        .from('chat_participants')
        .insert({
            chat_id: chatId,
            user_id: userId,
            is_admin: isAdmin,
        });

    return !error;
}

// Find existing 1-on-1 chat between two users
export async function findExistingChat(userId1: string, userId2: string): Promise<Chat | null> {
    // Get all non-group chats for user1
    const { data: user1Chats } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId1);

    if (!user1Chats || user1Chats.length === 0) return null;

    const chatIds = user1Chats.map(c => c.chat_id);

    // Check which of these chats also have user2 and are not groups
    const { data: sharedChats } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .eq('is_group', false);

    if (!sharedChats || sharedChats.length === 0) return null;

    // Find the chat that has exactly user2 as the other participant
    for (const chat of sharedChats) {
        const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id);

        if (participants && participants.length === 2) {
            const participantIds = participants.map(p => p.user_id);
            if (participantIds.includes(userId1) && participantIds.includes(userId2)) {
                return chat as Chat;
            }
        }
    }

    return null;
}

// Delete chat
export async function deleteChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

    return !error;
}

// Archive chat
export async function archiveChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
        .from('chats')
        .update({ is_archived: true })
        .eq('id', chatId);

    return !error;
}

// Subscribe to new messages (real-time)
export function subscribeToMessages(
    chatId: string,
    onMessage: (message: Message) => void
): RealtimeChannel {
    return supabase
        .channel(`messages:${chatId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
                onMessage(payload.new as Message);
            }
        )
        .subscribe();
}

// Unsubscribe from messages
export function unsubscribeFromMessages(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
}
