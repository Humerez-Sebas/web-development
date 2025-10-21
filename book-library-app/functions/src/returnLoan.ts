import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

interface ReturnLoanRequest {
  userId: string
  loanId: string
  book: { id: string }
}

export const returnLoan = onCall({ region: 'us-central1' }, async (request) => {
  const data = request.data as ReturnLoanRequest
  const auth = request.auth

  if (!auth) {
    throw new HttpsError('unauthenticated', 'Authentication required')
  }
  if (!data?.userId || auth.uid !== data.userId) {
    throw new HttpsError('permission-denied', 'Operation not allowed')
  }
  if (!data?.loanId || !data?.book?.id) {
    throw new HttpsError('invalid-argument', 'Loan id and book id are required')
  }

  const db = getFirestore()
  const loanRef = db.collection('users').doc(data.userId).collection('loans').doc(data.loanId)
  const bookRef = db.doc(`books/${data.book.id}`)

  await db.runTransaction(async (tx) => {
    const loanSnap = await tx.get(loanRef)
    if (!loanSnap.exists) throw new HttpsError('not-found', 'Loan not found')

    const loanData = loanSnap.data() as any
    if (loanData.status !== 'active') {
      throw new HttpsError('failed-precondition', 'Loan is not active')
    }

    const bookSnap = await tx.get(bookRef)
    if (!bookSnap.exists) {
      throw new HttpsError('failed-precondition', 'Book record is not available')
    }

    const book = bookSnap.data() as any
    const total = Math.max(0, book?.stock?.total ?? 0)
    const available = Math.max(0, Math.min(total, (book?.stock?.available ?? 0) + 1))

    tx.update(loanRef, {
      status: 'returned',
      returnedAt: FieldValue.serverTimestamp(),
    })

    tx.update(bookRef, {
      'stock.total': total,
      'stock.available': available,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  return { success: true }
})
