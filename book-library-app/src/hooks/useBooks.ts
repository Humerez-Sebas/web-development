import { useState, useCallback } from 'react'
import {
  searchBooks,
  getBookById,
  transformGoogleBookToBook,
  initializeBookInFirestore,
} from '@/lib/api/googleBooks'
import {
  addBookToFirestoreAndGet,
  getBookFromFirestore,
  getPopularBooks,
} from '@/lib/firebase/firestore'
import { useBooksStore } from '@/store/booksStore'
import type { Book } from '@/types'

type SortMode = 'relevance' | 'popularity'

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

  const toGoogleVolumeShape = (b: Book) =>
    ({
      id: b.id,
      volumeInfo: {
        title: b.title || 'Untitled',
        authors: b.authors?.length ? b.authors : ['Unknown Author'],
        imageLinks: { thumbnail: b.coverUrl || '/book-placeholder.png' },
        publishedDate: b.publishedDate ?? '',
        description: b.description ?? '',
        categories: b.categories ?? [],
        averageRating: b.averageRating ?? 0,
        language: b.language ?? '',
        previewLink: b.previewLink ?? '',
      },
    } as any)

  const performSearch = useCallback(
    async (
      query: string,
      page: number = 1,
      opts?: {
        category?: string
        sort?: SortMode
      }
    ) => {
      const sort = opts?.sort ?? 'relevance'
      const category = opts?.category?.trim() || ''
      const hasQuery = !!query?.trim()
      const hasCategory = !!category

      setSearchLoading(true)
      setLoading(true)
      setError(null)

      try {
        const pageSize = 15
        const startIndex = (page - 1) * pageSize

        if (!hasQuery && sort === 'popularity') {
          const popularBooks = await getPopularBooks(pageSize, category || undefined)
          const items = popularBooks.map(toGoogleVolumeShape)
          setSearchQuery('')
          setSearchResults(items, items.length)
          setCurrentPage(1)
          return
        }

        if (!hasQuery && hasCategory) {
          const response = await searchBooks('', startIndex, pageSize, category)
          setSearchQuery('')
          setSearchResults(response.items || [], response.totalItems)
          setCurrentPage(page)
          return
        }

        const response = await searchBooks(query, startIndex, pageSize, category)
        let items = response.items || []

        if (sort === 'popularity' && items.length) {
          const enriched = await Promise.all(
            items.map(async (g) => {
              const doc = await getBookFromFirestore(g.id)
              const score = (doc as any)?.popularityScore ?? 0
              return { google: g, popularity: score }
            })
          )
          enriched.sort((a, b) => b.popularity - a.popularity)
          items = enriched.map((e) => e.google)
        }

        setSearchQuery(query)
        setSearchResults(items, response.totalItems)
        setCurrentPage(page)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setSearchLoading(false)
        setLoading(false)
      }
    },
    [setSearchQuery, setSearchResults, setCurrentPage, setLoading, setError]
  )

  const fetchBookDetails = useCallback(
    async (bookId: string): Promise<Book | null> => {
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
    },
    [setSelectedBook, setLoading, setError]
  )

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
