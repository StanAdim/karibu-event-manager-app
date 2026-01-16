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

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<Permission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPermissions() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Permission[] } | Permission[]>('/api/v1/permissions')
      const permissionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      permissions.value = permissionsData
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Group permissions by resource (e.g., events.read, events.write -> "events")
  function getGroupedPermissions(): Record<string, Permission[]> {
    const grouped: Record<string, Permission[]> = {}
    
    permissions.value.forEach(permission => {
      const parts = permission.name.split('.')
      const resource = parts[0] || 'other'
      
      if (!grouped[resource]) {
        grouped[resource] = []
      }
      grouped[resource].push(permission)
    })
    
    return grouped
  }

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    getGroupedPermissions,
  }
})
