import { onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { updateBookStats } from './bookData'

export const onWishlistDelete = onDocumentDeleted(
  'users/{userId}/wishlist/{wishlistId}',
  async (event) => {
    const data = event.data?.data() as any
    const bookId = data?.bookId as string | undefined
    if (!bookId) return

    await updateBookStats(bookId, ({ stats, stock }) => ({
      stats: { views: stats.views, wishlists: Math.max(0, stats.wishlists - 1), loans: stats.loans },
      stock,
    }))
  }
)
