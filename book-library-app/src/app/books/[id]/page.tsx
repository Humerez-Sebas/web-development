'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book } from '@/types'
import { getBookById, transformGoogleBookToBook, initializeBookInFirestore } from '@/lib/api/googleBooks'
import {
  getBookFromFirestore,
  addBookToFirestoreAndGet,
  reportBookView,
} from '@/lib/firebase/firestore'
import { BookDetail } from '@/components/books/BookDetail'
import { Header } from '@/components/layout/Header'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function BookPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadBook = async () => {
      try {
        console.log('🔍 Loading book with ID:', resolvedParams.id)
        setLoading(true)

        // 1️⃣ Intentar obtener desde Firestore
        let bookData = await getBookFromFirestore(resolvedParams.id)
        console.log('📘 Firestore returned:', bookData)

        // 2️⃣ Si no está en Firestore, obtener de Google Books
        if (!bookData) {
          console.warn('⚠️ Book not found in Firestore, fetching from Google Books...')
          const googleBook = await getBookById(resolvedParams.id)
          console.log('🌐 Google Books API returned:', googleBook)

          const transformedBook = transformGoogleBookToBook(googleBook)
          console.log('🔄 Transformed Google Book:', transformedBook)

          const initializedBook = initializeBookInFirestore(transformedBook)
          bookData = await addBookToFirestoreAndGet(initializedBook)
          console.log('✅ Book synced & loaded from Firestore successfully.')
        } else {
          console.log('📚 Book loaded directly from Firestore.')
        }

        // 3️⃣ Actualizar estado
        setBook(bookData)

        // 4️⃣ Reportar vista si hay usuario
        if (user) {
          console.log(`👤 Reporting book view for user: ${user.uid}`)
          await reportBookView(resolvedParams.id)
          console.log('📈 View reported successfully.')
        } else {
          console.log('⚠️ No user logged in, skipping view report.')
        }
      } catch (err) {
        console.error('❌ Error loading book:', err)
        setError(err instanceof Error ? err.message : 'Failed to load book')
        router.push('/404')
      } finally {
        console.log('✅ Finished loadBook execution.')
        setLoading(false)
      }
    }

    if (resolvedParams?.id) {
      loadBook()
    } else {
      console.warn('⚠️ No book ID found in params.')
    }
  }, [resolvedParams?.id, user, router])

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </>
    )
  }

  // Error or missing book
  if (error || !book) {
    console.warn('⚠️ Rendering error or missing book state:', error)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Book not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'The book you are looking for does not exist.'}
            </p>
          </div>
        </div>
      </>
    )
  }

  // Success: render book details
  console.log('🎉 Rendering BookDetail for:', book.title)
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <BookDetail book={book} />
      </div>
    </>
  )
}
