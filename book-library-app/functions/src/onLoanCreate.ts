import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const onLoanCreate = functions.firestore
  .document('users/{userId}/loans/{loanId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const bookId = data.bookId

    const db = admin.firestore()
    const bookRef = db.doc(`books/${bookId}`)

    await bookRef.update({
      'stats.loans': admin.firestore.FieldValue.increment(1),
      'stock.available': admin.firestore.FieldValue.increment(-1),
    })

    return null
  })