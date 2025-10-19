'use client'

import Image from 'next/image'
import Link from 'next/link'
import { WishlistItem as WishlistItemType } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatAuthors, formatDate } from '@/lib/utils/formatters'
import { useWishlist } from '@/hooks/useWishlist'

interface WishlistItemProps {
  item: WishlistItemType
}

export const WishlistItem = ({ item }: WishlistItemProps) => {
  const { removeBook, actionLoading } = useWishlist()

  const handleRemove = async () => {
    await removeBook(item.id, item.bookId)
  }

  return (
    <Card className="flex flex-col sm:flex-row gap-4 p-4">
      <Link href={`/books/${item.bookId}`} className="flex-shrink-0">
        <div className="relative w-24 h-36">
          <Image
            src={item.snapshot.coverUrl || '/book-placeholder.png'}
            alt={item.snapshot.title}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </div>
      </Link>
      
      <div className="flex-grow">
        <Link href={`/books/${item.bookId}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
            {item.snapshot.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {formatAuthors(item.snapshot.authors)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
          Added {formatDate(item.createdAt)}
        </p>
        {item.snapshot.shortDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.snapshot.shortDescription}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <Button
          variant="danger"
          size="sm"
          onClick={handleRemove}
          loading={actionLoading}
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}