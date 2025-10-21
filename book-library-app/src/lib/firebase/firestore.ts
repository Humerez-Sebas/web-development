import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from './init'
import type { Book, WishlistItem, Loan, User } from '@/types'

interface SyncBookRequest {
  book: Book
}

interface CreateLoanRequest {
  userId: string
  book: Book
  userSnapshot: { name: string; email: string }
}

interface ReturnLoanRequest {
  userId: string
  loanId: string
  book: { id: string; title?: string; authors?: string[]; publishedDate?: string; shortDescription?: string; coverUrl?: string }
}

interface CallableSuccess {
  success: boolean
  book?: Book
}

const syncBookSnapshotCallable = httpsCallable<SyncBookRequest, CallableSuccess>(functions, 'syncBookSnapshot')
const createLoanCallable = httpsCallable<CreateLoanRequest, CallableSuccess>(functions, 'createLoan')
const returnLoanCallable = httpsCallable<ReturnLoanRequest, CallableSuccess>(functions, 'returnLoan')
const reportViewCallable = httpsCallable<{ bookId: string }, CallableSuccess>(functions, 'reportView')

const assertString: (v: unknown, name: string) => asserts v is string = (v, name) => {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`${name} is required`)
}

const assertBook: (b: Book | null | undefined) => asserts b is Book = (b) => {
  if (!b?.id || !`${b.id}`.trim()) throw new Error('book.id is required')
}

const sanitizeBookForTransfer = (book: Book): Book => ({
  ...book,
  title: book.title || 'Untitled',
  authors: book.authors?.length ? book.authors : ['Unknown Author'],
  publishedDate: book.publishedDate ?? '',
  description: book.description ?? '',
  shortDescription: book.shortDescription ?? '',
  coverUrl: book.coverUrl ?? '/book-placeholder.png',
  pageCount: book.pageCount ?? 0,
  categories: book.categories ?? [],
  averageRating: book.averageRating ?? 0,
  language: book.language ?? '',
  isbn: book.isbn ?? '',
  previewLink: book.previewLink ?? '',
  stock: {
    total: book.stock?.total ?? 0,
    available: book.stock?.available ?? 0,
  },
  stats: {
    views: book.stats?.views ?? 0,
    wishlists: book.stats?.wishlists ?? 0,
    loans: book.stats?.loans ?? 0,
  },
  popularityScore: book.popularityScore ?? 0,
})

export const addBookToFirestore = async (book: Book): Promise<void> => {
  assertBook(book)
  const { data } = await syncBookSnapshotCallable({ book: sanitizeBookForTransfer(book) })
  if (!data?.success) throw new Error('syncBookSnapshot failed')
}

export const addBookToFirestoreAndGet = async (book: Book): Promise<Book> => {
  assertBook(book)
  const { data } = await syncBookSnapshotCallable({ book: sanitizeBookForTransfer(book) })
  if (data?.book) return data.book as Book
  const fresh = await getBookFromFirestore(book.id)
  if (!fresh) throw new Error('Book not found after sync')
  return fresh
}

export const getBookFromFirestore = async (bookId: string): Promise<Book | null> => {
  try {
    assertString(bookId, 'bookId')
    const bookDoc = await getDoc(doc(db, 'books', bookId))
    if (!bookDoc.exists()) return null
    return { id: bookDoc.id, ...bookDoc.data() } as Book
  } catch (error) {
    console.error('Error getting book from Firestore:', error)
    return null
  }
}

export const addToWishlist = async (userId: string, book: Book, user: User): Promise<void> => {
  assertString(userId, 'userId')
  assertBook(book)
  const wishlistRef = doc(collection(db, 'users', userId, 'wishlist'))
  const wishlistItem: Omit<WishlistItem, 'id'> = {
    userId,
    bookId: book.id,
    createdAt: Timestamp.now(),
    snapshot: {
      id: book.id,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      publishedDate: book.publishedDate,
      shortDescription: book.shortDescription,
    },
    userSnapshot: { name: user.name, email: user.email },
  }
  await addBookToFirestore(book)
  await setDoc(wishlistRef, wishlistItem)
}

