'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './types';

interface AppState {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      sidebarOpen: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'campus-ai-store',
      partialize: (state) => ({ language: state.language, theme: state.theme }),
    }
  )
);
