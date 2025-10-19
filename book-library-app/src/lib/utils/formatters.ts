import { Timestamp } from 'firebase/firestore'

export const formatDate = (date: Date | Timestamp): string => {
  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export const formatDateTime = (date: Date | Timestamp): string => {
  const dateObj = date instanceof Timestamp ? date.toDate() : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export const formatDaysRemaining = (dueDate: Timestamp): string => {
  const now = new Date()
  const due = dueDate.toDate()
  const diff = due.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) {
    return `${Math.abs(days)} days overdue`
  } else if (days === 0) {
    return 'Due today'
  } else if (days === 1) {
    return '1 day remaining'
  } else {
    return `${days} days remaining`
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export const formatAuthors = (authors: string[]): string => {
  if (!authors || authors.length === 0) return 'Unknown Author'
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return authors.join(' & ')
  return `${authors[0]} & others`
}