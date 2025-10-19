import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { updateBookStats } from './bookData'

export const reportView = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { bookId } = data
  const userId = context.auth.uid

  if (!bookId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Book ID is required'
    )
  }

  const db = admin.firestore()
  const viewRef = db.doc(`bookViews/${bookId}/views/${userId}`)
  const viewDoc = await viewRef.get()

  if (!viewDoc.exists) {
    await viewRef.set({
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    await updateBookStats(bookId, ({ stats, stock }) => {
      return {
        stats: {
          views: stats.views + 1,
          wishlists: stats.wishlists,
          loans: stats.loans,
        },
        stock,
      }
    })
  } else {
    await viewRef.update({
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  return { success: true }
})