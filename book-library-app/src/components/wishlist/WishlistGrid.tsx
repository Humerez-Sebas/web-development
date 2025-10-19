'use client'

import { useWishlist } from '@/hooks/useWishlist'
import { WishlistItem } from './WishlistItem'
import { Spinner } from '@/components/ui/Spinner'

export const WishlistGrid = () => {
  const { items, loading, error } = useWishlist()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty</p>
        <p className="text-sm text-gray-500">Start adding books you'd like to read!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WishlistItem key={item.id} item={item} />
      ))}
    </div>
  )
}