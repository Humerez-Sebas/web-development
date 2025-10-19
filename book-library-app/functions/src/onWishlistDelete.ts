import * as functions from 'firebase-functions'
import { updateBookStats } from './bookData'

export const onWishlistDelete = functions.firestore
  .document('users/{userId}/wishlist/{wishlistId}')
  .onDelete(async (snap, context) => {
    const data = snap.data()
    const bookId = data.bookId as string

    if (!bookId) {
      return null
    }

    await updateBookStats(bookId, ({ stats, stock }) => {
      return {
        stats: {
          views: stats.views,
          wishlists: Math.max(0, stats.wishlists - 1),
          loans: stats.loans,
        },
        stock,
      }
    })

    return null
  })
