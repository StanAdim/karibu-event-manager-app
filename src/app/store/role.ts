import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Permission {
  id: string | number
  name: string
  guard_name?: string
  description?: string
  [key: string]: any
}

export interface Role {
  id: string | number
  name: string
  guard_name?: string
  permissions?: Permission[]
  permissions_count?: number
  users_count?: number
  [key: string]: any
}

export interface CreateRoleDto {
  name: string
  guard_name?: string
  permissions?: (string | number)[]
}

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([])
  const currentRole = ref<Role | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRoles() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Role[] } | Role[]>('/api/v1/roles')
      const rolesData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      roles.value = rolesData
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch roles'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRoleById(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Role } | Role>(`/api/v1/roles/${id}`)
      const roleData = (response.data as any)?.data || response.data
      currentRole.value = roleData as Role
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch role'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignPermissionsToRole(roleId: string | number, permissionIds: (string | number)[]) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Role } | Role>(
        `/api/v1/roles/${roleId}/permissions`,
        { permissions: permissionIds }
      )
      const roleData = (response.data as any)?.data || response.data
      
      // Update current role if it matches
      if (currentRole.value?.id === roleId) {
        currentRole.value = roleData as Role
      }
      
      // Update in list
      const index = roles.value.findIndex(r => r.id === roleId)
      if (index !== -1) {
        roles.value[index] = roleData as Role
      }
      
      return roleData as Role
    } catch (err: any) {
      error.value = err.message || 'Failed to assign permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createRole(data: CreateRoleDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Role } | Role>('/api/v1/roles', data)
      const roleData = (response.data as any)?.data || response.data
      const newRole = roleData as Role
      roles.value.push(newRole)
      return newRole
    } catch (err: any) {
      error.value = err.message || 'Failed to create role'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id: string | number, data: Partial<CreateRoleDto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Role } | Role>(`/api/v1/roles/${id}`, data)
      const roleData = (response.data as any)?.data || response.data
      const updatedRole = roleData as Role
      
      // Update in list
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        roles.value[index] = updatedRole
      }
      
      // Update current role if it matches
      if (currentRole.value?.id === id) {
        currentRole.value = updatedRole
      }
      
      return updatedRole
    } catch (err: any) {
      error.value = err.message || 'Failed to update role'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    roles,
    currentRole,
    loading,
    error,
    fetchRoles,
    fetchRoleById,
    assignPermissionsToRole,
    createRole,
    updateRole,
  }
})
