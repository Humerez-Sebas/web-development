import { BookStats as BookStatsType } from '@/types'

interface BookStatsProps {
  stats: BookStatsType
}

export const BookStats = ({ stats }: BookStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.views}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
      </div>
      
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.wishlists}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Wishlists</p>
      </div>
      
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.loans}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loans</p>
      </div>
    </div>
  )
}