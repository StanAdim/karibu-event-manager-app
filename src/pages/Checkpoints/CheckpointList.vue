<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Checkpoints</h2>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search checkpoints..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <router-link
            to="/checkpoints/create"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Create Checkpoint
          </router-link>
        </div>
      </div>

      <div v-if="checkpointStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading checkpoints...</p>
      </div>

      <div v-else-if="filteredCheckpoints.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No checkpoints found</p>
        <router-link
          to="/checkpoints/create"
          class="text-chatgpt-text hover:underline"
        >
          Create your first checkpoint
        </router-link>
      </div>

      <div v-else class="bg-white rounded-lg border border-chatgpt-border overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-chatgpt-border">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Event
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Location
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Order
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="checkpoint in filteredCheckpoints"
              :key="checkpoint.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">{{ checkpoint.name }}</div>
                <div v-if="checkpoint.description" class="text-sm text-chatgpt-text-light truncate max-w-xs">
                  {{ checkpoint.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ getEventName(checkpoint.eventId) || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ checkpoint.location || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ checkpoint.order || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link
                  :to="`/checkpoints/${checkpoint.id}`"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { useCheckpointStore } from '@/app/store/checkpoint'
import { useEventStore } from '@/app/store/event'

const route = useRoute()
const checkpointStore = useCheckpointStore()
const eventStore = useEventStore()
const searchQuery = ref('')

const filteredCheckpoints = computed(() => {
  if (!searchQuery.value) {
    return checkpointStore.checkpoints
  }
  const query = searchQuery.value.toLowerCase()
  return checkpointStore.checkpoints.filter(
    (checkpoint) =>
      checkpoint.name.toLowerCase().includes(query) ||
      checkpoint.description?.toLowerCase().includes(query) ||
      checkpoint.location?.toLowerCase().includes(query)
  )
})

function getEventName(eventId: string) {
  const event = eventStore.events.find(e => e.id === eventId)
  return event?.name
}

onMounted(async () => {
  const eventId = route.query.eventId as string | undefined
  await Promise.all([
    eventStore.fetchEvents(),
    checkpointStore.fetchCheckpoints(eventId),
  ])
})
</script>
