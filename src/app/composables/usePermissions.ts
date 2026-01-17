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

  // Access Management permissions
  const canAccessUsers = computed(() => hasPermission('users.read'))
  const canCreateUsers = computed(() => hasPermission('users.create'))
  const canUpdateUsers = computed(() => hasPermission('users.update'))
  const canDeleteUsers = computed(() => hasPermission('users.delete'))
  const canAccessRoles = computed(() => hasPermission('roles.read'))
  const canCreateRoles = computed(() => hasPermission('roles.create'))
  const canUpdateRoles = computed(() => hasPermission('roles.update'))
  const canDeleteRoles = computed(() => hasPermission('roles.delete'))
  const canAccessPermissions = computed(() => hasPermission('permissions.read'))
  const canAccessAccessManagement = computed(() => 
    hasAnyPermission(['users.read', 'roles.read', 'permissions.read'])
  )
  const canManageUserRoles = computed(() => hasAnyPermission(['users.manage-roles', 'roles.update']))
  const canManageUserPermissions = computed(() => hasPermission('users.manage-permissions'))

  // Event permissions
  const canReadEvents = computed(() => hasPermission('events.read'))
  const canWriteEvents = computed(() => hasAnyPermission(['events.create', 'events.update']))
  const canCreateEvents = computed(() => hasPermission('events.create'))
  const canUpdateEvents = computed(() => hasPermission('events.update'))
  const canDeleteEvents = computed(() => hasPermission('events.delete'))
  const canManageEvents = computed(() => hasPermission('events.manage'))

  // Participant permissions
  const canReadParticipants = computed(() => hasPermission('participants.read'))
  const canWriteParticipants = computed(() => hasAnyPermission(['participants.create', 'participants.update']))
  const canCreateParticipants = computed(() => hasPermission('participants.create'))
  const canUpdateParticipants = computed(() => hasPermission('participants.update'))
  const canDeleteParticipants = computed(() => hasPermission('participants.delete'))
  const canImportParticipants = computed(() => hasPermission('participants.import'))
  const canExportParticipants = computed(() => hasPermission('participants.export'))

  // Checkpoint permissions
  const canReadCheckpoints = computed(() => hasPermission('checkpoints.read'))
  const canWriteCheckpoints = computed(() => hasAnyPermission(['checkpoints.create', 'checkpoints.update']))
  const canCreateCheckpoints = computed(() => hasPermission('checkpoints.create'))
  const canUpdateCheckpoints = computed(() => hasPermission('checkpoints.update'))
  const canDeleteCheckpoints = computed(() => hasPermission('checkpoints.delete'))

  // Checkpoint Type permissions
  const canReadCheckpointTypes = computed(() => hasPermission('checkpoint-types.read'))
  const canCreateCheckpointTypes = computed(() => hasPermission('checkpoint-types.create'))
  const canUpdateCheckpointTypes = computed(() => hasPermission('checkpoint-types.update'))
  const canDeleteCheckpointTypes = computed(() => hasPermission('checkpoint-types.delete'))
  const canManageCheckpointTypes = computed(() => hasAnyPermission(['checkpoint-types.create', 'checkpoint-types.update', 'checkpoint-types.delete']))

  // Check-in permissions
  const canVerifyCheckins = computed(() => hasPermission('checkins.verify'))
  const canReadCheckins = computed(() => hasPermission('checkins.read'))
  const canDeleteCheckins = computed(() => hasPermission('checkins.delete'))

  // Report permissions
  const canViewReports = computed(() => hasPermission('reports.view'))
  const canExportReports = computed(() => hasPermission('reports.export'))

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canAccessRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
    canAccessPermissions,
    canAccessAccessManagement,
    canManageUserRoles,
    canManageUserPermissions,
    canReadEvents,
    canWriteEvents,
    canCreateEvents,
    canUpdateEvents,
    canDeleteEvents,
    canManageEvents,
    canReadParticipants,
    canWriteParticipants,
    canCreateParticipants,
    canUpdateParticipants,
    canDeleteParticipants,
    canImportParticipants,
    canExportParticipants,
    canReadCheckpoints,
    canWriteCheckpoints,
    canCreateCheckpoints,
    canUpdateCheckpoints,
    canDeleteCheckpoints,
    canReadCheckpointTypes,
    canCreateCheckpointTypes,
    canUpdateCheckpointTypes,
    canDeleteCheckpointTypes,
    canManageCheckpointTypes,
    canVerifyCheckins,
    canReadCheckins,
    canDeleteCheckins,
    canViewReports,
    canExportReports,
  }
}
