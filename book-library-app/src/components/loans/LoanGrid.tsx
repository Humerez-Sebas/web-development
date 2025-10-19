'use client'

import { useLoans } from '@/hooks/useLoans'
import { LoanItem } from './LoanItem'
import { Spinner } from '@/components/ui/Spinner'

export const LoanGrid = () => {
  const { loans, loading, error } = useLoans()

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

  if (loans.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 mb-4">No books borrowed yet</p>
        <p className="text-sm text-gray-500">Start borrowing books to build your reading list!</p>
      </div>
    )
  }

  const activeLoans = loans.filter(loan => loan.status === 'active')
  const returnedLoans = loans.filter(loan => loan.status === 'returned')

  return (
    <div className="space-y-6">
      {activeLoans.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Loans ({activeLoans.length}/3)
          </h2>
          <div className="space-y-4">
            {activeLoans.map((loan) => (
              <LoanItem key={loan.id} loan={loan} />
            ))}
          </div>
        </div>
      )}
      
      {returnedLoans.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Returned Books
          </h2>
          <div className="space-y-4">
            {returnedLoans.map((loan) => (
              <LoanItem key={loan.id} loan={loan} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}