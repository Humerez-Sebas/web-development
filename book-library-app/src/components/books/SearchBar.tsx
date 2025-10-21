'use client'

import { useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

const CATEGORY_OPTIONS = [
  { label: 'All categories', value: '' },
  { label: 'Art', value: 'Art' },
  { label: 'Biography & Autobiography', value: 'Biography & Autobiography' },
  { label: 'Business & Economics', value: 'Business & Economics' },
  { label: 'Computers', value: 'Computers' },
  { label: 'Cooking', value: 'Cooking' },
  { label: 'Crafts & Hobbies', value: 'Crafts & Hobbies' },
  { label: 'Education', value: 'Education' },
  { label: 'Fiction', value: 'Fiction' },
  { label: 'Health & Fitness', value: 'Health & Fitness' },
  { label: 'History', value: 'History' },
  { label: 'Humor', value: 'Humor' },
  { label: 'Juvenile Fiction', value: 'Juvenile Fiction' },
  { label: 'Language Arts & Disciplines', value: 'Language Arts & Disciplines' },
  { label: 'Law', value: 'Law' },
  { label: 'Literary Criticism', value: 'Literary Criticism' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Medical', value: 'Medical' },
  { label: 'Music', value: 'Music' },
  { label: 'Nature', value: 'Nature' },
  { label: 'Performing Arts', value: 'Performing Arts' },
  { label: 'Pets', value: 'Pets' },
  { label: 'Philosophy', value: 'Philosophy' },
  { label: 'Photography', value: 'Photography' },
  { label: 'Poetry', value: 'Poetry' },
  { label: 'Political Science', value: 'Political Science' },
  { label: 'Psychology', value: 'Psychology' },
  { label: 'Reference', value: 'Reference' },
  { label: 'Religion', value: 'Religion' },
  { label: 'Science', value: 'Science' },
  { label: 'Self-Help', value: 'Self-Help' },
  { label: 'Social Science', value: 'Social Science' },
  { label: 'Sports & Recreation', value: 'Sports & Recreation' },
  { label: 'Study Aids', value: 'Study Aids' },
  { label: 'Technology & Engineering', value: 'Technology & Engineering' },
  { label: 'Transportation', value: 'Transportation' },
  { label: 'Travel', value: 'Travel' },
]

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'relevance' | 'popularity'>('relevance')
  const { performSearch, loading } = useBooks()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() && !category && sort !== 'popularity') return
    performSearch(query, 1, { category, sort })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,260px,180px,110px] gap-2">
        <Input
          type="text"
          placeholder="Title, author, or ISBN (optional)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.label} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as 'relevance' | 'popularity')}>
          <option value="relevance">Sort: Relevance</option>
          <option value="popularity">Sort: Popularity</option>
        </Select>
        <Button type="submit" loading={loading} aria-label="Search">
          Search
        </Button>
      </div>
    </form>
  )
}
