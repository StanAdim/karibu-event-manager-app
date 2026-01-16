<template>
  <div>
    <div v-if="loading" class="text-sm text-chatgpt-text-light">Loading roles...</div>
    <div v-else class="space-y-3">
      <label
        v-for="role in allRoles"
        :key="role.id"
        class="flex items-center space-x-3 p-3 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <input
          type="checkbox"
          :checked="isRoleAssigned(role.id)"
          @change="toggleRole(role.id, $event.target.checked)"
          :disabled="saving"
          class="rounded border-chatgpt-border text-chatgpt-text focus:ring-chatgpt-text"
        />
        <div class="flex-1">
          <div class="text-sm font-medium text-chatgpt-text">{{ role.name }}</div>
          <div v-if="role.permissions_count" class="text-xs text-chatgpt-text-light">
            {{ role.permissions_count }} permissions
          </div>
        </div>
      </label>
      <div v-if="allRoles.length === 0" class="text-sm text-chatgpt-text-light">
        No roles available
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
import { useRoleStore } from '@/app/store/role'
import { useUserStore } from '@/app/store/user'
import type { Role } from '@/app/store/role'

interface Props {
  userId: string | number
  currentRoles: Role[] | string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updated: []
}>()

const roleStore = useRoleStore()
const userStore = useUserStore()
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const allRoles = computed(() => roleStore.roles)

function isRoleAssigned(roleId: string | number): boolean {
  return props.currentRoles.some((r: Role | string) => {
    if (typeof r === 'string') {
      // If role is a string, compare with role name
      const role = roleStore.roles.find(role => role.name === r)
      return role ? role.id === roleId : false
    }
    return r.id === roleId
  })
}

async function toggleRole(roleId: string | number, assigned: boolean) {
  saving.value = true
  error.value = null
  success.value = null

  try {
    // Convert current roles to IDs
    const currentRoleIds = props.currentRoles.map((r: Role | string) => {
      if (typeof r === 'string') {
        const role = roleStore.roles.find(role => role.name === r)
        return role ? role.id : null
      }
      return r.id
    }).filter((id): id is string | number => id !== null)
    
    let newRoleIds: (string | number)[]

    if (assigned) {
      newRoleIds = [...currentRoleIds, roleId]
    } else {
      newRoleIds = currentRoleIds.filter(id => id !== roleId)
    }

    await userStore.assignRolesToUser(props.userId, newRoleIds)
    success.value = 'Roles updated successfully'
    emit('updated')
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to update roles'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (roleStore.roles.length === 0) {
    await roleStore.fetchRoles()
  }
})
</script>
