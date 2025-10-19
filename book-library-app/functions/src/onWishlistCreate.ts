import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const onWishlistCreate = functions.firestore
  .document('users/{userId}/wishlist/{wishlistId}')
  .onCreate(async (snap, context) => {
    const data = snap.data()
    const bookId = data.bookId

    const db = admin.firestore()
    const bookRef = db.doc(`books/${bookId}`)

    await bookRef.update({
      'stats.wishlists': admin.firestore.FieldValue.increment(1),
    })

    return null
  })