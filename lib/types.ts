export type UserRole = 'student' | 'parent' | 'faculty' | 'alumni' | 'visitor' | 'admin';

export type Language = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn' | 'fr' | 'ar';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  semester: string | null;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface KbDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface MessageSource {
  id: string;
  title: string;
  category: string;
  source: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: MessageSource[] | null;
  confidence: number | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  conversation_id: string | null;
  message_id: string | null;
  label: string | null;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  category: string;
  organizer: string | null;
  registration_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  expires_at: string | null;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  query: string | null;
  topic: string | null;
  response_time_ms: number | null;
  confidence: number | null;
  satisfied: boolean | null;
  language: string;
  created_at: string;
}

export interface RetrievalResult {
  document: KbDocument;
  score: number;
}

export interface AssistantResponse {
  content: string;
  sources: MessageSource[];
  confidence: number;
  results: RetrievalResult[];
}
