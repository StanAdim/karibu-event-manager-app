<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Participants</h2>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search participants..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <router-link
            to="/participants/create"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Add Participant
          </router-link>
        </div>
      </div>

      <div v-if="participantStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading participants...</p>
      </div>

      <div v-else-if="filteredParticipants.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No participants found</p>
        <router-link
          to="/participants/create"
          class="text-chatgpt-text hover:underline"
        >
          Add your first participant
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
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Phone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Check-in Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="participant in filteredParticipants"
              :key="participant.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">
                  {{ participant.firstName }} {{ participant.lastName }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ participant.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ participant.phone || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="participant.checkedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ participant.checkedIn ? 'Checked In' : 'Not Checked In' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    v-if="!participant.checkedIn"
                    @click="handleCheckIn(participant.id)"
                    class="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Check In
                  </button>
                  <router-link
                    :to="`/participants/${participant.id}`"
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
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { useParticipantStore } from '@/app/store/participant'

const route = useRoute()
const participantStore = useParticipantStore()
const searchQuery = ref('')

const filteredParticipants = computed(() => {
  if (!searchQuery.value) {
    return participantStore.participants
  }
  const query = searchQuery.value.toLowerCase()
  return participantStore.participants.filter(
    (participant) =>
      participant.firstName.toLowerCase().includes(query) ||
      participant.lastName.toLowerCase().includes(query) ||
      participant.email.toLowerCase().includes(query) ||
      participant.phone?.toLowerCase().includes(query)
  )
})

async function handleCheckIn(id: string) {
  try {
    await participantStore.checkInParticipant(id)
  } catch (error) {
    console.error('Failed to check in participant:', error)
  }
}

onMounted(() => {
  const eventId = route.query.eventId as string | undefined
  participantStore.fetchParticipants(eventId)
})
</script>
