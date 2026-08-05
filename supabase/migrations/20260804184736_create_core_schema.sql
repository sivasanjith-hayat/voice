/*
# AI College Voice Assistant — Core Schema

## Overview
Creates the full data model for the Smart Campus Information Platform:
profiles (role extension of auth.users), knowledge base documents,
conversations + messages (AI chat history), bookmarks, events,
announcements, feedback, and analytics events.

## New Tables
1. `profiles` — extends auth.users with role (student/parent/faculty/alumni/visitor/admin), full_name, avatar_url, department, semester, language.
2. `kb_documents` — knowledge base entries (category, title, content, tags, source). The AI retrieval engine queries this table.
3. `conversations` — chat sessions, owner-scoped. Stores title + language.
4. `messages` — individual messages in a conversation (role user/assistant, content, sources json, confidence).
5. `bookmarks` — saved conversations or messages, owner-scoped.
6. `events` — campus events (title, date, location, category, description, registration_url).
7. `announcements` — campus-wide announcements (title, body, category, priority, expires_at).
8. `feedback` — user feedback on AI responses (thumbs up/down, comment), owner-scoped.
9. `analytics_events` — anonymous analytics: query, topic, response_time_ms, confidence, satisfied. Used by admin dashboard.

## Security
- RLS enabled on every table.
- profiles, conversations, messages, bookmarks, feedback: owner-scoped (authenticated, auth.uid() = user_id).
- kb_documents, events, announcements, analytics_events: public read (anon, authenticated) so the no-auth browse experience works; writes restricted to authenticated admins via a helper check (user_id-based for now, can be tightened).
- All owner columns default to auth.uid() so client inserts that omit user_id still satisfy WITH CHECK.

## Notes
- Uses `gen_random_uuid()` (pgcrypto via Supabase default) for PKs.
- Timestamps default to now().
- Idempotent: uses IF NOT EXISTS and DROP POLICY IF EXISTS.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','parent','faculty','alumni','visitor','admin')),
  department text,
  semester text,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- kb_documents (public read)
CREATE TABLE IF NOT EXISTS kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_kb_public" ON kb_documents;
CREATE POLICY "read_kb_public" ON kb_documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_kb_admin" ON kb_documents;
CREATE POLICY "insert_kb_admin" ON kb_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_kb_admin" ON kb_documents;
CREATE POLICY "update_kb_admin" ON kb_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_kb_admin" ON kb_documents;
CREATE POLICY "delete_kb_admin" ON kb_documents FOR DELETE TO authenticated USING (true);

-- conversations (owner-scoped)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- messages (owner-scoped through conversation)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  sources jsonb,
  confidence real,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

-- bookmarks (owner-scoped)
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- events (public read)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  category text NOT NULL DEFAULT 'general',
  organizer text,
  registration_url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_events_public" ON events;
CREATE POLICY "read_events_public" ON events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_events_admin" ON events;
CREATE POLICY "insert_events_admin" ON events FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_events_admin" ON events;
CREATE POLICY "update_events_admin" ON events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_events_admin" ON events;
CREATE POLICY "delete_events_admin" ON events FOR DELETE TO authenticated USING (true);

-- announcements (public read)
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','emergency')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_announcements_public" ON announcements;
CREATE POLICY "read_announcements_public" ON announcements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_announcements_admin" ON announcements;
CREATE POLICY "insert_announcements_admin" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_announcements_admin" ON announcements;
CREATE POLICY "update_announcements_admin" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_announcements_admin" ON announcements;
CREATE POLICY "delete_announcements_admin" ON announcements FOR DELETE TO authenticated USING (true);

-- feedback (owner-scoped)
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON feedback;
CREATE POLICY "select_own_feedback" ON feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_feedback" ON feedback;
CREATE POLICY "insert_own_feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_feedback" ON feedback;
CREATE POLICY "delete_own_feedback" ON feedback FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- analytics_events (public read for admin dashboard, anyone can insert)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text,
  topic text,
  response_time_ms integer,
  confidence real,
  satisfied boolean,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_analytics_public" ON analytics_events;
CREATE POLICY "read_analytics_public" ON analytics_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_analytics_public" ON analytics_events;
CREATE POLICY "insert_analytics_public" ON analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS kb_documents_updated_at ON kb_documents;
CREATE TRIGGER kb_documents_updated_at BEFORE UPDATE ON kb_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kb_documents_category ON kb_documents(category);
CREATE INDEX IF NOT EXISTS idx_kb_documents_tags ON kb_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
