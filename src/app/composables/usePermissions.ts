import { computed } from 'vue'
import { useAuthStore } from '../store/auth'

export function usePermissions() {
  const authStore = useAuthStore()

  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return authStore.hasAnyPermission(permissions)
  }

  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role)
  }

  const canAccessUsers = computed(() => hasPermission('users.read'))
  const canAccessRoles = computed(() => hasPermission('roles.read'))
  const canAccessPermissions = computed(() => hasPermission('permissions.read'))
  const canAccessAccessManagement = computed(() => 
    hasAnyPermission(['users.read', 'roles.read', 'permissions.read'])
  )

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
    canAccessUsers,
    canAccessRoles,
    canAccessPermissions,
    canAccessAccessManagement,
  }
}
