import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function BookNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Book Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The book you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}