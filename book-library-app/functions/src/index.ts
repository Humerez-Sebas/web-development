import * as admin from 'firebase-admin'
import { reportView } from './reportView'
import { onWishlistCreate } from './onWishlistCreate'
import { onLoanCreate } from './onLoanCreate'
import { onLoanReturn } from './onLoanReturn'
import { recomputePopularity } from './recomputePopularity'

admin.initializeApp()

export { reportView, onWishlistCreate, onLoanCreate, onLoanReturn, recomputePopularity }