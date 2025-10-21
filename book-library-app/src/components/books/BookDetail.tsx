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

  const hasRating = typeof book.averageRating === 'number' && book.averageRating > 0
  const ratingValue = hasRating ? Math.floor(book.averageRating ?? 0) : 0


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            {formatAuthors(book.authors || [])}
          </p>

          {popularityBadge && (
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full mb-4">
              {popularityBadge}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-6">
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

          {book.pageCount ? (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pages</span>
              <p className="font-medium text-gray-900 dark:text-white">{book.pageCount}</p>
            </div>
          ) : null}

          {book.language && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Language</span>
              <p className="font-medium text-gray-900 dark:text-white uppercase">
                {book.language}
              </p>
            </div>
          )}

          {hasRating && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Rating</span>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < ratingValue ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {book.averageRating}
                </span>
              </div>
            </div>
          )}
        </div>

        {book.categories?.length ? (
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
        ) : null}

        {book.description ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {book.description}
            </p>
          </div>
        ) : null}

        <BookStats stats={book.stats} />

        <div className="flex gap-4 pt-4">
          <WishlistButton book={book} />
          <LoanButton book={book} />
        </div>

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
