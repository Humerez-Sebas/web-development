import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { updateUserPreferences } from '@/lib/firebase/firestore'

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme)
    }
  }, [user, setTheme])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    
    if (user) {
      try {
        await updateUserPreferences(user.uid, { theme: newTheme })
      } catch (error) {
        console.error('Failed to update theme preference:', error)
      }
    }
  }

  const toggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    await updateTheme(newTheme)
  }

  return {
    theme,
    setTheme: updateTheme,
    toggleTheme: toggle,
  }
}