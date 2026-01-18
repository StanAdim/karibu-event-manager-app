<template>
  <AdminLayout>
    <div>
      <div v-if="userStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading user details...</p>
      </div>

      <div v-else-if="!userStore.currentUser" class="text-center py-12">
        <p class="text-chatgpt-text-light mb-4">User not found</p>
        <router-link
          to="/users"
          class="text-chatgpt-text hover:underline"
        >
          Back to Users
        </router-link>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-chatgpt-text">{{ userStore.currentUser.name }}</h2>
          <router-link
            to="/users"
            class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
          >
            Back to List
          </router-link>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- User Information -->
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">User Information</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Name</dt>
                  <dd class="text-sm text-chatgpt-text">{{ userStore.currentUser.name }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Email</dt>
                  <dd class="text-sm text-chatgpt-text">{{ userStore.currentUser.email }}</dd>
                </div>
              </dl>
            </div>

            <!-- Roles Assignment -->
            <div v-if="canManageUserRoles" class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Roles</h3>
              <RoleAssignment
                :user-id="userStore.currentUser.id"
                :current-roles="userStore.currentUser.roles || []"
                @updated="handleUserUpdated"
              />
            </div>

            <!-- Direct Permissions Assignment -->
            <div v-if="canManageUserPermissions" class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Direct Permissions</h3>
              <PermissionAssignment
                :user-id="userStore.currentUser.id"
                :current-permissions="userStore.currentUser.permissions || []"
                @updated="handleUserUpdated"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import RoleAssignment from '@/components/common/RoleAssignment.vue'
import PermissionAssignment from '@/components/common/PermissionAssignment.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useUserStore } from '@/app/store/user'

const { canUpdateRoles, canUpdateUsers } = usePermissions()
// Managing user roles requires roles.update permission
const canManageUserRoles = canUpdateRoles
// Managing user permissions requires users.update permission
const canManageUserPermissions = canUpdateUsers

const route = useRoute()
const userStore = useUserStore()

async function handleUserUpdated() {
  const userId = route.params.id as string
  await userStore.fetchUserById(userId)
}

onMounted(() => {
  const userId = route.params.id as string
  userStore.fetchUserById(userId)
})
</script>
