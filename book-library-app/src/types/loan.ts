import { Timestamp } from 'firebase/firestore'

export interface Loan {
  id: string
  userId: string
  bookId: string
  createdAt: Timestamp
  dueDate: Timestamp
  returnedAt?: Timestamp
  status: LoanStatus
  snapshot: LoanBookSnapshot
  userSnapshot: LoanUserSnapshot
}

export type LoanStatus = 'active' | 'returned' | 'overdue'

export interface LoanBookSnapshot {
  id: string
  title: string
  authors: string[]
  coverUrl?: string
  publishedDate?: string
  shortDescription?: string
}

export interface LoanUserSnapshot {
  name: string
  email: string
}