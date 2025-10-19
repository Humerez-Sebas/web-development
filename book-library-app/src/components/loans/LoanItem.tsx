'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Loan } from '@/types'
import { Card } from '@/components/ui/Card'
import { ReturnButton } from './ReturnButton'
import { formatAuthors, formatDate, formatDaysRemaining } from '@/lib/utils/formatters'

interface LoanItemProps {
  loan: Loan
}

export const LoanItem = ({ loan }: LoanItemProps) => {
  const isActive = loan.status === 'active'
  const isOverdue = isActive && new Date() > loan.dueDate.toDate()

  return (
    <Card className={`flex flex-col sm:flex-row gap-4 p-4 ${isOverdue ? 'border-red-500' : ''}`}>
      <Link href={`/books/${loan.bookId}`} className="flex-shrink-0">
        <div className="relative w-24 h-36">
          <Image
            src={loan.snapshot.coverUrl || '/book-placeholder.png'}
            alt={loan.snapshot.title}
            fill
            className="object-cover rounded"
            sizes="96px"
          />
        </div>
      </Link>
      
      <div className="flex-grow">
        <Link href={`/books/${loan.bookId}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
            {loan.snapshot.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {formatAuthors(loan.snapshot.authors)}
        </p>
        
        <div className="space-y-1 text-sm">
          <p className="text-gray-500 dark:text-gray-500">
            Borrowed: {formatDate(loan.createdAt)}
          </p>
          {isActive ? (
            <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {formatDaysRemaining(loan.dueDate)}
            </p>
          ) : (
            <p className="text-green-600 dark:text-green-400">
              Returned: {loan.returnedAt && formatDate(loan.returnedAt)}
            </p>
          )}
        </div>
        
        {loan.snapshot.shortDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
            {loan.snapshot.shortDescription}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {isActive && (
          <ReturnButton loanId={loan.id} bookId={loan.bookId} />
        )}
        {loan.status === 'returned' && (
          <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
            Returned
          </span>
        )}
      </div>
    </Card>
  )
}