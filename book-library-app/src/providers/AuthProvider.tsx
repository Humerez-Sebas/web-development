'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/init'
import { getCurrentUser } from '@/lib/firebase/auth'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, setError } = useAuthStore()
  const { setTheme } = useThemeStore()

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await getCurrentUser(firebaseUser)
          if (userData) {
            setUser(userData)
            if (userData.preferences?.theme) {
              setTheme(userData.preferences.theme)
            }
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth error:', err)
        setError(err instanceof Error ? err.message : 'Authentication error')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, setLoading, setError, setTheme])

  return <>{children}</>
}