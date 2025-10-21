import { GoogleBooksSearchResponse, GoogleBookVolume, Book } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
const BASE_URL = 'https://www.googleapis.com/books/v1'

export const searchBooks = async (
  query: string,
  startIndex: number = 0,
  maxResults: number = 15,
  category?: string
): Promise<GoogleBooksSearchResponse> => {
  const hasQuery = !!query?.trim()
  const hasCategory = !!category?.trim()

  if (!hasQuery && !hasCategory) {
    throw new Error('Either query or category is required')
  }

  const q = hasQuery
    ? encodeURIComponent(query.trim()) + (hasCategory ? `+subject:${encodeURIComponent(category!.trim())}` : '')
    : `subject:${encodeURIComponent(category!.trim())}`

  const url = `${BASE_URL}/volumes?q=${q}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to search books')
  return res.json()
}

export const getBookById = async (bookId: string): Promise<GoogleBookVolume> => {
  const url = `${BASE_URL}/volumes/${bookId}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch book')
  return res.json()
}

export const transformGoogleBookToBook = (
  googleBook: GoogleBookVolume
): Omit<Book, 'stock' | 'stats' | 'popularityScore'> => {
  const info = googleBook.volumeInfo || {}
  const description = info.description ?? ''
  const isbn =
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier ||
    info.industryIdentifiers?.find((id) => id.type === 'ISBN_10')?.identifier ||
    ''
  const shortDescription = description
    ? `${description.substring(0, 200)}${description.length > 200 ? '...' : ''}`
    : ''

  return {
    id: googleBook.id,
    title: info.title || 'Untitled',
    authors: info.authors?.length ? info.authors : ['Unknown Author'],
    publishedDate: info.publishedDate ?? '',
    description,
    shortDescription,
    coverUrl: info.imageLinks?.thumbnail || '/book-placeholder.png',
    pageCount: info.pageCount ?? 0,
    categories: info.categories ?? [],
    averageRating: info.averageRating ?? 0,
    language: info.language ?? '',
    isbn,
    previewLink: info.previewLink ?? '',
  }
}

export const initializeBookInFirestore = (
  bookData: ReturnType<typeof transformGoogleBookToBook>
): Book => {
  return {
    ...bookData,
    stock: { total: 5, available: 5 },
    stats: { views: 0, wishlists: 0, loans: 0 },
    popularityScore: 0,
  }
}
