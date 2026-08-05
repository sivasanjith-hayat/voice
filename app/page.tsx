'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Mic,
  BookOpen,
  MapPin,
  CalendarDays,
  GraduationCap,
  Building2,
  Stethoscope,
  Phone,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceOrb } from '@/components/voice-orb';
import { useI18n } from '@/hooks/use-i18n';
import { supabase } from '@/lib/supabase';
import type { CampusEvent, Announcement, KbDocument } from '@/lib/types';
import { format } from 'date-fns';

const quickActions = [
  { icon: GraduationCap, label: 'Admissions', href: '/knowledge?cat=Admissions' },
  { icon: Building2, label: 'Departments', href: '/knowledge?cat=Departments' },
  { icon: BookOpen, label: 'Placements', href: '/knowledge?cat=Placements' },
  { icon: BookOpen, label: 'Library', href: '/knowledge?cat=Library' },
  { icon: CalendarDays, label: 'Exams', href: '/knowledge?cat=Examinations' },
  { icon: MapPin, label: 'Campus Map', href: '/map' },
];

const emergencyContacts = [
  { label: 'Medical Emergency', number: '100', icon: Stethoscope },
  { label: 'Security', number: '200', icon: Phone },
  { label: 'Anti-Ragging Helpline', number: '1800-XXX-XXXX', icon: AlertTriangle },
];

export default function HomePage() {
  const { t } = useI18n();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [eventsRes, annRes, kbRes] = await Promise.all([
        supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date').limit(4),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('kb_documents').select('title').limit(6),
      ]);
      setEvents(eventsRes.data as CampusEvent[] ?? []);
      setAnnouncements(annRes.data as Announcement[] ?? []);
      setPopularQuestions((kbRes.data as KbDocument[] ?? []).map((d) => d.title));
      setLoading(false);
    }
    load();
  }, []);

  const priorityDot: Record<string, string> = {
    emergency: 'bg-destructive',
    high: 'bg-warning',
    normal: 'bg-foreground/40',
    low: 'bg-muted-foreground',
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 shadow-sm sm:px-12 sm:py-16">
        <div className="relative max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              AI-Powered Smart Campus Platform
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">
              Your Campus.
              <br />
              <span className="text-muted-foreground">One Conversation Away.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground text-balance">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/knowledge">
                <Button size="lg" variant="outline" className="gap-2">
                  {t('common.search')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block"
        >
          <Link href="/chat">
            <VoiceOrb listening={false} speaking={false} onToggle={() => {}} size="lg" />
          </Link>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('home.quick')}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={action.href}>
                <div className="card-interactive group flex h-full flex-col items-center gap-2 rounded-xl p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Questions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('home.popular')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-shimmer rounded-xl" />
              ))
            : popularQuestions.map((q, i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/chat?q=${encodeURIComponent(q)}`}>
                    <div className="card-interactive group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3">
                      <Mic className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="line-clamp-1 flex-1 text-sm font-medium">{q}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Events */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">{t('home.events')}</h2>
            <Link href="/events" className="flex items-center gap-1 text-sm font-medium hover:underline">
              {t('common.viewall')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 animate-shimmer rounded-xl" />
                ))
              : events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href="/events">
                      <div className="card-interactive group h-full cursor-pointer rounded-xl p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-medium">{event.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.date), 'MMM d')}
                          </span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{event.title}</h3>
                        {event.location && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{event.location}</span>
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </section>

        {/* Announcements */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('home.announcements')}</h2>
          <div className="space-y-2">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-shimmer rounded-xl" />
                ))
              : announcements.slice(0, 4).map((ann, i) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="card-elevated rounded-xl p-3.5">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[ann.priority]}`} />
                        <span className="text-xs font-medium capitalize text-muted-foreground">{ann.priority}</span>
                        <span className="text-xs text-muted-foreground/60">·</span>
                        <span className="text-xs text-muted-foreground">{ann.category}</span>
                      </div>
                      <h3 className="line-clamp-1 text-sm font-medium">{ann.title}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{ann.body}</p>
                    </div>
                  </motion.div>
                ))}
          </div>
        </section>
      </div>

      {/* Emergency Contacts */}
      <section className="mt-8">
        <div className="card-elevated overflow-hidden rounded-xl border-destructive/20">
          <div className="flex items-center gap-2 border-b border-border bg-destructive/5 px-4 py-2.5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold">{t('home.emergency')}</h2>
          </div>
          <div className="grid gap-2 p-3 sm:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.label} className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:border-destructive/30 hover:bg-destructive/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                  <contact.icon className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{contact.label}</p>
                  <p className="font-mono text-base font-semibold text-destructive">{contact.number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
