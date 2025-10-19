'use client'

import { useState, useEffect } from 'react'
import { useLoans } from '@/hooks/useLoans'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import type { Book } from '@/types'

interface LoanButtonProps {
  book: Book
}

export const LoanButton = ({ book }: LoanButtonProps) => {
  const { user } = useAuth()
  const { borrowBook, checkActiveLoan, actionLoading, activeLoans } = useLoans()
  const [hasActiveLoan, setHasActiveLoan] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        const hasLoan = await checkActiveLoan(book.id)
        setHasActiveLoan(hasLoan)
      }
    }
    checkStatus()
  }, [user, book.id, checkActiveLoan])

  const handleClick = async () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    if (activeLoans.length >= 3) {
      alert('You have reached the maximum loan limit of 3 books')
      return
    }

    setLoading(true)
    const success = await borrowBook(book)
    if (success) {
      setHasActiveLoan(true)
    }
    setLoading(false)
  }

  const isDisabled = hasActiveLoan || book.stock.available === 0

  return (
    <Button
      onClick={handleClick}
      loading={loading || actionLoading}
      disabled={isDisabled}
      variant={isDisabled ? 'secondary' : 'primary'}
    >
      {hasActiveLoan ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Already Borrowed
        </>
      ) : book.stock.available === 0 ? (
        <>Out of Stock</>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Borrow Book
        </>
      )}
    </Button>
  )
}