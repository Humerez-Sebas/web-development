import { GoogleBooksSearchResponse, GoogleBookVolume, Book } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
const BASE_URL = 'https://www.googleapis.com/books/v1'

// 🔍 Buscar libros en Google Books
export const searchBooks = async (
  query: string,
  startIndex: number = 0,
  maxResults: number = 15
): Promise<GoogleBooksSearchResponse> => {
  const url = `${BASE_URL}/volumes?q=${encodeURIComponent(
    query
  )}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to search books')
  }

  return response.json()
}

// 📘 Obtener un libro por ID
export const getBookById = async (bookId: string): Promise<GoogleBookVolume> => {
  const url = `${BASE_URL}/volumes/${bookId}?key=${API_KEY}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch book')
  }

  return response.json()
}

// 🔄 Transformar datos de Google Books a nuestro modelo interno
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

// 🧩 Inicializar libro listo para guardar en Firestore
export const initializeBookInFirestore = (
  bookData: ReturnType<typeof transformGoogleBookToBook>
): Book => {
  return {
    ...bookData,
    stock: {
      total: 5,
      available: 5,
    },
    stats: {
      views: 0,
      wishlists: 0,
      loans: 0,
    },
    popularityScore: 0,
  }
}
