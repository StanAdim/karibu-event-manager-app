<template>
  <AdminLayout>
    <div>
      <div v-if="roleStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading role details...</p>
      </div>

      <div v-else-if="!roleStore.currentRole" class="text-center py-12">
        <p class="text-chatgpt-text-light mb-4">Role not found</p>
        <router-link
          to="/roles"
          class="text-chatgpt-text hover:underline"
        >
          Back to Roles
        </router-link>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-chatgpt-text">{{ roleStore.currentRole.name }}</h2>
          <router-link
            to="/roles"
            class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
          >
            Back to List
          </router-link>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Role Information -->
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Role Information</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Name</dt>
                  <dd class="text-sm text-chatgpt-text">{{ roleStore.currentRole.name }}</dd>
                </div>
                <div v-if="roleStore.currentRole.guard_name">
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Guard</dt>
                  <dd class="text-sm text-chatgpt-text">{{ roleStore.currentRole.guard_name }}</dd>
                </div>
              </dl>
            </div>

            <!-- Permissions Assignment -->
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Permissions</h3>
              <RolePermissionAssignment
                :role-id="roleStore.currentRole.id"
                :current-permissions="roleStore.currentRole.permissions || []"
                @updated="handleRoleUpdated"
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
import RolePermissionAssignment from '@/components/common/RolePermissionAssignment.vue'
import { useRoleStore } from '@/app/store/role'

const route = useRoute()
const roleStore = useRoleStore()

async function handleRoleUpdated() {
  const roleId = route.params.id as string
  await roleStore.fetchRoleById(roleId)
}

onMounted(() => {
  const roleId = route.params.id as string
  roleStore.fetchRoleById(roleId)
})
</script>
