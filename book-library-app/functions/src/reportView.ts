import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const reportView = functions.https.onCall(async (data, context) => {
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
  const batch = db.batch()

  const viewRef = db.doc(`bookViews/${bookId}/views/${userId}`)
  const viewDoc = await viewRef.get()

  const bookRef = db.doc(`books/${bookId}`)

  if (!viewDoc.exists) {
    batch.set(viewRef, {
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    batch.update(bookRef, {
      'stats.views': admin.firestore.FieldValue.increment(1),
    })

    await batch.commit()
  } else {
    await viewRef.update({
      lastViewedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  }

  return { success: true }
})