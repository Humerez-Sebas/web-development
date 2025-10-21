'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GoogleBookVolume } from '@/types'
import { Card } from '@/components/ui/Card'
import { formatAuthors, truncateText } from '@/lib/utils/formatters'

interface BookCardProps {
  book: GoogleBookVolume
}

export const BookCard = ({ book }: BookCardProps) => {
  const { volumeInfo } = book
  const coverUrl = volumeInfo?.imageLinks?.thumbnail || '/book-placeholder.png'
  const title = truncateText(volumeInfo?.title ?? 'Untitled', 50)
  const authors = formatAuthors(volumeInfo?.authors || [])
  const description = volumeInfo?.description
    ? truncateText(volumeInfo.description, 100)
    : 'No description available'

  const hasRating =
    typeof volumeInfo?.averageRating === 'number' && volumeInfo.averageRating > 0
  const ratingValue = hasRating ? Math.floor(volumeInfo!.averageRating!) : 0

  return (
    <Link href={`/books/${book.id}`}>
      <Card hoverable className="h-full">
        <div className="relative h-64 w-full">
          <Image
            src={coverUrl}
            alt={volumeInfo?.title ?? 'Book cover'}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {authors}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
            {description}
          </p>

          {hasRating && (
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < ratingValue
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                {volumeInfo!.averageRating}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
