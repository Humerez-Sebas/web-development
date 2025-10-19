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
  increment,
  runTransaction,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './init'
import type { Book, WishlistItem, Loan, User } from '@/types'

export const addBookToFirestore = async (book: Book): Promise<void> => {
  try {
    await setDoc(doc(db, 'books', book.id), book)
  } catch (error) {
    console.error('Error adding book to Firestore:', error)
    throw error
  }
}

export const getBookFromFirestore = async (bookId: string): Promise<Book | null> => {
  try {
    const bookDoc = await getDoc(doc(db, 'books', bookId))
    
    if (!bookDoc.exists()) {
      return null
    }
    
    return { id: bookDoc.id, ...bookDoc.data() } as Book
  } catch (error) {
    console.error('Error getting book from Firestore:', error)
    return null
  }
}

export const addToWishlist = async (
  userId: string,
  book: Book,
  user: User
): Promise<void> => {
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
    userSnapshot: {
      name: user.name,
      email: user.email,
    },
  }
  
  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(wishlistRef, wishlistItem)
      
      const bookRef = doc(db, 'books', book.id)
      const bookDoc = await transaction.get(bookRef)
      
      if (bookDoc.exists()) {
        transaction.update(bookRef, {
          'stats.wishlists': increment(1),
        })
      }
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    throw error
  }
}

export const removeFromWishlist = async (
  userId: string,
  wishlistItemId: string,
  bookId: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const wishlistRef = doc(db, 'users', userId, 'wishlist', wishlistItemId)
      transaction.delete(wishlistRef)
      
      const bookRef = doc(db, 'books', bookId)
      const bookDoc = await transaction.get(bookRef)
      
      if (bookDoc.exists()) {
        transaction.update(bookRef, {
          'stats.wishlists': increment(-1),
        })
      }
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    throw error
  }
}

export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const wishlistQuery = query(
      collection(db, 'users', userId, 'wishlist'),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(wishlistQuery)
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WishlistItem[]
  } catch (error) {
    console.error('Error getting user wishlist:', error)
    return []
  }
}

export const createLoan = async (
  userId: string,
  book: Book,
  user: User
): Promise<void> => {
  const loanRef = doc(collection(db, 'users', userId, 'loans'))
  
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)
  
  const loan: Omit<Loan, 'id'> = {
    userId,
    bookId: book.id,
    createdAt: Timestamp.now(),
    dueDate: Timestamp.fromDate(dueDate),
    status: 'active',
    snapshot: {
      id: book.id,
      title: book.title,
      authors: book.authors,
      coverUrl: book.coverUrl,
      publishedDate: book.publishedDate,
      shortDescription: book.shortDescription,
    },
    userSnapshot: {
      name: user.name,
      email: user.email,
    },
  }
  
  try {
    await runTransaction(db, async (transaction) => {
      const bookRef = doc(db, 'books', book.id)
      const bookDoc = await transaction.get(bookRef)
      
      if (!bookDoc.exists()) {
        throw new Error('Book not found')
      }
      
      const bookData = bookDoc.data() as Book
      
      if (bookData.stock.available <= 0) {
        throw new Error('Book is out of stock')
      }
      
      const userLoansQuery = query(
        collection(db, 'users', userId, 'loans'),
        where('status', '==', 'active')
      )
      const userLoans = await getDocs(userLoansQuery)
      
      if (userLoans.size >= 3) {
        throw new Error('Maximum loan limit reached')
      }
      
      transaction.set(loanRef, loan)
      
      transaction.update(bookRef, {
        'stock.available': increment(-1),
        'stats.loans': increment(1),
      })
    })
  } catch (error) {
    console.error('Error creating loan:', error)
    throw error
  }
}

export const returnLoan = async (
  userId: string,
  loanId: string,
  bookId: string
): Promise<void> => {
  try {
    await runTransaction(db, async (transaction) => {
      const loanRef = doc(db, 'users', userId, 'loans', loanId)
      
      transaction.update(loanRef, {
        status: 'returned',
        returnedAt: serverTimestamp(),
      })
      
      const bookRef = doc(db, 'books', bookId)
      transaction.update(bookRef, {
        'stock.available': increment(1),
      })
    })
  } catch (error) {
    console.error('Error returning loan:', error)
    throw error
  }
}

export const getUserLoans = async (
  userId: string,
  status?: 'active' | 'returned' | 'overdue'
): Promise<Loan[]> => {
  try {
    let loansQuery
    
    if (status) {
      loansQuery = query(
        collection(db, 'users', userId, 'loans'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    } else {
      loansQuery = query(
        collection(db, 'users', userId, 'loans'),
        orderBy('createdAt', 'desc')
      )
    }
    
    const snapshot = await getDocs(loansQuery)
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Loan[]
  } catch (error) {
    console.error('Error getting user loans:', error)
    return []
  }
}

export const reportBookView = async (bookId: string, userId: string): Promise<void> => {
  try {
    const viewRef = doc(db, 'bookViews', bookId, 'views', userId)
    
    await setDoc(viewRef, {
      lastViewedAt: serverTimestamp(),
    })
    
    const bookRef = doc(db, 'books', bookId)
    const bookDoc = await getDoc(bookRef)
    
    if (bookDoc.exists()) {
      await updateDoc(bookRef, {
        'stats.views': increment(1),
      })
    }
  } catch (error) {
    console.error('Error reporting book view:', error)
  }
}

export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<User['preferences']>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      preferences,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}

export const isBookInWishlist = async (
  userId: string,
  bookId: string
): Promise<boolean> => {
  try {
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

export const hasActiveLoanForBook = async (
  userId: string,
  bookId: string
): Promise<boolean> => {
  try {
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