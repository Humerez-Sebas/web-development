import { useState, useCallback, useEffect } from 'react'
import { createLoan, returnLoan, getUserLoans, hasActiveLoanForBook } from '@/lib/firebase/firestore'
import { useLoansStore } from '@/store/loansStore'
import { useAuthStore } from '@/store/authStore'
import type { Book } from '@/types'

export const useLoans = () => {
  const { loans, activeLoans, loading, error, setLoans, setLoading, setError, clearLoans } = useLoansStore()
  const { user } = useAuthStore()
  const [actionLoading, setActionLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (user && !isInitialized) {
      loadLoans()
      setIsInitialized(true)
    } else if (!user) {
      clearLoans()
      setIsInitialized(false)
    }
  }, [user])

  const loadLoans = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const userLoans = await getUserLoans(user.uid)
      setLoans(userLoans)
    } catch (err) {
      console.error('Error loading loans:', err)
      setError(err instanceof Error ? err.message : 'Failed to load loans')
    } finally {
      setLoading(false)
    }
  }, [user, setLoans, setLoading, setError])

  const borrowBook = useCallback(async (book: Book) => {
    if (!user) throw new Error('Must be logged in')

    setActionLoading(true)
    setError(null)

    try {
      await createLoan(user.uid, book, user)
      await loadLoans()
      return true
    } catch (err) {
      console.error('Error borrowing book:', err)
      setError(err instanceof Error ? err.message : 'Failed to borrow book')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [user, loadLoans, setError])

  const returnBook = useCallback(async (loanId: string, bookId: string) => {
    if (!user) throw new Error('Must be logged in')

    setActionLoading(true)
    setError(null)

    try {
      await returnLoan(user.uid, loanId, bookId)
      await loadLoans()
      return true
    } catch (err) {
      console.error('Error returning book:', err)
      setError(err instanceof Error ? err.message : 'Failed to return book')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [user, loadLoans, setError])

  const checkActiveLoan = useCallback(async (bookId: string): Promise<boolean> => {
    if (!user) return false

    try {
      return await hasActiveLoanForBook(user.uid, bookId)
    } catch (err) {
      console.error('Error checking loan status:', err)
      return false
    }
  }, [user])

  return {
    loans,
    activeLoans,
    loading,
    error,
    actionLoading,
    loadLoans,
    borrowBook,
    returnBook,
    checkActiveLoan,
  }
}