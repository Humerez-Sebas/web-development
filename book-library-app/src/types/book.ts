export interface Book {
  id: string
  title: string
  authors: string[]
  publishedDate?: string
  description?: string
  shortDescription?: string
  coverUrl?: string
  pageCount?: number
  categories?: string[]
  averageRating?: number
  language?: string
  isbn?: string
  previewLink?: string
  stock: BookStock
  stats: BookStats
  popularityScore: number
}

export interface BookStock {
  total: number
  available: number
}

export interface BookStats {
  views: number
  wishlists: number
  loans: number
}

export interface GoogleBookVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
    language?: string
    previewLink?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export interface GoogleBooksSearchResponse {
  totalItems: number
  items?: GoogleBookVolume[]
}