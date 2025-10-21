import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { updateUserPreferences } from '@/lib/firebase/firestore'

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const updateTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    if (user) {
      updateUserPreferences(user.uid, { theme: newTheme }).catch(() => {})
    }
  }

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    updateTheme(newTheme)
  }

  return {
    theme,
    setTheme: updateTheme,
    toggleTheme: toggle,
  }
}
