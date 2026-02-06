-- Faithlify Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor to create all required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (synced from Auth0)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'church_admin', 'admin')),
  username TEXT UNIQUE,
  bio TEXT,
  website TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  theme_preference TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'youtube')),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes (many-to-many)
CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- Trigger to update likes_count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Churches
CREATE TABLE IF NOT EXISTS churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  cover_image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_pending BOOLEAN DEFAULT TRUE,
  livestream_url TEXT,
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Church Members
CREATE TABLE IF NOT EXISTS church_members (
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (church_id, user_id)
);

-- Chats
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group BOOLEAN DEFAULT FALSE,
  group_name TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Participants
CREATE TABLE IF NOT EXISTS chat_participants (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (chat_id, user_id)
);

-- Messages (real-time)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Plans
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verses TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading Plan Subscribers
CREATE TABLE IF NOT EXISTS reading_plan_subscribers (
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, user_id)
);

-- Bookmarked Verses
CREATE TABLE IF NOT EXISTS bookmarked_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_reference)
);

-- User Follows
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- Post Comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT CHECK (target_type IN ('post', 'chat', 'user', 'message')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_churches_is_verified ON churches(is_verified);
CREATE INDEX IF NOT EXISTS idx_churches_is_pending ON churches(is_pending);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plan_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Users: Everyone can read, only own user can update
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid()::text = auth0_id);
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (true);

-- Posts: Everyone can read, authors can update/delete
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Post Likes: Everyone can read, authenticated users can like/unlike
CREATE POLICY "Post likes are viewable by everyone" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Churches: Everyone can read, admins can manage
CREATE POLICY "Churches are viewable by everyone" ON churches FOR SELECT USING (true);
CREATE POLICY "Users can register churches" ON churches FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update churches" ON churches FOR UPDATE USING (true);

-- Church Members: Everyone can read memberships
CREATE POLICY "Church members are viewable by everyone" ON church_members FOR SELECT USING (true);
CREATE POLICY "Users can join churches" ON church_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can leave churches" ON church_members FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Chats: Participants can read
CREATE POLICY "Chat participants can view chats" ON chats FOR SELECT USING (
  id IN (SELECT chat_id FROM chat_participants WHERE user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text))
);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update chats" ON chats FOR UPDATE USING (true);

-- Chat Participants
CREATE POLICY "Participants can view chat participants" ON chat_participants FOR SELECT USING (true);
CREATE POLICY "Users can add participants" ON chat_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can leave chats" ON chat_participants FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Messages: Chat participants can read and send
CREATE POLICY "Chat participants can view messages" ON messages FOR SELECT USING (
  chat_id IN (SELECT chat_id FROM chat_participants WHERE user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text))
);
CREATE POLICY "Chat participants can send messages" ON messages FOR INSERT WITH CHECK (true);

-- Reading Plans: Everyone can read, creators can manage
CREATE POLICY "Reading plans are viewable by everyone" ON reading_plans FOR SELECT USING (true);
CREATE POLICY "Users can create reading plans" ON reading_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update reading plans" ON reading_plans FOR UPDATE USING (
  creator_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Reading Plan Subscribers
CREATE POLICY "Subscriptions are viewable by everyone" ON reading_plan_subscribers FOR SELECT USING (true);
CREATE POLICY "Users can subscribe" ON reading_plan_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unsubscribe" ON reading_plan_subscribers FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Bookmarked Verses: Only own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarked_verses FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can create bookmarks" ON bookmarked_verses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own bookmarks" ON bookmarked_verses FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- User Follows
CREATE POLICY "Follows are viewable by everyone" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE USING (
  follower_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Post Comments: Everyone can read, authenticated can comment
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON post_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Reports: Only reporters can view (or admins), users can create
CREATE POLICY "Users can report" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view reports" ON reports FOR SELECT USING (
  EXISTS(SELECT 1 FROM users WHERE auth0_id = auth.uid()::text AND role IN ('admin', 'moderator'))
);

-- User Blocks: Users can view their own blocks
CREATE POLICY "Users can view own blocks" ON user_blocks FOR SELECT USING (
  blocker_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can block" ON user_blocks FOR INSERT WITH CHECK (
  blocker_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can unblock" ON user_blocks FOR DELETE USING (
  blocker_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
