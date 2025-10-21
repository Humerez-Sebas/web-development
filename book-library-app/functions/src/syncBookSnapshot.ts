import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { ensureBookDocument, buildBookPayload } from './bookData'

export const syncBookSnapshot = onCall(async (request) => {
  const book = request.data?.book
  if (!book || typeof book.id !== 'string' || book.id.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'Book payload is invalid')
  }

  const sanitized = buildBookPayload(book)
  await ensureBookDocument({ ...sanitized, id: sanitized.id, stock: sanitized.stock, stats: sanitized.stats })

  const db = getFirestore()
  const snapshot = await db.doc(`books/${sanitized.id}`).get()
  return { success: true, book: snapshot.data() }
})
