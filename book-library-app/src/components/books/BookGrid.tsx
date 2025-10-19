'use client'

import { useBooks } from '@/hooks/useBooks'
import { BookCard } from './BookCard'
import { Spinner } from '@/components/ui/Spinner'

export const BookGrid = () => {
  const { searchResults, loading, error, searchQuery } = useBooks()

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

  if (searchResults.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No books found for "{searchQuery}"
        </p>
      </div>
    )
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Start searching to discover amazing books!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {searchResults.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}