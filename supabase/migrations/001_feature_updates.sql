-- Faithlify Feature Updates Migration
-- Run this SQL in the Supabase SQL Editor after the initial schema.sql

-- =====================================================
-- USER TABLE UPDATES
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark'));

-- =====================================================
-- POST COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- =====================================================
-- POST REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, reporter_id)
);

-- =====================================================
-- CHAT REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'scam', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BLOCKED USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Drop the default primary key and add composite
ALTER TABLE blocked_users DROP CONSTRAINT IF EXISTS blocked_users_pkey;
ALTER TABLE blocked_users ADD PRIMARY KEY (blocker_id, blocked_id);

-- =====================================================
-- FRIENDSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- =====================================================
-- CHAT PARTICIPANTS UPDATE - Add custom permissions
-- =====================================================
ALTER TABLE chat_participants ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{"can_add_members": false, "can_remove_members": false, "can_edit_info": false}'::jsonb;

-- =====================================================
-- LIKED POSTS TABLE (to track which posts user liked)
-- =====================================================
-- Already exists as post_likes, but adding index for user lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Post Comments RLS
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Post Reports RLS
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON post_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own reports" ON post_reports FOR SELECT USING (
  reporter_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Admins can view all reports" ON post_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth0_id = auth.uid()::text AND role = 'admin')
);

-- Chat Reports RLS
ALTER TABLE chat_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create chat reports" ON chat_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own chat reports" ON chat_reports FOR SELECT USING (
  reporter_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Blocked Users RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own blocks" ON blocked_users FOR SELECT USING (
  blocker_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can block others" ON blocked_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unblock" ON blocked_users FOR DELETE USING (
  blocker_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Friendships RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view friendships" ON friendships FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text) OR
  friend_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can create friend requests" ON friendships FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update friendships" ON friendships FOR UPDATE USING (
  friend_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
CREATE POLICY "Users can delete friendships" ON friendships FOR DELETE USING (
  user_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text) OR
  friend_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);

-- Messages - Add delete policy
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (
  sender_id IN (SELECT id FROM users WHERE auth0_id = auth.uid()::text)
);
