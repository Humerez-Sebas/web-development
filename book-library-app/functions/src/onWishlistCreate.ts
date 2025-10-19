import * as functions from 'firebase-functions'
import { ensureBookDocument, updateBookStats, buildBookPayload } from './bookData'

export const onWishlistCreate = functions.firestore
  .document('users/{userId}/wishlist/{wishlistId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const bookId = data.bookId as string

    if (!bookId) {
      return null
    }

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

    await updateBookStats(bookId, ({ stats, stock }) => {
      return {
        stats: {
          views: stats.views,
          wishlists: stats.wishlists + 1,
          loans: stats.loans,
        },
        stock,
      }
    })

    return null
  })