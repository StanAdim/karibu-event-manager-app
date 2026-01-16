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

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(perm => authStore.hasPermission(perm))
  }

  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role)
  }

  // Access Management permissions (using colon notation)
  const canAccessUsers = computed(() => hasPermission('users:read'))
  const canAccessRoles = computed(() => hasPermission('roles:read'))
  const canAccessPermissions = computed(() => hasPermission('permissions:read'))
  const canAccessAccessManagement = computed(() => 
    hasAnyPermission(['users:read', 'roles:read', 'permissions:read'])
  )
  const canManageUserRoles = computed(() => hasPermission('users:manage-roles'))
  const canManageUserPermissions = computed(() => hasPermission('users:manage-permissions'))

  // Event permissions
  const canReadEvents = computed(() => hasPermission('events:read'))
  const canWriteEvents = computed(() => hasPermission('events:write'))
  const canDeleteEvents = computed(() => hasPermission('events:delete'))
  const canManageEvents = computed(() => hasPermission('events:manage'))

  // Participant permissions
  const canReadParticipants = computed(() => hasPermission('participants:read'))
  const canWriteParticipants = computed(() => hasPermission('participants:write'))
  const canDeleteParticipants = computed(() => hasPermission('participants:delete'))
  const canImportParticipants = computed(() => hasPermission('participants:import'))
  const canExportParticipants = computed(() => hasPermission('participants:export'))

  // Checkpoint permissions
  const canReadCheckpoints = computed(() => hasPermission('checkpoints:read'))
  const canWriteCheckpoints = computed(() => hasPermission('checkpoints:write'))
  const canDeleteCheckpoints = computed(() => hasPermission('checkpoints:delete'))

  // Check-in permissions
  const canVerifyCheckins = computed(() => hasPermission('checkins:verify'))
  const canReadCheckins = computed(() => hasPermission('checkins:read'))
  const canDeleteCheckins = computed(() => hasPermission('checkins:delete'))

  // Report permissions
  const canViewReports = computed(() => hasPermission('reports:view'))
  const canExportReports = computed(() => hasPermission('reports:export'))

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessUsers,
    canAccessRoles,
    canAccessPermissions,
    canAccessAccessManagement,
    canManageUserRoles,
    canManageUserPermissions,
    canReadEvents,
    canWriteEvents,
    canDeleteEvents,
    canManageEvents,
    canReadParticipants,
    canWriteParticipants,
    canDeleteParticipants,
    canImportParticipants,
    canExportParticipants,
    canReadCheckpoints,
    canWriteCheckpoints,
    canDeleteCheckpoints,
    canVerifyCheckins,
    canReadCheckins,
    canDeleteCheckins,
    canViewReports,
    canExportReports,
  }
}
