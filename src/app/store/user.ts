import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Role {
  id: string | number
  name: string
  guard_name?: string
  [key: string]: any
}

export interface Permission {
  id: string | number
  name: string
  guard_name?: string
  [key: string]: any
}

export interface User {
  id: string | number
  email: string
  name: string
  roles?: Role[] | string[]
  permissions?: Permission[] | string[]
  [key: string]: any
}

export interface CreateUserDto {
  name: string
  email: string
  password?: string
  password_confirmation?: string
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: User[] } | User[]>('/api/v1/users')
      const usersData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      users.value = usersData
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: User } | User>(`/api/v1/users/${id}`)
      const userData = (response.data as any)?.data || response.data
      currentUser.value = userData as User
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignRolesToUser(userId: string | number, roleNames: string[]) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: User } | User>(
        `/api/v1/users/${userId}/roles`,
        { roles: roleNames }
      )
      const userData = (response.data as any)?.data || response.data
      
      // Update current user if it matches
      if (currentUser.value?.id === userId) {
        currentUser.value = userData as User
      }
      
      // Update in list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = userData as User
      }
      
      return userData as User
    } catch (err: any) {
      error.value = err.message || 'Failed to assign roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignPermissionsToUser(userId: string | number, permissionIds: (string | number)[]) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: User } | User>(
        `/api/v1/users/${userId}/permissions`,
        { permissions: permissionIds }
      )
      const userData = (response.data as any)?.data || response.data
      
      // Update current user if it matches
      if (currentUser.value?.id === userId) {
        currentUser.value = userData as User
      }
      
      // Update in list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = userData as User
      }
      
      return userData as User
    } catch (err: any) {
      error.value = err.message || 'Failed to assign permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(data: CreateUserDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: User } | User>('/api/v1/users', data)
      const userData = (response.data as any)?.data || response.data
      const newUser = userData as User
      users.value.push(newUser)
      return newUser
    } catch (err: any) {
      error.value = err.message || 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: string | number, data: Partial<CreateUserDto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: User } | User>(`/api/v1/users/${id}`, data)
      const userData = (response.data as any)?.data || response.data
      const updatedUser = userData as User
      
      // Update in list
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Update current user if it matches
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err: any) {
      error.value = err.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    loading,
    error,
    fetchUsers,
    fetchUserById,
    assignRolesToUser,
    assignPermissionsToUser,
    createUser,
    updateUser,
  }
})
