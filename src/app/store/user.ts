import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface User {
  id: string
  email: string
  name: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      const response = await api.get<User[]>('/users')
      users.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    loading.value = true
    try {
      const response = await api.get<User>('/users/me')
      currentUser.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    loading,
    fetchUsers,
    fetchCurrentUser,
  }
})
