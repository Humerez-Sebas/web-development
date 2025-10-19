import { useState, useCallback, useEffect } from 'react'
import { addToWishlist, removeFromWishlist, getUserWishlist, isBookInWishlist } from '@/lib/firebase/firestore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import type { Book } from '@/types'

export const useWishlist = () => {
  const { items, loading, error, setItems, setLoading, setError, clearWishlist } = useWishlistStore()
  const { user } = useAuthStore()
  const [actionLoading, setActionLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (user && !isInitialized) {
      loadWishlist()
      setIsInitialized(true)
    } else if (!user) {
      clearWishlist()
      setIsInitialized(false)
    }
  }, [user])

  const loadWishlist = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const wishlistItems = await getUserWishlist(user.uid)
      setItems(wishlistItems)
    } catch (err) {
      console.error('Error loading wishlist:', err)
      setError(err instanceof Error ? err.message : 'Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }, [user, setItems, setLoading, setError])

  const addBook = useCallback(async (book: Book) => {
    if (!user) throw new Error('Must be logged in')

    setActionLoading(true)
    setError(null)

    try {
      await addToWishlist(user.uid, book, user)
      await loadWishlist()
      return true
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to wishlist')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [user, loadWishlist, setError])

  const removeBook = useCallback(async (wishlistItemId: string, bookId: string) => {
    if (!user) throw new Error('Must be logged in')

    setActionLoading(true)
    setError(null)

    try {
      await removeFromWishlist(user.uid, wishlistItemId, bookId)
      await loadWishlist()
      return true
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [user, loadWishlist, setError])

  const checkIfInWishlist = useCallback(async (bookId: string): Promise<boolean> => {
    if (!user) return false

    try {
      return await isBookInWishlist(user.uid, bookId)
    } catch (err) {
      console.error('Error checking wishlist status:', err)
      return false
    }
  }, [user])

  return {
    items,
    loading,
    error,
    actionLoading,
    loadWishlist,
    addBook,
    removeBook,
    checkIfInWishlist,
  }
}