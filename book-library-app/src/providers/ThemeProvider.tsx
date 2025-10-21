'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore()
  const { user } = useAuthStore()
  const bootstrapped = useRef(false)
  const appliedUserPrefOnce = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    const local =
      (typeof window !== 'undefined'
        ? (localStorage.getItem('theme') as 'light' | 'dark' | null)
        : null) ?? null

    const preferred =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

    setTheme((local ?? preferred) as 'light' | 'dark')
  }, [setTheme])

  useEffect(() => {
    const userPref = user?.preferences?.theme as 'light' | 'dark' | undefined
    if (!userPref) return

    if (!appliedUserPrefOnce.current || userPref !== theme) {
      appliedUserPrefOnce.current = true
      setTheme(userPref)
    }
  }, [user?.preferences?.theme, setTheme])

  return <>{children}</>
}
