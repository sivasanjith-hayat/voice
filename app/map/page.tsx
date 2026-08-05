'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Home, BookOpen, FlaskConical, Trophy, Stethoscope,
  UtensilsCrossed, Bus, GraduationCap, MapPin, Navigation,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Location {
  id: string;
  name: string;
  category: string;
  description: string;
  x: number;
  y: number;
  icon: typeof Building2;
}

const locations: Location[] = [
  { id: 'admin', name: 'Administrative Block', category: 'Administration', description: 'Main office, admission cell, accounts, and principal office.', x: 50, y: 20, icon: Building2 },
  { id: 'cs', name: 'CS & IT Block', category: 'Academic', description: 'Computer Science and IT departments, labs, and faculty offices.', x: 25, y: 45, icon: GraduationCap },
  { id: 'ec', name: 'ECE Block', category: 'Academic', description: 'Electronics & Communication department and VLSI lab.', x: 75, y: 45, icon: FlaskConical },
  { id: 'mech', name: 'Mechanical Block', category: 'Academic', description: 'Mechanical Engineering, workshops, and CAD/CAM lab.', x: 50, y: 65, icon: Building2 },
  { id: 'library', name: 'Central Library', category: 'Facility', description: '95,000+ books, digital resources, study rooms.', x: 35, y: 30, icon: BookOpen },
  { id: 'auditorium', name: 'Auditorium', category: 'Facility', description: '600-seat auditorium for events and seminars.', x: 65, y: 30, icon: Building2 },
  { id: 'sports', name: 'Sports Complex', category: 'Facility', description: 'Cricket, football, basketball, swimming pool, gym.', x: 85, y: 75, icon: Trophy },
  { id: 'medical', name: 'Medical Center', category: 'Facility', description: '24/7 medical care, ambulance, pharmacy.', x: 15, y: 75, icon: Stethoscope },
  { id: 'hostel-b', name: 'Boys Hostel', category: 'Hostel', description: 'Blocks A & B, capacity 1,200, mess included.', x: 10, y: 55, icon: Home },
  { id: 'hostel-g', name: 'Girls Hostel', category: 'Hostel', description: 'Blocks C & D, capacity 800, mess included.', x: 90, y: 55, icon: Home },
  { id: 'cafeteria', name: 'Cafeteria', category: 'Facility', description: 'Main cafeteria serving 3,000 meals/day.', x: 50, y: 50, icon: UtensilsCrossed },
  { id: 'transport', name: 'Transport Hub', category: 'Facility', description: 'Bus stand, 28 routes, parking area.', x: 50, y: 85, icon: Bus },
];

const categoryFilters = ['All', 'Academic', 'Facility', 'Hostel', 'Administration'];

export default function CampusMapPage() {
  const [selected, setSelected] = useState<Location | null>(null);
  const [filter, setFilter] = useState('All');
  const visible = filter === 'All' ? locations : locations.filter((l) => l.category === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Campus Map</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Explore {locations.length} locations across our 45-acre campus</p>
      </motion.div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categoryFilters.map((cat) => (
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/30">
              <svg className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              <svg className="absolute inset-0 h-full w-full">
                <path d="M 10% 50% Q 50% 50% 90% 50%" stroke="hsl(var(--foreground) / 0.06)" strokeWidth="8" fill="none" strokeDasharray="4 4" strokeLinecap="round" />
                <path d="M 50% 10% L 50% 90%" stroke="hsl(var(--foreground) / 0.06)" strokeWidth="6" fill="none" strokeDasharray="4 4" strokeLinecap="round" />
              </svg>
              {visible.map((loc) => (
                <motion.button
                  key={loc.id}
                  onClick={() => setSelected(loc)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-sm transition-colors ${selected?.id === loc.id ? 'bg-foreground text-background' : 'bg-card text-foreground'}`}>
                    <loc.icon className="h-4 w-4" />
                  </div>
                  <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-background px-1.5 py-0.5 text-xs font-medium shadow-sm border border-border">
                    {loc.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
                    <selected.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="mb-2 text-xs">{selected.category}</Badge>
                  <h2 className="font-display text-lg font-semibold">{selected.name}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Navigation className="h-3.5 w-3.5" />
                      Directions
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                      <MapPin className="h-3.5 w-3.5" />
                      Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-2.5 text-sm font-semibold">All Locations</h3>
                  <div className="space-y-1">
                    {visible.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setSelected(loc)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-border/60 p-2 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <loc.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium">{loc.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{loc.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
