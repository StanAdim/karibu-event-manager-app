<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Permissions</h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search permissions..."
          class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        />
      </div>

      <div v-if="permissionStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading permissions...</p>
      </div>

      <div v-else-if="filteredPermissions.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light">No permissions found</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Grouped Permissions -->
        <div
          v-for="(permissions, resource) in groupedPermissions"
          :key="resource"
          class="bg-white rounded-lg border border-chatgpt-border p-6"
        >
          <h3 class="text-lg font-semibold text-chatgpt-text mb-4 capitalize">{{ resource }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="permission in permissions"
              :key="permission.id"
              class="p-3 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="text-sm font-medium text-chatgpt-text">{{ permission.name }}</div>
              <div v-if="permission.description" class="text-xs text-chatgpt-text-light mt-1">
                {{ permission.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { usePermissionStore } from '@/app/store/permission'

const permissionStore = usePermissionStore()
const searchQuery = ref('')

const filteredPermissions = computed(() => {
  if (!searchQuery.value) {
    return permissionStore.permissions
  }
  const query = searchQuery.value.toLowerCase()
  return permissionStore.permissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query)
  )
})

const groupedPermissions = computed(() => {
  const filtered = filteredPermissions.value
  const grouped: Record<string, typeof filtered> = {}
  
  filtered.forEach(permission => {
    const parts = permission.name.split('.')
    const resource = parts[0] || 'other'
    
    if (!grouped[resource]) {
      grouped[resource] = []
    }
    grouped[resource].push(permission)
  })
  
  return grouped
})

onMounted(() => {
  permissionStore.fetchPermissions()
})
</script>
