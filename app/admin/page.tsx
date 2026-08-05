'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  Area, AreaChart,
} from 'recharts';
import {
  MessageSquare, TrendingUp, Clock, ThumbsUp, Activity,
  FileText, Megaphone, Plus, Trash2, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import type { AnalyticsEvent, KbDocument, Announcement } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

const pieColors = ['hsl(240 6% 30%)', 'hsl(200 70% 50%)', 'hsl(160 60% 40%)', 'hsl(30 80% 55%)', 'hsl(280 50% 55%)', 'hsl(0 72% 51%)'];

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [kbDocs, setKbDocs] = useState<KbDocument[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newDoc, setNewDoc] = useState({ category: '', title: '', content: '', tags: '', source: '' });
  const [newAnn, setNewAnn] = useState({ title: '', body: '', category: 'general', priority: 'normal' });

  useEffect(() => {
    Promise.all([
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('kb_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ]).then(([an, kb, ann]) => {
      if (an.data) setAnalytics(an.data as AnalyticsEvent[]);
      if (kb.data) setKbDocs(kb.data as KbDocument[]);
      if (ann.data) setAnnouncements(ann.data as Announcement[]);
    });
  }, []);

  if (loading) return <div className="p-8"><div className="h-24 animate-shimmer rounded-xl" /></div>;

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Admin access required</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with an admin account to access this panel</p>
        </div>
      </div>
    );
  }

  const totalQueries = analytics.length;
  const avgConfidence = totalQueries > 0 ? Math.round((analytics.reduce((s, a) => s + (a.confidence ?? 0), 0) / totalQueries) * 100) : 0;
  const avgResponseTime = totalQueries > 0 ? Math.round(analytics.reduce((s, a) => s + (a.response_time_ms ?? 0), 0) / totalQueries) : 0;
  const satisfactionRate = totalQueries > 0 ? Math.round((analytics.filter((a) => a.satisfied === true).length / totalQueries) * 100) : 0;

  const statCards = [
    { icon: MessageSquare, label: 'Total Queries', value: totalQueries.toLocaleString() },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%` },
    { icon: Clock, label: 'Avg Response', value: `${avgResponseTime}ms` },
    { icon: ThumbsUp, label: 'Satisfaction', value: `${satisfactionRate}%` },
  ];

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayQueries = analytics.filter((a) => format(new Date(a.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return {
      date: format(date, 'MMM d'),
      queries: dayQueries.length,
      confidence: dayQueries.length > 0 ? Math.round(dayQueries.reduce((s, a) => s + (a.confidence ?? 0), 0) / dayQueries.length * 100) : 0,
    };
  });

  const topicData = analytics.reduce((acc, a) => {
    if (a.topic) acc[a.topic] = (acc[a.topic] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTopics = Object.entries(topicData).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));

  const addDocument = async () => {
    if (!newDoc.title || !newDoc.content || !newDoc.category) { toast.error('Fill in category, title, and content'); return; }
    const { data, error } = await supabase.from('kb_documents').insert({
      category: newDoc.category, title: newDoc.title, content: newDoc.content,
      tags: newDoc.tags.split(',').map((t) => t.trim()).filter(Boolean), source: newDoc.source || null,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setKbDocs([data as KbDocument, ...kbDocs]);
    setNewDoc({ category: '', title: '', content: '', tags: '', source: '' });
    toast.success('Document added to knowledge base');
  };

  const deleteDocument = async (id: string) => {
    await supabase.from('kb_documents').delete().eq('id', id);
    setKbDocs(kbDocs.filter((d) => d.id !== id));
    toast.success('Document deleted');
  };

  const addAnnouncement = async () => {
    if (!newAnn.title || !newAnn.body) { toast.error('Fill in title and body'); return; }
    const { data, error } = await supabase.from('announcements').insert({
      title: newAnn.title, body: newAnn.body, category: newAnn.category, priority: newAnn.priority,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setAnnouncements([data as Announcement, ...announcements]);
    setNewAnn({ title: '', body: '', category: 'general', priority: 'normal' });
    toast.success('Announcement published');
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    setAnnouncements(announcements.filter((a) => a.id !== id));
    toast.success('Announcement deleted');
  };

  const tooltipStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Admin Panel</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage knowledge base, announcements, and view analytics</p>
      </motion.div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Knowledge</TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" /> Announcements</TabsTrigger>
        </TabsList>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold">Query Volume (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(240 6% 30%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(240 6% 30%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="queries" stroke="hsl(240 6% 30%)" fill="url(#colorQueries)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold">Top Topics</h3>
              {topTopics.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={topTopics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={(e) => e.name} labelLine={false} fontSize={11}>
                      {topTopics.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-20 text-center text-sm text-muted-foreground">No topic data yet</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Confidence Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="confidence" stroke="hsl(142 71% 45%)" strokeWidth={1.5} dot={{ r: 3, fill: 'hsl(142 71% 45%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Knowledge Base Management */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Plus className="h-4 w-4" /> Add Knowledge Base Document
            </h3>
            <div className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input placeholder="Category (e.g. Admissions)" value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })} />
                <Input placeholder="Source (e.g. Brochure 2025)" value={newDoc.source} onChange={(e) => setNewDoc({ ...newDoc, source: e.target.value })} />
              </div>
              <Input placeholder="Title" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
              <Textarea placeholder="Content…" rows={4} value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} />
              <Input placeholder="Tags (comma-separated)" value={newDoc.tags} onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })} />
              <Button onClick={addDocument} size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Document
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{kbDocs.length} documents</p>
            {kbDocs.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="mb-1 text-xs">{doc.category}</Badge>
                  <h3 className="text-sm font-medium">{doc.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{doc.content}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.id)} className="h-8 w-8 shrink-0">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Announcements Management */}
        <TabsContent value="announcements" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Plus className="h-4 w-4" /> Publish Announcement
            </h3>
            <div className="space-y-2.5">
              <Input placeholder="Title" value={newAnn.title} onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })} />
              <Textarea placeholder="Body…" rows={3} value={newAnn.body} onChange={(e) => setNewAnn({ ...newAnn, body: e.target.value })} />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Input placeholder="Category" value={newAnn.category} onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value })} />
                <Select value={newAnn.priority} onValueChange={(v) => setNewAnn({ ...newAnn, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addAnnouncement} size="sm" className="gap-1.5">
                <Megaphone className="h-3.5 w-3.5" /> Publish
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${ann.priority === 'emergency' ? 'border-destructive text-destructive' : ann.priority === 'high' ? 'border-warning text-warning' : ''}`}>{ann.priority}</Badge>
                    <Badge variant="secondary" className="text-xs">{ann.category}</Badge>
                  </div>
                  <h3 className="mt-1 text-sm font-medium">{ann.title}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{ann.body}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)} className="h-8 w-8 shrink-0">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
