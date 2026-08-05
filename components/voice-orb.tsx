'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceOrbProps {
  listening: boolean;
  speaking: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceOrb({ listening, speaking, onToggle, size = 'md' }: VoiceOrbProps) {
  const dimensions = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-28 w-28',
  };

  const iconSize = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {(listening || speaking) && (
          <>
            <motion.div
              className={cn('absolute rounded-full border', dimensions[size], listening ? 'border-destructive/20' : 'border-foreground/10')}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className={cn('absolute rounded-full border', dimensions[size], listening ? 'border-destructive/15' : 'border-foreground/5')}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-all duration-300',
          dimensions[size],
          listening
            ? 'bg-destructive text-destructive-foreground shadow-floating'
            : speaking
              ? 'bg-foreground/80 text-background shadow-md'
              : 'bg-foreground text-background shadow-md'
        )}
        aria-label={listening ? 'Stop listening' : 'Start voice input'}
      >
        {listening ? (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            <Square className={cn('fill-current', iconSize[size])} />
          </motion.div>
        ) : (
          <Mic className={iconSize[size]} />
        )}
      </motion.button>

      {(listening || speaking) && (
        <div className="absolute -bottom-6 flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={cn('w-0.5 rounded-full', listening ? 'bg-destructive' : 'bg-foreground/60')}
              animate={{ height: [3, 14, 3] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
