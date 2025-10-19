'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { WishlistGrid } from '@/components/wishlist/WishlistGrid'
import { Header } from '@/components/layout/Header'

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Wishlist
        </h1>
        <WishlistGrid />
      </div>
    </ProtectedRoute>
  )
}