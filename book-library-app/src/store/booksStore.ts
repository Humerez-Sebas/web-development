import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Book, GoogleBookVolume } from '@/types'

interface BooksStore {
  searchQuery: string
  searchResults: GoogleBookVolume[]
  totalResults: number
  currentPage: number
  loading: boolean
  error: string | null
  selectedBook: Book | null
  setSearchQuery: (query: string) => void
  setSearchResults: (results: GoogleBookVolume[], total: number) => void
  setCurrentPage: (page: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedBook: (book: Book | null) => void
  clearSearch: () => void
}

export const useBooksStore = create<BooksStore>()(
  devtools(
    immer((set) => ({
      searchQuery: '',
      searchResults: [],
      totalResults: 0,
      currentPage: 1,
      loading: false,
      error: null,
      selectedBook: null,
      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query
        }),
      setSearchResults: (results, total) =>
        set((state) => {
          state.searchResults = results
          state.totalResults = total
          state.loading = false
          state.error = null
        }),
      setCurrentPage: (page) =>
        set((state) => {
          state.currentPage = page
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),
      setError: (error) =>
        set((state) => {
          state.error = error
          state.loading = false
        }),
      setSelectedBook: (book) =>
        set((state) => {
          state.selectedBook = book
        }),
      clearSearch: () =>
        set((state) => {
          state.searchQuery = ''
          state.searchResults = []
          state.totalResults = 0
          state.currentPage = 1
          state.error = null
        }),
    })),
    { name: 'BooksStore' }
  )
)