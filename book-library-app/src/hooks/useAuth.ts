import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const { user, loading, error } = useAuthStore()
  return { user, loading, error }
}