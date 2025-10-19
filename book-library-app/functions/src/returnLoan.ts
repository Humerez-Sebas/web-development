import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ensureBookDocument, buildBookPayload } from './bookData'

interface ReturnLoanRequest {
  userId: string
  loanId: string
  book: {
    id: string
    title?: string
    authors?: string[]
    publishedDate?: string
    description?: string
    shortDescription?: string
    coverUrl?: string
    pageCount?: number
    categories?: string[]
    averageRating?: number
    language?: string
    isbn?: string
    previewLink?: string
  }
}

export const returnLoan = functions.region('us-central1').https.onCall(async (data: ReturnLoanRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
  }

  if (!data || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'User identifier is required')
  }

  if (context.auth.uid !== data.userId) {
    throw new functions.https.HttpsError('permission-denied', 'Operation not allowed')
  }

  if (!data.loanId || typeof data.loanId !== 'string' || data.loanId.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Loan identifier is required')
  }

  if (!data.book || typeof data.book.id !== 'string' || data.book.id.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Book payload is invalid')
  }

  const db = admin.firestore()
  const sanitizedBook = buildBookPayload(data.book)
  await ensureBookDocument({
    ...sanitizedBook,
    id: sanitizedBook.id,
    stock: sanitizedBook.stock,
    stats: sanitizedBook.stats,
  })

  const loanRef = db.collection('users').doc(data.userId).collection('loans').doc(data.loanId)
  const bookRef = db.doc(`books/${sanitizedBook.id}`)

  await db.runTransaction(async (transaction) => {
    const loanSnapshot = await transaction.get(loanRef)
    if (!loanSnapshot.exists) {
      throw new functions.https.HttpsError('not-found', 'Loan not found')
    }

    const loanData = loanSnapshot.data() as any
    if (loanData.status !== 'active') {
      throw new functions.https.HttpsError('failed-precondition', 'Loan is not active')
    }

    const bookSnapshot = await transaction.get(bookRef)
    if (!bookSnapshot.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'Book record is not available')
    }

    const bookData = bookSnapshot.data() as any
    const stock = bookData.stock || { total: 0, available: 0 }
    const total = Math.max(0, stock.total ?? 0)
    const available = Math.max(0, Math.min(total, (stock.available ?? 0) + 1))

    transaction.update(loanRef, {
      status: 'returned',
      returnedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    transaction.update(bookRef, {
      'stock.total': total,
      'stock.available': available,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })

  return {
    success: true,
  }
})