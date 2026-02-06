
export enum AppView {
  FEED = 'feed',
  BIBLE = 'bible',
  CHURCHES = 'churches',
  PROFILE = 'profile',
  MODERATION = 'moderation',
  LIVE = 'live',
  DEVO = 'devo',
  MESSAGES = 'messages',
  READING_PLANS = 'reading_plans',
  ADMIN_PANEL = 'admin_panel',
  SETTINGS = 'settings'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'church_admin' | 'admin';
  avatar?: string;
  isVerified?: boolean;
  following: string[];
  followers: string[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'youtube';
  likes: number;
  comments: Comment[];
  createdAt: string;
  isVerifiedChurch?: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Church {
  id: string;
  name: string;
  location: string;
  description: string;
  coverImage: string;
  isVerified: boolean;
  livestreamUrl?: string;
  membersCount: number;
  adminEmail: string;
  isPending?: boolean;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  author: string;
  churchId: string;
  date: string;
  image?: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  verses: string[];
  subscribers: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: string;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  admins?: string[]; // User IDs who are admins of the group
  isArchived?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'scam' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface ChatReport {
  id: string;
  chatId: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  blockedUser?: User;
  createdAt: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  friend?: User;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  isPrivate: boolean;
  notificationsEnabled: boolean;
}

export interface ChatParticipantPermissions {
  can_add_members: boolean;
  can_remove_members: boolean;
  can_edit_info: boolean;
}
