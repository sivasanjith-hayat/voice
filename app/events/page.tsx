'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ExternalLink, CalendarPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { CampusEvent } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EventsPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    supabase.from('events').select('*').gte('date', new Date().toISOString()).order('date').then(({ data }) => {
      if (data) setEvents(data as CampusEvent[]);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map((e) => e.category)))], [events]);
  const filtered = filter === 'All' ? events : events.filter((e) => e.category === filter);

  const addToCalendar = (event: CampusEvent) => {
    const start = new Date(event.date);
    const end = event.end_date ? new Date(event.end_date) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nLOCATION:${event.location ?? ''}\nDESCRIPTION:${event.description ?? ''}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Added to your calendar');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Campus Events</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{events.length} upcoming events</p>
      </motion.div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className="rounded-full text-xs"
          >
            {cat}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-shimmer rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.2) }}
            >
              <div className="card-interactive group h-full overflow-hidden rounded-xl">
                <div className="p-4">
                  <div className="mb-2.5 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                    {event.organizer && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.organizer}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold leading-snug">{event.title}</h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{event.description}</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(event.date), 'EEE, MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(event.date), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3.5 flex gap-1.5">
                    {event.registration_url ? (
                      <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1.5 text-xs">Register <ExternalLink className="h-3 w-3" /></Button>
                      </a>
                    ) : (
                      <Button size="sm" onClick={() => toast.success('Registration confirmed!')} className="gap-1.5 text-xs">Register</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => addToCalendar(event)} className="gap-1.5 text-xs">
                      <CalendarPlus className="h-3 w-3" /> Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
