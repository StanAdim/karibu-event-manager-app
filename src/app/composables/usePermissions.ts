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
  const canUpdateRoles = computed(() => hasPermission('roles.update'))
  const canAccessPermissions = computed(() => hasPermission('permissions.read'))
  const canAccessAccessManagement = computed(() => 
    hasAnyPermission(['users.read', 'roles.read', 'permissions.read'])
  )

  // Event permissions
  const canReadEvents = computed(() => hasPermission('events.read'))
  const canWriteEvents = computed(() => hasAnyPermission(['events.create', 'events.update']))
  const canCreateEvents = computed(() => hasPermission('events.create'))
  const canUpdateEvents = computed(() => hasPermission('events.update'))
  const canDeleteEvents = computed(() => hasPermission('events.delete'))

  // Participant permissions
  const canReadParticipants = computed(() => hasPermission('participants.read'))
  const canWriteParticipants = computed(() => hasAnyPermission(['participants.create', 'participants.update']))
  const canCreateParticipants = computed(() => hasPermission('participants.create'))
  const canUpdateParticipants = computed(() => hasPermission('participants.update'))
  const canDeleteParticipants = computed(() => hasPermission('participants.delete'))

  // Checkpoint permissions
  const canReadCheckpoints = computed(() => hasPermission('checkpoints.read'))
  const canWriteCheckpoints = computed(() => hasAnyPermission(['checkpoints.create', 'checkpoints.update']))
  const canCreateCheckpoints = computed(() => hasPermission('checkpoints.create'))
  const canUpdateCheckpoints = computed(() => hasPermission('checkpoints.update'))
  const canDeleteCheckpoints = computed(() => hasPermission('checkpoints.delete'))

  // Programme permissions
  const canViewProgramme = computed(() => hasPermission('programme.view'))
  const canManageProgramme = computed(() => hasPermission('programme.manage'))
  const canPublishProgramme = computed(() => hasPermission('programme.publish'))
  const canWriteProgramme = computed(() => hasAnyPermission(['programme.manage', 'programme.publish']))

  // Speakers permissions
  const canManageSpeakers = computed(() => hasPermission('speakers.manage'))

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
    canUpdateRoles,
    canAccessPermissions,
    canAccessAccessManagement,
    canReadEvents,
    canWriteEvents,
    canCreateEvents,
    canUpdateEvents,
    canDeleteEvents,
    canReadParticipants,
    canWriteParticipants,
    canCreateParticipants,
    canUpdateParticipants,
    canDeleteParticipants,
    canReadCheckpoints,
    canWriteCheckpoints,
    canCreateCheckpoints,
    canUpdateCheckpoints,
    canDeleteCheckpoints,
    canViewProgramme,
    canManageProgramme,
    canPublishProgramme,
    canWriteProgramme,
    canManageSpeakers,
  }
}
