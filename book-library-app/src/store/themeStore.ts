import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface ThemeStore {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  devtools(
    immer((set) => ({
      theme: 'light',
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', theme === 'dark')
          }
        }),
      toggleTheme: () =>
        set((state) => {
          state.theme = state.theme === 'light' ? 'dark' : 'light'
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', state.theme === 'dark')
          }
        }),
    })),
    { name: 'ThemeStore' }
  )
)