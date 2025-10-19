'use client'

import { useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const { performSearch, loading } = useBooks()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for books by title, author, or ISBN..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          className="flex-1"
        />
        <Button
          type="submit"
          loading={loading}
          aria-label="Search"
          className="flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Button>
      </div>
    </form>
  )
}