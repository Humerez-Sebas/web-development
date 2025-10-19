import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  loading: boolean
  error: string | null
  setItems: (items: WishlistItem[]) => void
  addItem: (item: WishlistItem) => void
  removeItem: (itemId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  devtools(
    immer((set) => ({
      items: [],
      loading: false,
      error: null,
      setItems: (items) =>
        set((state) => {
          state.items = items
          state.loading = false
          state.error = null
        }),
      addItem: (item) =>
        set((state) => {
          state.items.unshift(item)
        }),
      removeItem: (itemId) =>
        set((state) => {
          state.items = state.items.filter((item) => item.id !== itemId)
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
      clearWishlist: () =>
        set((state) => {
          state.items = []
          state.loading = false
          state.error = null
        }),
    })),
    { name: 'WishlistStore' }
  )
)