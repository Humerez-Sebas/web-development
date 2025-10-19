import { Timestamp } from 'firebase/firestore'

export interface WishlistItem {
  id: string
  userId: string
  bookId: string
  createdAt: Timestamp
  snapshot: WishlistBookSnapshot
  userSnapshot: WishlistUserSnapshot
}

export interface WishlistBookSnapshot {
  id: string
  title: string
  authors: string[]
  coverUrl?: string
  publishedDate?: string
  shortDescription?: string
}

export interface WishlistUserSnapshot {
  name: string
  email: string
}