<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Users</h2>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <button
            v-if="canCreateUsers"
            @click="openCreateModal"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Register New User
          </button>
        </div>
      </div>

      <div v-if="userStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light">No users found</p>
      </div>

      <div v-else class="bg-white rounded-lg border border-chatgpt-border overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-chatgpt-border">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Roles
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">{{ user.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(role, index) in user.roles || []"
                    :key="typeof role === 'string' ? role : role.id || index"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ typeof role === 'string' ? role : role.name }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-sm text-chatgpt-text-light">
                    No roles
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    v-if="canUpdateUsers"
                    @click="openEditModal(user)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canManageUserRoles"
                    @click="openAssignRoleModal(user)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Assign Role
                  </button>
                  <router-link
                    :to="`/users/${user.id}`"
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

      <!-- Create/Edit User Modal -->
      <BaseModal
        v-model="isUserModalOpen"
        :title="userModalTitle"
        @close="closeUserModal"
      >
        <UserForm
          ref="userFormRef"
          :user="selectedUser"
          :loading="userStore.loading"
          @submit="handleUserFormSubmit"
          @cancel="closeUserModal"
        />
      </BaseModal>

      <!-- Assign Role Modal -->
      <BaseModal
        v-model="isRoleModalOpen"
        :title="`Assign Roles to ${selectedUserForRole?.name || ''}`"
        @close="closeRoleModal"
      >
        <RoleAssignment
          v-if="selectedUserForRole"
          :user-id="selectedUserForRole.id"
          :current-roles="selectedUserForRole.roles || []"
          @updated="handleRoleUpdated"
        />
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import UserForm from '@/components/common/UserForm.vue'
import RoleAssignment from '@/components/common/RoleAssignment.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useUserStore, type User, type CreateUserDto } from '@/app/store/user'

const { canCreateUsers, canUpdateUsers, canUpdateRoles } = usePermissions()
// Managing user roles requires roles.update permission
const canManageUserRoles = canUpdateRoles

const userStore = useUserStore()
const searchQuery = ref('')
const isUserModalOpen = ref(false)
const isRoleModalOpen = ref(false)
const selectedUser = ref<User | null>(null)
const selectedUserForRole = ref<User | null>(null)
const userFormRef = ref<InstanceType<typeof UserForm> | null>(null)

const userModalTitle = computed(() => {
  return selectedUser.value ? 'Edit User' : 'Register New User'
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return userStore.users
  }
  const query = searchQuery.value.toLowerCase()
  return userStore.users.filter(
    (user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.roles?.some(role => {
        const roleName = typeof role === 'string' ? role : role.name
        return roleName.toLowerCase().includes(query)
      })
  )
})

function openCreateModal() {
  selectedUser.value = null
  isUserModalOpen.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  isUserModalOpen.value = true
}

function openAssignRoleModal(user: User) {
  selectedUserForRole.value = user
  isRoleModalOpen.value = true
}

function closeUserModal() {
  isUserModalOpen.value = false
  selectedUser.value = null
  if (userFormRef.value) {
    userFormRef.value.setError('')
  }
}

function closeRoleModal() {
  isRoleModalOpen.value = false
  selectedUserForRole.value = null
}

async function handleUserFormSubmit(data: CreateUserDto | (CreateUserDto & { id: string | number })) {
  try {
    if ('id' in data) {
      // Edit mode
      await userStore.updateUser(data.id, data)
    } else {
      // Create mode
      await userStore.createUser(data)
    }
    await userStore.fetchUsers() // Refresh list
    closeUserModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save user. Please try again.'
    if (userFormRef.value) {
      userFormRef.value.setError(errorMessage)
    }
  }
}

async function handleRoleUpdated() {
  // Refresh user list to show updated roles
  await userStore.fetchUsers()
  // Update selected user if it's still the same
  if (selectedUserForRole.value) {
    const updatedUser = userStore.users.find(u => u.id === selectedUserForRole.value!.id)
    if (updatedUser) {
      selectedUserForRole.value = updatedUser
    }
  }
}

onMounted(() => {
  userStore.fetchUsers()
})
</script>
