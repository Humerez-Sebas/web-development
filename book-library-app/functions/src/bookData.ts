import * as admin from 'firebase-admin'

export interface BookInput {
  id: string
  title?: string
  authors?: string[]
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
  stock?: {
    total?: number
    available?: number
  }
  stats?: {
    views?: number
    wishlists?: number
    loans?: number
  }
}

export interface BookStats {
  views: number
  wishlists: number
  loans: number
}

export interface BookStock {
  total: number
  available: number
}

export const calculatePopularity = (stats: BookStats): number => {
  const viewScore = stats.views
  const wishlistScore = stats.wishlists * 5
  const loanScore = stats.loans * 10
  return viewScore + wishlistScore + loanScore
}

const normalizeAuthors = (authors?: string[]): string[] => {
  if (!authors || !Array.isArray(authors) || authors.length === 0) {
    return ['Unknown Author']
  }
  return authors.filter((author) => author && author.trim().length > 0)
}

const normalizeText = (value?: string): string => {
  if (!value) {
    return ''
  }
  return value
}

const normalizeCategories = (categories?: string[]): string[] => {
  if (!categories || !Array.isArray(categories)) {
    return []
  }
  return categories.filter((category) => category && category.trim().length > 0)
}

const normalizeStats = (stats?: BookInput['stats']): BookStats => {
  return {
    views: Math.max(0, stats?.views ?? 0),
    wishlists: Math.max(0, stats?.wishlists ?? 0),
    loans: Math.max(0, stats?.loans ?? 0),
  }
}

const normalizeStock = (stock?: BookInput['stock']): BookStock => {
  const total = Math.max(0, stock?.total ?? 5)
  const availableBase = stock?.available ?? total
  const available = Math.min(total, Math.max(0, availableBase))
  return {
    total,
    available,
  }
}

export const buildBookPayload = (input: BookInput) => {
  const stats = normalizeStats(input.stats)
  const stock = normalizeStock(input.stock)
  return {
    id: input.id,
    title: input.title && input.title.trim().length > 0 ? input.title : 'Untitled',
    authors: normalizeAuthors(input.authors),
    publishedDate: normalizeText(input.publishedDate),
    description: normalizeText(input.description),
    shortDescription: normalizeText(input.shortDescription),
    coverUrl: normalizeText(input.coverUrl) || '/book-placeholder.png',
    pageCount: input.pageCount ?? 0,
    categories: normalizeCategories(input.categories),
    averageRating: input.averageRating ?? 0,
    language: normalizeText(input.language),
    isbn: normalizeText(input.isbn),
    previewLink: normalizeText(input.previewLink),
    stock,
    stats,
  }
}

export const ensureBookDocument = async (input: BookInput) => {
  const db = admin.firestore()
  const bookRef = db.doc(`books/${input.id}`)
  const payload = buildBookPayload(input)
  const timestamp = admin.firestore.FieldValue.serverTimestamp()
  const snapshot = await bookRef.get()

  if (!snapshot.exists) {
    const popularityScore = calculatePopularity(payload.stats)
    await bookRef.set({
      title: payload.title,
      authors: payload.authors,
      publishedDate: payload.publishedDate,
      description: payload.description,
      shortDescription: payload.shortDescription,
      coverUrl: payload.coverUrl,
      pageCount: payload.pageCount,
      categories: payload.categories,
      averageRating: payload.averageRating,
      language: payload.language,
      isbn: payload.isbn,
      previewLink: payload.previewLink,
      stock: payload.stock,
      stats: payload.stats,
      popularityScore,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  } else {
    await bookRef.update({
      title: payload.title,
      authors: payload.authors,
      publishedDate: payload.publishedDate,
      description: payload.description,
      shortDescription: payload.shortDescription,
      coverUrl: payload.coverUrl,
      pageCount: payload.pageCount,
      categories: payload.categories,
      averageRating: payload.averageRating,
      language: payload.language,
      isbn: payload.isbn,
      previewLink: payload.previewLink,
      updatedAt: timestamp,
    })
  }

  const updatedSnapshot = await bookRef.get()
  return updatedSnapshot.data()
}

export const updateBookStats = async (
  bookId: string,
  updater: (current: { stats: BookStats; stock: BookStock }) => {
    stats: BookStats
    stock?: BookStock
  }
) => {
  const db = admin.firestore()
  const bookRef = db.doc(`books/${bookId}`)

  await db.runTransaction(async (transaction) => {
    const bookSnapshot = await transaction.get(bookRef)
    if (!bookSnapshot.exists) {
      return
    }

    const data = bookSnapshot.data() as any
    const currentStats = normalizeStats(data.stats)
    const currentStock = normalizeStock(data.stock)
    const result = updater({ stats: currentStats, stock: currentStock })
    const popularityScore = calculatePopularity(result.stats)

    const updatePayload: Record<string, unknown> = {
      'stats.views': result.stats.views,
      'stats.wishlists': result.stats.wishlists,
      'stats.loans': result.stats.loans,
      popularityScore,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    if (result.stock) {
      updatePayload['stock.total'] = result.stock.total
      updatePayload['stock.available'] = result.stock.available
    }

    transaction.update(bookRef, updatePayload)
  })
}
