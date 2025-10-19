import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    immer((set) => ({
      user: null,
      loading: true,
      error: null,
      setUser: (user) =>
        set((state) => {
          state.user = user
          state.loading = false
          state.error = null
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),
      setError: (error) =>
        set((state) => {
          state.error = error
          state.loading = false
        }),
      clearAuth: () =>
        set((state) => {
          state.user = null
          state.loading = false
          state.error = null
        }),
    })),
    { name: 'AuthStore' }
  )
)