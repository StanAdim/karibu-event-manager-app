import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<AuthResponse['user'] | null>(
    localStorage.getItem('auth_user') 
      ? JSON.parse(localStorage.getItem('auth_user')!) 
      : null
  )

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
        console.log(response)
      token.value = response.data.token
      user.value = response.data.user
      
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('auth_user', JSON.stringify(response.data.user))
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
