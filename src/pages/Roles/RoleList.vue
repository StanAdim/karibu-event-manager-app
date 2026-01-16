<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Roles</h2>
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
                <router-link
                  :to="`/roles/${role.id}`"
                  class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                >
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { useRoleStore } from '@/app/store/role'

const roleStore = useRoleStore()

onMounted(() => {
  roleStore.fetchRoles()
})
</script>
