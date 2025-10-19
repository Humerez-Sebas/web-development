import { useState, useCallback } from 'react'
import { searchBooks, getBookById, transformGoogleBookToBook, initializeBookInFirestore } from '@/lib/api/googleBooks'
import { addBookToFirestoreAndGet, getBookFromFirestore } from '@/lib/firebase/firestore'
import { useBooksStore } from '@/store/booksStore'
import type { Book } from '@/types'

export const useBooks = () => {
  const {
    searchQuery,
    searchResults,
    totalResults,
    currentPage,
    loading,
    error,
    selectedBook,
    setSearchQuery,
    setSearchResults,
    setCurrentPage,
    setLoading,
    setError,
    setSelectedBook,
  } = useBooksStore()

  const [searchLoading, setSearchLoading] = useState(false)

  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return

    setSearchLoading(true)
    setLoading(true)
    setError(null)

    try {
      const startIndex = (page - 1) * 15
      const response = await searchBooks(query, startIndex)
      
      setSearchQuery(query)
      setSearchResults(response.items || [], response.totalItems)
      setCurrentPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearchLoading(false)
      setLoading(false)
    }
  }, [setSearchQuery, setSearchResults, setCurrentPage, setLoading, setError])

  const fetchBookDetails = useCallback(async (bookId: string): Promise<Book | null> => {
    setLoading(true)
    setError(null)

    try {
      let book = await getBookFromFirestore(bookId)
      
      if (!book) {
        const googleBook = await getBookById(bookId)
        const transformedBook = transformGoogleBookToBook(googleBook)
        const initializedBook = initializeBookInFirestore(transformedBook)
        book = await addBookToFirestoreAndGet(initializedBook)
      }
      
      setSelectedBook(book)
      return book
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch book details')
      return null
    } finally {
      setLoading(false)
    }
  }, [setSelectedBook, setLoading, setError])

  return {
    searchQuery,
    searchResults,
    totalResults,
    currentPage,
    loading: loading || searchLoading,
    error,
    selectedBook,
    performSearch,
    fetchBookDetails,
    setCurrentPage,
  }
}