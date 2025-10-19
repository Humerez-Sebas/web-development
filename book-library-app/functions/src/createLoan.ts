import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ensureBookDocument, buildBookPayload, calculatePopularity } from './bookData'

interface CreateLoanRequest {
  userId: string
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
  userSnapshot: {
    name: string
    email: string
  }
}

export const createLoan = functions.region('us-central1').https.onCall(async (data: CreateLoanRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required')
  }

  if (!data || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'User identifier is required')
  }

  if (context.auth.uid !== data.userId) {
    throw new functions.https.HttpsError('permission-denied', 'Operation not allowed')
  }

  if (!data.book || typeof data.book.id !== 'string' || data.book.id.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Book payload is invalid')
  }

  if (!data.userSnapshot || typeof data.userSnapshot.name !== 'string' || typeof data.userSnapshot.email !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'User snapshot is invalid')
  }

  const db = admin.firestore()
  const sanitizedBook = buildBookPayload(data.book)
  await ensureBookDocument({
    ...sanitizedBook,
    id: sanitizedBook.id,
    stock: sanitizedBook.stock,
    stats: sanitizedBook.stats,
  })

  const userLoansCollection = db.collection('users').doc(data.userId).collection('loans')
  const bookRef = db.doc(`books/${sanitizedBook.id}`)

  const loanId = userLoansCollection.doc().id
  const createdLoan = await db.runTransaction(async (transaction) => {
    const bookSnapshot = await transaction.get(bookRef)
    if (!bookSnapshot.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'Book record is not available')
    }

    const bookData = bookSnapshot.data() as any
    const stock = bookData.stock || { total: 0, available: 0 }
    const available = Math.max(0, stock.available ?? 0)
    if (available <= 0) {
      throw new functions.https.HttpsError('failed-precondition', 'Book is out of stock')
    }

    const activeLoansQuery = userLoansCollection.where('status', '==', 'active')
    const activeLoans = await transaction.get(activeLoansQuery)
    if (activeLoans.size >= 3) {
      throw new functions.https.HttpsError('failed-precondition', 'Maximum loan limit reached')
    }

    const now = admin.firestore.Timestamp.now()
    const dueDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))

    const loanData = {
      userId: data.userId,
      bookId: sanitizedBook.id,
      createdAt: now,
      dueDate,
      status: 'active',
      snapshot: {
        id: sanitizedBook.id,
        title: sanitizedBook.title,
        authors: sanitizedBook.authors,
        coverUrl: sanitizedBook.coverUrl,
        publishedDate: sanitizedBook.publishedDate,
        shortDescription: sanitizedBook.shortDescription,
      },
      userSnapshot: {
        name: data.userSnapshot.name,
        email: data.userSnapshot.email,
      },
    }

    const loanRef = userLoansCollection.doc(loanId)
    transaction.set(loanRef, loanData)

    const stats = bookData.stats || { views: 0, wishlists: 0, loans: 0 }
    const updatedStats = {
      views: Math.max(0, stats.views ?? 0),
      wishlists: Math.max(0, stats.wishlists ?? 0),
      loans: Math.max(0, stats.loans ?? 0) + 1,
    }

    const updatedStock = {
      total: Math.max(0, stock.total ?? 0),
      available: Math.max(0, Math.min(stock.total ?? 0, available - 1)),
    }

    transaction.update(bookRef, {
      'stats.views': updatedStats.views,
      'stats.wishlists': updatedStats.wishlists,
      'stats.loans': updatedStats.loans,
      'stock.total': updatedStock.total,
      'stock.available': updatedStock.available,
      popularityScore: calculatePopularity(updatedStats),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return { id: loanId, ...loanData }
  })

  return {
    success: true,
    loan: createdLoan,
  }
})