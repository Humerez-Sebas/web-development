'use client'

import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join us to start building your library
          </p>
        </div>
        <Card className="p-6">
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}