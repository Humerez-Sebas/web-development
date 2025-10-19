'use client'

import { useBooks } from '@/hooks/useBooks'
import { Button } from '@/components/ui/Button'

export const Pagination = () => {
  const { currentPage, totalResults, searchQuery, performSearch } = useBooks()

  if (!searchQuery || totalResults === 0) return null

  const totalPages = Math.ceil(totalResults / 15)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const handlePageChange = (newPage: number) => {
    performSearch(searchQuery, newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex justify-center items-center space-x-4 py-8">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        Previous
      </Button>
      
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
      </Button>
    </div>
  )
}