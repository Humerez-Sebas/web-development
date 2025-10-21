import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { updateBookStats } from './bookData'

export const reportView = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'User must be authenticated')

  const bookId = request.data?.bookId as string | undefined
  const userId = request.auth.uid
  if (!bookId) throw new HttpsError('invalid-argument', 'Book ID is required')

  const db = getFirestore()
  const viewRef = db.doc(`bookViews/${bookId}/views/${userId}`)
  const viewDoc = await viewRef.get()

  if (!viewDoc.exists) {
    await viewRef.set({ lastViewedAt: FieldValue.serverTimestamp() })
    await updateBookStats(bookId, ({ stats, stock }) => ({
      stats: { views: stats.views + 1, wishlists: stats.wishlists, loans: stats.loans },
      stock,
    }))
  } else {
    await viewRef.update({ lastViewedAt: FieldValue.serverTimestamp() })
  }

  return { success: true }
})