export const removeFromWishlist = async (userId: string, wishlistItemId: string, _bookId: string): Promise<void> => {
  assertString(userId, 'userId')
  assertString(wishlistItemId, 'wishlistItemId')
  const wishlistRef = doc(db, 'users', userId, 'wishlist', wishlistItemId)
  await deleteDoc(wishlistRef)
}

export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    assertString(userId, 'userId')
    const wishlistQuery = query(collection(db, 'users', userId, 'wishlist'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(wishlistQuery)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as WishlistItem[]
  } catch (error) {
    console.error('Error getting user wishlist:', error)
    return []
  }
}

export const createLoan = async (userId: string, book: Book, user: User): Promise<void> => {
  assertString(userId, 'userId')
  assertBook(book)
  await addBookToFirestore(book)
  await createLoanCallable({
    userId,
    book: sanitizeBookForTransfer(book),
    userSnapshot: { name: user.name, email: user.email },
  })
}

export const returnLoan = async (userId: string, loanId: string, bookId: string): Promise<void> => {
  assertString(userId, 'userId')
  assertString(loanId, 'loanId')
  assertString(bookId, 'bookId')
  await returnLoanCallable({ userId, loanId, book: { id: bookId } })
}

export const getUserLoans = async (userId: string, status?: 'active' | 'returned' | 'overdue'): Promise<Loan[]> => {
  try {
    assertString(userId, 'userId')
    const base = collection(db, 'users', userId, 'loans')
    const loansQuery = status
      ? query(base, where('status', '==', status), orderBy('createdAt', 'desc'))
      : query(base, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(loansQuery)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Loan[]
  } catch (error) {
    console.error('Error getting user loans:', error)
    return []
  }
}

export const isBookInWishlist = async (userId: string | undefined, bookId: string | undefined): Promise<boolean> => {
  try {
    if (!userId || !bookId) return false
    const wishlistQuery = query(
      collection(db, 'users', userId, 'wishlist'),
      where('bookId', '==', bookId),
      limit(1)
    )
    const snapshot = await getDocs(wishlistQuery)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking wishlist status:', error)
    return false
  }
}

export const hasActiveLoanForBook = async (userId: string | undefined, bookId: string | undefined): Promise<boolean> => {
  try {
    if (!userId || !bookId) return false
    const loansQuery = query(
      collection(db, 'users', userId, 'loans'),
      where('bookId', '==', bookId),
      where('status', '==', 'active'),
      limit(1)
    )
    const snapshot = await getDocs(loansQuery)
    return !snapshot.empty
  } catch (error) {
    console.error('Error checking loan status:', error)
    return false
  }
}

export const reportBookView = async (bookId: string): Promise<void> => {
  try {
    assertString(bookId, 'bookId')
    await reportViewCallable({ bookId })
  } catch (error) {
    console.error('Error reporting book view:', error)
  }
}

export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<User['preferences']>
): Promise<void> => {
  assertString(userId, 'userId')
  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (preferences.theme) updates['preferences.theme'] = preferences.theme
  if (preferences.language) updates['preferences.language'] = preferences.language
  if (typeof preferences.emailNotifications === 'boolean') updates['preferences.emailNotifications'] = preferences.emailNotifications
  await updateDoc(doc(db, 'users', userId), updates)
}

export const getPopularBooks = async (limitCount = 15, category?: string): Promise<Book[]> => {
  try {
    let q = query(collection(db, 'books'), orderBy('popularityScore', 'desc'), limit(limitCount))
    if (category?.trim()) {
      q = query(
        collection(db, 'books'),
        where('categories', 'array-contains', category.trim()),
        orderBy('popularityScore', 'desc'),
        limit(limitCount)
      )
    }
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Book[]
  } catch (e) {
    console.error('Error fetching popular books:', e)
    return []
  }
}
``
