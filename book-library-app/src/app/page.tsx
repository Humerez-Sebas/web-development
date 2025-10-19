'use client'

import { SearchBar } from '@/components/books/SearchBar'
import { BookGrid } from '@/components/books/BookGrid'
import { Pagination } from '@/components/books/Pagination'
import { Header } from '@/components/layout/Header'

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Discover Your Next Great Read
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Search millions of books, build your wishlist, and borrow your favorites
            </p>
          </div>
          
          <SearchBar />
          <BookGrid />
          <Pagination />
        </div>
      </div>
    </>
  )
}