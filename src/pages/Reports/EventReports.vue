<template>
  <AdminLayout>
    <div>
      <h2 class="text-2xl font-semibold text-chatgpt-text mb-6">Event Reports</h2>

      <div v-if="loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading reports...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg border border-chatgpt-border p-6">
            <p class="text-sm text-chatgpt-text-light mb-1">Total Events</p>
            <p class="text-2xl font-semibold text-chatgpt-text">{{ eventStore.events.length }}</p>
          </div>
          <div class="bg-white rounded-lg border border-chatgpt-border p-6">
            <p class="text-sm text-chatgpt-text-light mb-1">Total Participants</p>
            <p class="text-2xl font-semibold text-chatgpt-text">{{ participantStore.participants.length }}</p>
          </div>
          <div class="bg-white rounded-lg border border-chatgpt-border p-6">
            <p class="text-sm text-chatgpt-text-light mb-1">Checked In</p>
            <p class="text-2xl font-semibold text-green-600">
              {{ checkedInCount }}
            </p>
          </div>
          <div class="bg-white rounded-lg border border-chatgpt-border p-6">
            <p class="text-sm text-chatgpt-text-light mb-1">Total Checkpoints</p>
            <p class="text-2xl font-semibold text-chatgpt-text">{{ checkpointStore.checkpoints.length }}</p>
          </div>
        </div>

        <!-- Events Report -->
        <div class="bg-white rounded-lg border border-chatgpt-border p-6">
          <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Events Overview</h3>
          <div v-if="eventStore.events.length === 0" class="text-center py-8 text-chatgpt-text-light">
            No events found
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-chatgpt-border">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                    Event Name
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                    Start Date
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                    Participants
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                    Checkpoints
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-chatgpt-border">
                <tr
                  v-for="event in eventStore.events"
                  :key="event.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm font-medium text-chatgpt-text">
                    {{ event.name }}
                  </td>
                  <td class="px-4 py-3 text-sm text-chatgpt-text">
                    {{ formatDate(event.startDate) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-chatgpt-text">
                    {{ getEventParticipantsCount(event.id) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-chatgpt-text">
                    {{ getEventCheckpointsCount(event.id) }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getStatusClass(event.status)"
                    >
                      {{ event.status || 'Active' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Check-in Statistics -->
        <div class="bg-white rounded-lg border border-chatgpt-border p-6">
          <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Check-in Statistics</h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-chatgpt-text">Checked In</span>
                <span class="text-sm font-medium text-chatgpt-text">
                  {{ checkedInCount }} / {{ participantStore.participants.length }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-600 h-2 rounded-full transition-all"
                  :style="{ width: `${checkInPercentage}%` }"
                />
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
import { useEventStore } from '@/app/store/event'
import { useParticipantStore } from '@/app/store/participant'
import { useCheckpointStore } from '@/app/store/checkpoint'

const eventStore = useEventStore()
const participantStore = useParticipantStore()
const checkpointStore = useCheckpointStore()

const loading = ref(false)

const checkedInCount = computed(() => {
  return participantStore.participants.filter(p => p.checkedIn).length
})

const checkInPercentage = computed(() => {
  if (participantStore.participants.length === 0) return 0
  return Math.round((checkedInCount.value / participantStore.participants.length) * 100)
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getEventParticipantsCount(eventId: string) {
  return participantStore.participants.filter(p => p.eventId === eventId).length
}

function getEventCheckpointsCount(eventId: string) {
  return checkpointStore.checkpoints.filter(c => c.eventId === eventId).length
}

function getStatusClass(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      eventStore.fetchEvents(),
      participantStore.fetchParticipants(),
      checkpointStore.fetchCheckpoints(),
    ])
  } catch (error) {
    console.error('Failed to load reports:', error)
  } finally {
    loading.value = false
  }
})
</script>
