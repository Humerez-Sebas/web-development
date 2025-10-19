import { BookStats } from '@/types'

export const calculatePopularityScore = (stats: BookStats): number => {
  const wishlistWeight = 2
  const loanWeight = 3
  const viewWeight = 0.5
  
  return (
    stats.wishlists * wishlistWeight +
    stats.loans * loanWeight +
    stats.views * viewWeight
  )
}

export const getPopularityBadge = (score: number): string => {
  if (score >= 100) return 'Bestseller'
  if (score >= 50) return 'Popular'
  if (score >= 20) return 'Rising'
  if (score >= 5) return 'New'
  return ''
}

export const getStockStatus = (available: number, total: number): string => {
  const percentage = (available / total) * 100
  
  if (available === 0) return 'Out of Stock'
  if (percentage <= 20) return 'Low Stock'
  if (percentage <= 50) return 'Limited'
  return 'Available'
}

export const getStockStatusColor = (available: number, total: number): string => {
  const percentage = (available / total) * 100
  
  if (available === 0) return 'text-red-600'
  if (percentage <= 20) return 'text-orange-600'
  if (percentage <= 50) return 'text-yellow-600'
  return 'text-green-600'
}