import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  toasts: Toast[];
  themeMode: ThemeMode;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  cycleTheme: () => void;
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (mode === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      activeModal: null,
      toasts: [],
      themeMode: 'system',

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),

      setThemeMode: (mode) => {
        applyTheme(mode);
        set({ themeMode: mode });
      },

      cycleTheme: () => {
        const next: Record<ThemeMode, ThemeMode> = { system: 'light', light: 'dark', dark: 'system' };
        const mode = next[get().themeMode];
        applyTheme(mode);
        set({ themeMode: mode });
      },

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, toast.duration || 5000);
      },

      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'nextx-ui',
      partialize: (s) => ({ themeMode: s.themeMode }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.themeMode);
      },
    },
  ),
);
