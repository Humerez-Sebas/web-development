import * as admin from 'firebase-admin'
import { reportView } from './reportView'
import { onWishlistCreate } from './onWishlistCreate'
import { onWishlistDelete } from './onWishlistDelete'
import { syncBookSnapshot } from './syncBookSnapshot'
import { createLoan } from './createLoan'
import { returnLoan } from './returnLoan'

admin.initializeApp()

export {
  reportView,
  onWishlistCreate,
  onWishlistDelete,
  syncBookSnapshot,
  createLoan,
  returnLoan,
}