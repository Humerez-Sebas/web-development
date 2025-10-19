import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail } from '@/lib/firebase/auth'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleAuthButton } from './GoogleAuthButton'

export const LoginForm = () => {
  const router = useRouter()
  const { setUser, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      const user = await loginWithEmail(email, password)
      setUser(user)
      router.push('/')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed')
      setError(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />
      <Input
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />
      {formError && (
        <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
      )}
      <Button type="submit" fullWidth loading={loading}>
        Sign In
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
        </div>
      </div>
      <GoogleAuthButton />
    </form>
  )
}