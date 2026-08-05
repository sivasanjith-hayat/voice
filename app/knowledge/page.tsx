'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, FileText, Tag, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import type { KbDocument } from '@/lib/types';

export default function KnowledgePage() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<KbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('cat') ?? 'all');

  useEffect(() => {
    supabase.from('kb_documents').select('*').order('category, title').then(({ data }) => {
      if (data) setDocuments(data as KbDocument[]);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const set = new Set(documents.map((d) => d.category));
    return ['all', ...Array.from(set)];
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory = category === 'all' || doc.category === category;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [documents, search, category]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Browse {documents.length} articles across {categories.length - 1} categories</p>
      </motion.div>

      <div className="mb-5 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">No articles found</p>
          <p className="text-xs text-muted-foreground">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.2) }}
            >
              <Link href={`/chat?q=${encodeURIComponent(doc.title)}`}>
                <div className="card-interactive group h-full cursor-pointer rounded-xl p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                  </div>
                  <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{doc.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{doc.content}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  {doc.source && (
                    <p className="mt-2.5 border-t border-border/60 pt-2 text-xs text-muted-foreground/70">Source: {doc.source}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
