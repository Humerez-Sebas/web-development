'use client'

import { useState } from 'react'
import { useLoans } from '@/hooks/useLoans'
import { Button } from '@/components/ui/Button'

interface ReturnButtonProps {
  loanId: string
  bookId: string
}

export const ReturnButton = ({ loanId, bookId }: ReturnButtonProps) => {
  const { returnBook } = useLoans()
  const [loading, setLoading] = useState(false)

  const handleReturn = async () => {
    setLoading(true)
    await returnBook(loanId, bookId)
    setLoading(false)
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleReturn}
      loading={loading}
    >
      Return Book
    </Button>
  )
}