import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ensureBookDocument, buildBookPayload } from './bookData'

export const syncBookSnapshot = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
  }

  const book = data?.book

  if (!book || typeof book.id !== 'string' || book.id.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Book payload is invalid')
  }

  const sanitized = buildBookPayload(book)
  await ensureBookDocument({
    ...sanitized,
    id: sanitized.id,
    stock: sanitized.stock,
    stats: sanitized.stats,
  })

  const db = admin.firestore()
  const snapshot = await db.doc(`books/${sanitized.id}`).get()
  return {
    success: true,
    book: snapshot.data(),
  }
})
