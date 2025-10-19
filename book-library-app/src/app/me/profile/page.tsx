'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatters'
import { updateUserPreferences } from '@/lib/firebase/firestore'

export default function ProfilePage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)

  const themeOptions: Array<{ id: 'light' | 'dark'; label: string; description: string; preview: string }> = [
    {
      id: 'light',
      label: 'Light',
      description: 'Bright backgrounds and crisp contrast for daytime reading.',
      preview: 'bg-gradient-to-br from-white via-gray-100 to-gray-200',
    },
    {
      id: 'dark',
      label: 'Dark',
      description: 'Muted interface with deep tones that go easy on the eyes at night.',
      preview: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700',
    },
  ]

  const handleSavePreferences = async () => {
    if (!user) return

    setSaving(true)
    try {
      await updateUserPreferences(user.uid, {
        theme,
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Profile
        </h1>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.createdAt && formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Preferences
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalize the interface to match how and when you read.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                Active theme: {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {themeOptions.map((option) => {
                const isActive = theme === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                      isActive
                        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                        : 'border-gray-200 hover:border-primary-400 dark:border-gray-700 dark:hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      <span
                        className={`h-6 w-6 rounded-full border-2 ${
                          isActive
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    <div className={`mt-6 h-24 rounded-xl ${option.preview}`}></div>
                  </button>
                )
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSavePreferences} loading={saving}>
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}