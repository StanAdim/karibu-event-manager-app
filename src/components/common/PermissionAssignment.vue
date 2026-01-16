<template>
  <div>
    <div v-if="loading" class="text-sm text-chatgpt-text-light">Loading permissions...</div>
    <div v-else class="space-y-4">
      <div
        v-for="(permissions, resource) in groupedPermissions"
        :key="resource"
        class="border border-chatgpt-border rounded-lg p-4"
      >
        <h4 class="text-sm font-semibold text-chatgpt-text mb-3 capitalize">{{ resource }}</h4>
        <div class="space-y-2">
          <label
            v-for="permission in permissions"
            :key="permission.id"
            class="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="isPermissionAssigned(permission.id)"
              @change="togglePermission(permission.id, $event.target.checked)"
              :disabled="saving"
              class="rounded border-chatgpt-border text-chatgpt-text focus:ring-chatgpt-text"
            />
            <span class="text-sm text-chatgpt-text">{{ permission.name }}</span>
          </label>
        </div>
      </div>
      <div v-if="Object.keys(groupedPermissions).length === 0" class="text-sm text-chatgpt-text-light">
        No permissions available
      </div>
    </div>
    <div v-if="error" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
      {{ error }}
    </div>
    <div v-if="success" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
      {{ success }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePermissionStore } from '@/app/store/permission'
import { useUserStore } from '@/app/store/user'
import type { Permission } from '@/app/store/permission'

interface Props {
  userId: string | number
  currentPermissions: Permission[] | string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updated: []
}>()

const permissionStore = usePermissionStore()
const userStore = useUserStore()
const saving = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const groupedPermissions = computed(() => {
  const grouped: Record<string, typeof permissionStore.permissions> = {}
  
  permissionStore.permissions.forEach(permission => {
    // Handle both colon (events:read) and dot (events.read) notation
    const parts = permission.name.split(/[:.]/)
    const resource = parts[0] || 'other'
    
    if (!grouped[resource]) {
      grouped[resource] = []
    }
    grouped[resource].push(permission)
  })
  
  return grouped
})

function isPermissionAssigned(permissionId: string | number): boolean {
  return props.currentPermissions.some((p: Permission | string) => {
    if (typeof p === 'string') {
      // If permission is a string, compare with permission name
      const permission = permissionStore.permissions.find(perm => perm.name === p)
      return permission ? permission.id === permissionId : false
    }
    return p.id === permissionId
  })
}

async function togglePermission(permissionId: string | number, assigned: boolean) {
  saving.value = true
  error.value = null
  success.value = null

  try {
    // Convert current permissions to IDs
    const currentPermissionIds = props.currentPermissions.map((p: Permission | string) => {
      if (typeof p === 'string') {
        const permission = permissionStore.permissions.find(perm => perm.name === p)
        return permission ? permission.id : null
      }
      return p.id
    }).filter((id): id is string | number => id !== null)
    
    let newPermissionIds: (string | number)[]

    if (assigned) {
      newPermissionIds = [...currentPermissionIds, permissionId]
    } else {
      newPermissionIds = currentPermissionIds.filter(id => id !== permissionId)
    }

    await userStore.assignPermissionsToUser(props.userId, newPermissionIds)
    success.value = 'Permissions updated successfully'
    emit('updated')
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update permissions'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (permissionStore.permissions.length === 0) {
      await permissionStore.fetchPermissions()
    }
  } finally {
    loading.value = false
  }
})
</script>
