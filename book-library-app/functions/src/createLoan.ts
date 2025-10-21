import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { ensureBookDocument, buildBookPayload, calculatePopularity } from './bookData'

interface CreateLoanRequest {
  userId: string
  book: { id: string; title?: string; authors?: string[]; publishedDate?: string; description?: string; shortDescription?: string; coverUrl?: string; pageCount?: number; categories?: string[]; averageRating?: number; language?: string; isbn?: string; previewLink?: string }
  userSnapshot: { name: string; email: string }
}

export const createLoan = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required')

  const data = request.data as CreateLoanRequest
  if (!data || !data.userId?.trim()) throw new HttpsError('invalid-argument', 'User identifier is required')
  if (request.auth.uid !== data.userId) throw new HttpsError('permission-denied', 'Operation not allowed')
  if (!data.book?.id?.trim()) throw new HttpsError('invalid-argument', 'Book payload is invalid')
  if (!data.userSnapshot?.name || !data.userSnapshot?.email) throw new HttpsError('invalid-argument', 'User snapshot is invalid')

  const db = getFirestore()
  const sanitizedBook = buildBookPayload(data.book)

  await ensureBookDocument({ ...sanitizedBook, id: sanitizedBook.id, stock: sanitizedBook.stock, stats: sanitizedBook.stats })

  const userLoansCol = db.collection('users').doc(data.userId).collection('loans')
  const bookRef = db.doc(`books/${sanitizedBook.id}`)
  const loanId = userLoansCol.doc().id

  const createdLoan = await db.runTransaction(async (tx) => {
    const bookSnap = await tx.get(bookRef)
    if (!bookSnap.exists) throw new HttpsError('failed-precondition', 'Book record is not available')

    const bookData = bookSnap.data() as any
    const stock = bookData.stock || { total: 0, available: 0 }
    const available = Math.max(0, stock.available ?? 0)
    if (available <= 0) throw new HttpsError('failed-precondition', 'Book is out of stock')

    const activeLoansQuery = userLoansCol.where('status', '==', 'active')
    const activeLoans = await tx.get(activeLoansQuery)
    if (activeLoans.size >= 3) throw new HttpsError('failed-precondition', 'Maximum loan limit reached')

    const now = Timestamp.now()
    const dueDate = Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))

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
      userSnapshot: { name: data.userSnapshot.name, email: data.userSnapshot.email },
    }

    const loanRef = userLoansCol.doc(loanId)
    tx.set(loanRef, loanData)

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

    tx.update(bookRef, {
      'stats.views': updatedStats.views,
      'stats.wishlists': updatedStats.wishlists,
      'stats.loans': updatedStats.loans,
      'stock.total': updatedStock.total,
      'stock.available': updatedStock.available,
      popularityScore: calculatePopularity(updatedStats),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { id: loanId, ...loanData }
  })

  return { success: true, loan: createdLoan }
})
