'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Trash2,
  Plus,
  History,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VoiceOrb } from '@/components/voice-orb';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { generateResponse, getSuggestions } from '@/lib/ai-engine';
import type { KbDocument, Conversation, MessageSource } from '@/lib/types';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: MessageSource[];
  confidence?: number;
  created_at: string;
}

export default function ChatPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<KbDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }, []);

  useEffect(() => {
    supabase.from('kb_documents').select('*').then(({ data }) => {
      if (data) {
        setDocuments(data as KbDocument[]);
        setSuggestions(getSuggestions(data as KbDocument[], 4));
      }
    });
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);
    if (data) setConversations(data as Conversation[]);
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data as ChatMessage[]);
      setActiveConversation(convId);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && documents.length > 0) handleSend(q);
  }, [searchParams, documents]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setListening(false);
        setTimeout(() => handleSend(transcript), 300);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const createConversation = async (): Promise<string> => {
    if (!user) return 'guest';
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'New conversation', language: 'en' })
      .select()
      .single();
    if (data) {
      setActiveConversation(data.id);
      await loadConversations();
      return data.id;
    }
    return 'guest';
  };

  const handleSend = async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text || thinking) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    const startTime = Date.now();
    const convId = activeConversation ?? (await createConversation());

    if (user && convId !== 'guest') {
      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content: text,
      });
      if (messages.length === 0) {
        await supabase.from('conversations').update({ title: text.slice(0, 50) }).eq('id', convId);
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    const response = generateResponse(text, documents);
    const responseTime = Date.now() - startTime;

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.content,
      sources: response.sources,
      confidence: response.confidence,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setThinking(false);

    if (user && convId !== 'guest') {
      await supabase.from('messages').insert({
        conversation_id: convId,
        role: 'assistant',
        content: response.content,
        sources: response.sources,
        confidence: response.confidence,
      });
    }

    await supabase.from('analytics_events').insert({
      query: text,
      topic: response.results[0]?.document.category ?? null,
      response_time_ms: responseTime,
      confidence: response.confidence,
      language: 'en',
    });

    if (voiceEnabled) speak(response.content);
  };

  const toggleBookmark = async (msg: ChatMessage) => {
    if (!user) { toast.error('Sign in to bookmark messages'); return; }
    const isBookmarked = bookmarked.has(msg.id);
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('message_id', msg.id).eq('user_id', user.id);
      setBookmarked((prev) => { const next = new Set(prev); next.delete(msg.id); return next; });
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        message_id: msg.id,
        conversation_id: activeConversation,
        label: msg.content.slice(0, 80),
      });
      setBookmarked((prev) => new Set(prev).add(msg.id));
      toast.success('Bookmarked');
    }
  };

  const copyMessage = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const newConversation = () => {
    setMessages([]);
    setActiveConversation(null);
    setShowHistory(false);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);
    await loadConversations();
    if (activeConversation === id) newConversation();
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-3xl gap-4 px-4 py-4 sm:px-6">
      <AnimatePresence>
        {showHistory && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden shrink-0 overflow-hidden md:block"
          >
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3">
              <h3 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                {t('chat.history')}
              </h3>
              <ScrollArea className="flex-1">
                <div className="space-y-0.5">
                  {conversations.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-muted-foreground">No conversations yet.</p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-colors cursor-pointer ${
                          activeConversation === conv.id
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                        onClick={() => loadMessages(conv.id)}
                      >
                        <span className="line-clamp-1 flex-1">{conv.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 hover:text-destructive" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {user && (
              <Button variant="ghost" size="sm" onClick={() => setShowHistory((v) => !v)} className="gap-1.5 text-sm">
                <History className="h-3.5 w-3.5" />
                History
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={newConversation} className="gap-1.5 text-sm">
              <Plus className="h-3.5 w-3.5" />
              {t('chat.new')}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
            className="h-8 w-8 rounded-lg"
            aria-label="Toggle voice output"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ScrollArea ref={scrollRef as any} className="flex-1">
            <div className="space-y-4 p-4 sm:p-6">
              {messages.length === 0 && !thinking ? (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-6 text-center">
                  <VoiceOrb listening={listening} speaking={speaking} onToggle={startListening} size="lg" />
                  <div>
                    <h2 className="font-display text-xl font-semibold">{t('hero.tagline')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t('chat.empty')}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            <div className="flex items-center gap-2">
                              {msg.confidence !== undefined && (
                                <span className="pill text-xs">
                                  {t('chat.confidence')}: {Math.round(msg.confidence * 100)}%
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">{t('chat.sources')}:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {msg.sources.map((src) => (
                                <span key={src.id} className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  {src.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.role === 'assistant' && (
                          <div className="mt-1.5 flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => toggleBookmark(msg)} className="h-7 gap-1 px-2 text-xs">
                              {bookmarked.has(msg.id) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                              {t('chat.bookmark')}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyMessage(msg)} className="h-7 gap-1 px-2 text-xs">
                              {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                              {t('chat.copy')}
                            </Button>
                            {voiceEnabled && (
                              <Button variant="ghost" size="sm" onClick={() => speak(msg.content)} className="h-7 gap-1 px-2 text-xs">
                                <Volume2 className="h-3.5 w-3.5" />
                                Speak
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                          {(user?.email ?? 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {thinking && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-3.5 py-2.5">
                        <span className="text-sm text-muted-foreground">{t('chat.thinking')}</span>
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Button
                variant={listening ? 'destructive' : 'outline'}
                size="icon"
                onClick={startListening}
                className="h-9 w-9 shrink-0 rounded-lg"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/20 max-h-32"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || thinking}
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {listening && (
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-destructive">
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-1 w-1 rounded-full bg-destructive" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} />
                  ))}
                </span>
                Listening… speak now
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
