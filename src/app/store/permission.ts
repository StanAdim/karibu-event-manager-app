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
      const response = await api.get<{ data?: Permission[] | Record<string, Permission[]> } | Permission[] | Record<string, Permission[]>>('/api/v1/permissions')
      
      let permissionsArray: Permission[] = []
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        // Direct array response
        permissionsArray = response.data
      } else if (response.data && typeof response.data === 'object') {
        const data = (response.data as any).data || response.data
        
        if (Array.isArray(data)) {
          // Nested array: { data: [...] }
          permissionsArray = data
        } else if (typeof data === 'object') {
          // Nested object grouped by resource: { data: { checkpoints: [...], events: [...] } }
          permissionsArray = Object.values(data).flat() as Permission[]
        }
      }
      
      permissions.value = permissionsArray
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch permissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Group permissions by resource (e.g., events:read, events:write -> "events")
  function getGroupedPermissions(): Record<string, Permission[]> {
    const grouped: Record<string, Permission[]> = {}
    
    permissions.value.forEach(permission => {
      // Handle both colon (events:read) and dot (events.read) notation
      const parts = permission.name.split(/[:.]/)
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
