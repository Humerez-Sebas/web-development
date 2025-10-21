import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { ensureBookDocument, updateBookStats, buildBookPayload } from './bookData'

export const onWishlistCreate = onDocumentCreated(
  'users/{userId}/wishlist/{wishlistId}',
  async (event) => {
    const snap = event.data
    if (!snap) return
    const data = snap.data() as any
    const bookId = data?.bookId as string | undefined
    if (!bookId) return

    const snapshot = data.snapshot || {}

    await ensureBookDocument(
      buildBookPayload({
        id: bookId,
        title: snapshot.title,
        authors: snapshot.authors,
        coverUrl: snapshot.coverUrl,
        publishedDate: snapshot.publishedDate,
        shortDescription: snapshot.shortDescription,
      })
    )

    await updateBookStats(bookId, ({ stats, stock }) => ({
      stats: { views: stats.views, wishlists: stats.wishlists + 1, loans: stats.loans },
      stock,
    }))
  }
)
