'use client'

import { useEffect, useMemo, useState } from 'react'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import type { Book } from '@/types'

interface WishlistButtonProps {
  book: Book
}

export const WishlistButton = ({ book }: WishlistButtonProps) => {
  const { user } = useAuth()
  const { addBook, checkIfInWishlist, actionLoading } = useWishlist()

  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  const ready = useMemo(() => Boolean(user?.uid && book?.id), [user?.uid, book?.id])

  useEffect(() => {
    const run = async () => {
      if (!ready) {
        setIsInWishlist(false)
        return
      }
      const inWishlist = await checkIfInWishlist(book.id)
      setIsInWishlist(inWishlist)
    }
    run()
  }, [ready, book.id, checkIfInWishlist])

  const handleClick = async () => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    if (!book?.id) return

    setLoading(true)
    const success = await addBook(book)
    if (success) setIsInWishlist(true)
    setLoading(false)
  }

  const disabled = !ready || isInWishlist || loading || actionLoading

  return (
    <Button
      onClick={handleClick}
      loading={loading || actionLoading}
      disabled={disabled}
      variant={isInWishlist ? 'secondary' : 'primary'}
    >
      {isInWishlist ? (
        <>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          In Wishlist
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Add to Wishlist
        </>
      )}
    </Button>
  )
}
