// src/renderer/src/stores/settingsStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/lib/i18n/i18n'

type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  language: string
  notifications: boolean
  soundEnabled: boolean

  setTheme: (theme: Theme) => void
  setLanguage: (lang: string) => void
  toggleNotifications: () => void
  toggleSound: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      notifications: false,
      soundEnabled: false,

      setTheme: (theme) => {
        set({ theme })
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', isDark)
      },

      setLanguage: (lang) => {
        set({ language: lang })
        i18n.changeLanguage(lang)
      },

      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'yaca-settings',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (!state) return

        const isDark =
          state.theme === 'dark' ||
          (state.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', isDark)

        i18n.changeLanguage(state.language)
      },
    }
  )
)
