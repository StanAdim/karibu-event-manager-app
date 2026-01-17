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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
            <div
              v-for="permission in permissions"
              :key="permission.id"
              class="p-3 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="text-sm font-medium text-chatgpt-text">
                {{ permission.display_name || permission.name }}
              </div>
<!--              <div v-if="permission.description" class="text-xs text-chatgpt-text-light mt-1">-->
<!--                {{ permission.description }}-->
<!--              </div>-->
              <div v-if="permission.action" class="mt-2">
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                  {{ permission.action }}
                </span>
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
  // Ensure permissions is always an array
  const permissions = Array.isArray(permissionStore.permissions) 
    ? permissionStore.permissions 
    : []
  
  if (!searchQuery.value) {
    return permissions
  }
  
  const query = searchQuery.value.toLowerCase()
  return permissions.filter(
    (permission) =>
      permission.name?.toLowerCase().includes(query) ||
      permission.display_name?.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query) ||
      permission.resource?.toLowerCase().includes(query) ||
      permission.action?.toLowerCase().includes(query)
  )
})

const groupedPermissions = computed(() => {
  const filtered = filteredPermissions.value
  
  // Ensure filtered is an array
  if (!Array.isArray(filtered)) {
    return {}
  }
  
  const grouped: Record<string, typeof filtered> = {}
  
  filtered.forEach(permission => {
    // Use resource field if available, otherwise parse from name
    let resource: string
    if (permission.resource) {
      resource = permission.resource
    } else {
      // Handle both colon (events:read) and dot (events.read) notation
      const parts = permission.name?.split(/[:.]/) || []
      resource = parts[0] || 'other'
    }
    
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
