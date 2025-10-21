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
      theme:
        (typeof window !== 'undefined' &&
          (localStorage.getItem('theme') as 'light' | 'dark')) ||
        'light',

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
          if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme)
            document.documentElement.classList.toggle('dark', theme === 'dark')
          }
        }),

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          state.theme = newTheme
          if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
          }
        }),
    })),
    { name: 'ThemeStore' }
  )
)
