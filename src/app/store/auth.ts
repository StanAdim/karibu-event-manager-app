import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface Permission {
  id: string | number
  name: string
  guard_name?: string
  [key: string]: any
}

export interface Role {
  id: string | number
  name: string
  guard_name?: string
  [key: string]: any
}

export interface User {
  id: string | number
  name: string
  email: string
  permissions?: Permission[]
  roles?: Role[]
  [key: string]: any
}

export interface AuthResponse {
  token?: string
  access_token?: string
  user?: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(
    localStorage.getItem('auth_user') 
      ? JSON.parse(localStorage.getItem('auth_user')!) 
      : null
  )

  const isAuthenticated = computed(() => !!token.value)
  
  const permissions = computed(() => {
    if (!user.value) return []
    // Get permissions from user object (direct permissions + role permissions)
    const directPermissions = user.value.permissions || []
    const rolePermissions = user.value.roles?.flatMap(role => role.permissions || []) || []
    
    // Combine and deduplicate by name
    const allPermissions = [...directPermissions, ...rolePermissions]
    const uniquePermissions = allPermissions.filter((perm, index, self) =>
      index === self.findIndex(p => p.name === perm.name)
    )
    return uniquePermissions.map(p => p.name)
  })
  
  const roles = computed(() => {
    if (!user.value) return []
    return (user.value.roles || []).map(r => r.name)
  })
  
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }
  
  function hasAnyPermission(permissionList: string[]): boolean {
    return permissionList.some(perm => permissions.value.includes(perm))
  }
  
  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('auth_token', newToken)
  }

  function setUser(userData: User) {
    user.value = userData
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/login', credentials)
      const authData = response.data
      
      // Handle different response formats
      const authToken = authData.token || authData.access_token
      if (authToken) {
        setToken(authToken)
      }

      // Fetch user if not included in response
      if (authData.user) {
        setUser(authData.user)
      } else {
        await fetchUser()
      }
      
      return authData
    } catch (error) {
      throw error
    }
  }

  async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/register', credentials)
      const authData = response.data
      
      const authToken = authData.token || authData.access_token
      if (authToken) {
        setToken(authToken)
      }

      if (authData.user) {
        setUser(authData.user)
      } else {
        await fetchUser()
      }
      
      return authData
    } catch (error) {
      throw error
    }
  }

  async function fetchUser(): Promise<User> {
    try {
      const response = await api.get<{ data?: User; user?: User }>('/api/v1/auth/user')
      const userData = response.data.data || response.data.user || response.data
      if (userData) {
        setUser(userData as User)
        return userData as User
      }
      throw new Error('User data not found in response')
    } catch (error) {
      throw error
    }
  }

  async function refreshToken(): Promise<string> {
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/refresh', {})
      const authToken = response.data.token || response.data.access_token
      if (authToken) {
        setToken(authToken)
        return authToken
      }
      throw new Error('Token not found in refresh response')
    } catch (error) {
      logout()
      throw error
    }
  }

  async function logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      if (token.value) {
        await api.post('/api/v1/auth/logout', {})
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local state
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  async function changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<void> {
    try {
      await api.post('/api/v1/auth/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      })
    } catch (error) {
      throw error
    }
  }

  async function requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/api/v1/auth/password/reset-link', { email })
    } catch (error) {
      throw error
    }
  }

  async function resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Promise<void> {
    try {
      await api.post('/api/v1/auth/password/reset', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasRole,
    setToken,
    setUser,
    login,
    register,
    fetchUser,
    refreshToken,
    logout,
    changePassword,
    requestPasswordReset,
    resetPassword,
  }
})
