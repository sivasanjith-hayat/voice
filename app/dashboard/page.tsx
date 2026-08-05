'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, CalendarClock, ClipboardCheck,
  TrendingUp, Award, Bookmark, Bell, Clock, AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { Bookmark as BookmarkType, Conversation } from '@/lib/types';
import Link from 'next/link';
import { format } from 'date-fns';

const mockAttendance = [
  { subject: 'Data Structures', percentage: 87 },
  { subject: 'Operating Systems', percentage: 92 },
  { subject: 'DBMS', percentage: 78 },
  { subject: 'Computer Networks', percentage: 85 },
];

const mockAssignments = [
  { subject: 'OS', title: 'Process Scheduling Lab', due: '2025-08-10', status: 'pending' },
  { subject: 'DBMS', title: 'ER Diagram Submission', due: '2025-08-08', status: 'pending' },
  { subject: 'CN', title: 'TCP Socket Programming', due: '2025-08-15', status: 'pending' },
  { subject: 'DSA', title: 'Graph Algorithms', due: '2025-08-05', status: 'overdue' },
];

const mockExams = [
  { subject: 'Data Structures', date: '2025-12-02', time: '09:30', room: 'Hall A-101' },
  { subject: 'Operating Systems', date: '2025-12-04', time: '09:30', room: 'Hall A-103' },
  { subject: 'DBMS', date: '2025-12-06', time: '09:30', room: 'Hall B-201' },
  { subject: 'Computer Networks', date: '2025-12-08', time: '09:30', room: 'Hall B-203' },
];

const mockGrades = [
  { semester: 'Sem 1', sgpa: 8.2 },
  { semester: 'Sem 2', sgpa: 8.5 },
  { semester: 'Sem 3', sgpa: 8.8 },
  { semester: 'Sem 4', sgpa: 9.1 },
  { semester: 'Sem 5', sgpa: 8.9 },
];

const statCards = [
  { icon: Award, label: 'CGPA', value: '8.90' },
  { icon: ClipboardCheck, label: 'Attendance', value: '85.5%' },
  { icon: BookOpen, label: 'Courses', value: '6' },
  { icon: Bell, label: 'Notifications', value: '3' },
];

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('conversations').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
    ]).then(([bm, conv]) => {
      if (bm.data) setBookmarks(bm.data as BookmarkType[]);
      if (conv.data) setConversations(conv.data as Conversation[]);
    });
  }, [user]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8"><div className="h-24 animate-shimmer rounded-xl" /></div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Sign in to view your dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track attendance, assignments, exams, grades, and saved conversations</p>
          <div className="mt-4 flex gap-2">
            <Link href="/signin"><Button size="sm">Sign In</Button></Link>
            <Link href="/signup"><Button size="sm" variant="outline">Sign Up</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Welcome back, {profile?.full_name ?? 'Student'}</p>
      </motion.div>

      {/* Profile + Stats */}
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-foreground text-lg font-semibold text-background">
                {(profile?.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-sm font-semibold">{profile?.full_name ?? 'Student'}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
              <Badge variant="secondary" className="capitalize text-xs">{profile?.role ?? 'student'}</Badge>
              {profile?.department && <Badge variant="outline" className="text-xs">{profile.department}</Badge>}
              {profile?.semester && <Badge variant="outline" className="text-xs">{profile.semester}</Badge>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div className="mt-3">
                  <p className="font-display text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Attendance</h3>
          </div>
          <div className="space-y-3 p-5">
            {mockAttendance.map((a) => (
              <div key={a.subject}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{a.subject}</span>
                  <span className={a.percentage >= 75 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                    {a.percentage}%
                  </span>
                </div>
                <Progress value={a.percentage} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Grades */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Semester Grades</h3>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
              {mockGrades.map((g, i) => (
                <div key={g.semester} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex w-full items-end justify-center" style={{ height: 100 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(g.sgpa / 10) * 100}px` }}
                      transition={{ delay: i * 0.08, type: 'spring' }}
                      className="w-7 rounded-t-md bg-foreground"
                    />
                  </div>
                  <span className="text-xs font-semibold">{g.sgpa}</span>
                  <span className="text-xs text-muted-foreground">{g.semester}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Assignments</h3>
          </div>
          <div className="space-y-1.5 p-5">
            {mockAssignments.map((a) => (
              <div key={a.title} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 transition-colors hover:bg-muted/30">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.status === 'overdue' ? 'bg-destructive/10' : 'bg-muted'}`}>
                  {a.status === 'overdue' ? <AlertCircle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.subject} · Due {format(new Date(a.due), 'MMM d')}</p>
                </div>
                {a.status === 'overdue' && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Exams */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Upcoming Exams</h3>
          </div>
          <div className="space-y-1.5 p-5">
            {mockExams.map((e) => (
              <div key={e.subject} className="flex items-center gap-3 rounded-lg border border-border/60 p-2.5 transition-colors hover:bg-muted/30">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted">
                  <span className="text-xs font-bold">{format(new Date(e.date), 'MMM').toUpperCase()}</span>
                  <span className="text-sm font-bold">{format(new Date(e.date), 'd')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.subject}</p>
                  <p className="text-xs text-muted-foreground">{e.time} · {e.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks & Recent Conversations */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Saved Bookmarks</h3>
          </div>
          <div className="p-5">
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookmarks yet. Save messages from the AI assistant.</p>
            ) : (
              <div className="space-y-1.5">
                {bookmarks.map((bm) => (
                  <div key={bm.id} className="rounded-lg border border-border/60 p-2.5">
                    <p className="line-clamp-2 text-sm">{bm.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Recent Conversations</h3>
          </div>
          <div className="p-5">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet. <Link href="/chat" className="font-medium text-foreground underline">Start one</Link>.</p>
            ) : (
              <div className="space-y-1.5">
                {conversations.map((conv) => (
                  <Link key={conv.id} href="/chat">
                    <div className="rounded-lg border border-border/60 p-2.5 transition-colors hover:bg-muted/30">
                      <p className="line-clamp-1 text-sm font-medium">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(conv.updated_at), 'MMM d, h:mm a')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
