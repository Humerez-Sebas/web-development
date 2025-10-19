'use client'

import Image from 'next/image'
import { Book } from '@/types'
import { formatAuthors } from '@/lib/utils/formatters'
import { getStockStatus, getStockStatusColor, getPopularityBadge } from '@/lib/utils/popularity'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { LoanButton } from '@/components/loans/LoanButton'
import { BookStats } from './BookStats'

interface BookDetailProps {
  book: Book
}

export const BookDetail = ({ book }: BookDetailProps) => {
  const stockStatus = getStockStatus(book.stock.available, book.stock.total)
  const stockStatusColor = getStockStatusColor(book.stock.available, book.stock.total)
  const popularityBadge = getPopularityBadge(book.popularityScore)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cover image */}
      <div className="lg:col-span-1">
        <div className="relative h-96 w-full lg:sticky lg:top-4">
          <Image
            src={book.coverUrl || '/book-placeholder.png'}
            alt={book.title}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 1024px) 100vw, 33vw"
            priority
          />
        </div>
      </div>

      {/* Book info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title and authors */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            {formatAuthors(book.authors)}
          </p>

          {popularityBadge && (
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full mb-4">
              {popularityBadge}
            </span>
          )}
        </div>

        {/* Stock and metadata */}
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
            <p className={`font-medium ${stockStatusColor}`}>{stockStatus}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {book.stock.available} / {book.stock.total}
            </p>
          </div>
          {book.publishedDate && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Published</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {book.publishedDate}
              </p>
            </div>
          )}
          {book.pageCount && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pages</span>
              <p className="font-medium text-gray-900 dark:text-white">{book.pageCount}</p>
            </div>
          )}
          {book.language && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Language</span>
              <p className="font-medium text-gray-900 dark:text-white uppercase">
                {book.language}
              </p>
            </div>
          )}
        </div>

        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {book.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {book.description && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {book.description}
            </p>
          </div>
        )}

        {/* Stats */}
        <BookStats stats={book.stats} />

        {/* Action buttons */}
        <div className="flex gap-4 pt-4">
          <WishlistButton book={book} />
          <LoanButton book={book} />
        </div>

        {/* Google Books link */}
        {book.previewLink && (
          <div className="pt-4">
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Preview on Google Books →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
