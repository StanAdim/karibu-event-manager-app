import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)

  const login = async (email: string, password: string) => {
    try {
      await authStore.login({ email, password })
      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authStore.logout()
    router.push('/')
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
  }
}
