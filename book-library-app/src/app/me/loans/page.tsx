'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoanGrid } from '@/components/loans/LoanGrid'
import { Header } from '@/components/layout/Header'

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Loans
        </h1>
        <LoanGrid />
      </div>
    </ProtectedRoute>
  )
}