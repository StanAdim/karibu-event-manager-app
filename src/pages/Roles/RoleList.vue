<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Roles</h2>
        <button
          v-if="canCreateRoles"
          @click="openCreateModal"
          class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          Add New Role
        </button>
      </div>

      <div v-if="roleStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading roles...</p>
      </div>

      <div v-else-if="roleStore.roles.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light">No roles found</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-chatgpt-border overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-chatgpt-border">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Permissions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Users
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="role in roleStore.roles"
              :key="role.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">{{ role.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-chatgpt-text">
                  {{ role.permissions_count || role.permissions?.length || 0 }} permissions
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-chatgpt-text">
                  {{ role.users_count || 0 }} users
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    v-if="canUpdateRoles"
                    @click="openEditModal(role)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canUpdateRoles"
                    @click="openAssignPermissionsModal(role)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Permissions
                  </button>
                  <router-link
                    :to="`/roles/${role.id}`"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    View
                  </router-link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Role Modal -->
      <BaseModal
        v-model="isRoleModalOpen"
        :title="roleModalTitle"
        @close="closeRoleModal"
      >
        <RoleForm
          ref="roleFormRef"
          :role="selectedRole"
          :loading="roleStore.loading"
          @submit="handleRoleFormSubmit"
          @cancel="closeRoleModal"
        />
      </BaseModal>

      <!-- Assign Permissions Modal -->
      <BaseModal
        v-model="isPermissionsModalOpen"
        :title="`Assign Permissions to ${selectedRoleForPermissions?.name || ''}`"
        @close="closePermissionsModal"
      >
        <RolePermissionAssignment
          v-if="selectedRoleForPermissions"
          :role-id="selectedRoleForPermissions.id"
          :current-permissions="selectedRoleForPermissions.permissions || []"
          @updated="handlePermissionsUpdated"
        />
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import RoleForm from '@/components/common/RoleForm.vue'
import RolePermissionAssignment from '@/components/common/RolePermissionAssignment.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useRoleStore, type Role, type CreateRoleDto } from '@/app/store/role'

const { canUpdateRoles } = usePermissions()
// Creating roles requires roles.update permission
const canCreateRoles = canUpdateRoles

const roleStore = useRoleStore()
const isRoleModalOpen = ref(false)
const isPermissionsModalOpen = ref(false)
const selectedRole = ref<Role | null>(null)
const selectedRoleForPermissions = ref<Role | null>(null)
const roleFormRef = ref<InstanceType<typeof RoleForm> | null>(null)

const roleModalTitle = computed(() => {
  return selectedRole.value ? 'Edit Role' : 'Add New Role'
})

function openCreateModal() {
  selectedRole.value = null
  isRoleModalOpen.value = true
}

function openEditModal(role: Role) {
  selectedRole.value = role
  isRoleModalOpen.value = true
}

function openAssignPermissionsModal(role: Role) {
  selectedRoleForPermissions.value = role
  isPermissionsModalOpen.value = true
}

function closeRoleModal() {
  isRoleModalOpen.value = false
  selectedRole.value = null
  if (roleFormRef.value) {
    roleFormRef.value.setError('')
  }
}

function closePermissionsModal() {
  isPermissionsModalOpen.value = false
  selectedRoleForPermissions.value = null
}

async function handleRoleFormSubmit(data: CreateRoleDto | (CreateRoleDto & { id: string | number })) {
  try {
    if ('id' in data) {
      // Edit mode
      await roleStore.updateRole(data.id, data)
    } else {
      // Create mode
      await roleStore.createRole(data)
    }
    await roleStore.fetchRoles() // Refresh list
    closeRoleModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save role. Please try again.'
    if (roleFormRef.value) {
      roleFormRef.value.setError(errorMessage)
    }
  }
}

async function handlePermissionsUpdated() {
  // Refresh role list to show updated permission counts
  await roleStore.fetchRoles()
  // Update selected role if it's still the same
  if (selectedRoleForPermissions.value) {
    const updatedRole = roleStore.roles.find(r => r.id === selectedRoleForPermissions.value!.id)
    if (updatedRole) {
      selectedRoleForPermissions.value = updatedRole
    }
  }
}

onMounted(() => {
  roleStore.fetchRoles()
})
</script>
