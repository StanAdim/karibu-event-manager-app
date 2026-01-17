<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-chatgpt-text">Participants</h2>
          <p v-if="eventStore.currentEvent" class="text-sm text-chatgpt-text-light mt-1">
            Event: {{ eventStore.currentEvent.name }}
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search participants..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <button
            v-if="canWriteParticipants"
            @click="openCreateModal"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Add Participant
          </button>
          <router-link
            :to="`/events/${eventId}`"
            class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
          >
            Back to Event
          </router-link>
        </div>
      </div>

      <div v-if="participantStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading participants...</p>
      </div>

      <div v-else-if="filteredParticipants.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No participants found for this event</p>
        <button
          v-if="canWriteParticipants"
          @click="openCreateModal"
          class="text-chatgpt-text hover:underline"
        >
          Add your first participant
        </button>
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
                  {{ participant.full_name }}
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
                    v-if="canWriteParticipants"
                    @click="openEditModal(participant)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Edit
                  </button>
                  <router-link
                    v-if="canReadParticipants"
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

      <!-- Create/Edit Participant Modal -->
      <BaseModal
        v-model="isModalOpen"
        :title="modalTitle"
        @close="closeModal"
      >
        <ParticipantForm
          ref="participantFormRef"
          :participant="selectedParticipant"
          :loading="participantStore.loading"
          :initial-event-id="eventId"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ParticipantForm from '@/components/common/ParticipantForm.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useParticipantStore, type Participant, type CreateParticipantDto } from '@/app/store/participant'
import { useEventStore } from '@/app/store/event'

const { canReadParticipants, canWriteParticipants } = usePermissions()

const route = useRoute()
const participantStore = useParticipantStore()
const eventStore = useEventStore()
const eventId = computed(() => route.params.eventId as string)
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedParticipant = ref<Participant | null>(null)
const participantFormRef = ref<InstanceType<typeof ParticipantForm> | null>(null)

const modalTitle = computed(() => {
  return selectedParticipant.value ? 'Edit Participant' : 'Add Participant'
})

const filteredParticipants = computed(() => {
  if (!searchQuery.value) {
    return participantStore.participants
  }
  const query = searchQuery.value.toLowerCase()
  return participantStore.participants.filter(
    (participant) =>
      (participant.firstName || '').toLowerCase().includes(query) ||
      (participant.lastName || '').toLowerCase().includes(query) ||
      (participant.email || '').toLowerCase().includes(query) ||
      (participant.phone || '').toLowerCase().includes(query)
  )
})

function openCreateModal() {
  selectedParticipant.value = null
  isModalOpen.value = true
}

function openEditModal(participant: Participant) {
  selectedParticipant.value = participant
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedParticipant.value = null
  if (participantFormRef.value) {
    participantFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateParticipantDto | (CreateParticipantDto & { id: string })) {
  // Use eventId from route
  const finalEventId = data.eventId || eventId.value
  
  if (!finalEventId) {
    const errorMessage = 'Event ID is required'
    if (participantFormRef.value) {
      participantFormRef.value.setError(errorMessage)
    }
    return
  }

  try {
    if ('id' in data) {
      // Edit mode - ensure eventId is included
      const updateData = { ...data, eventId: finalEventId }
      await participantStore.updateParticipant(finalEventId, data.id, updateData)
    } else {
      // Create mode - ensure eventId is included
      const createData = { ...data, eventId: finalEventId }
      await participantStore.createParticipant(createData)
    }
    await participantStore.fetchParticipants(eventId.value) // Refresh list for this event
    closeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save participant. Please try again.'
    if (participantFormRef.value) {
      participantFormRef.value.setError(errorMessage)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    eventStore.fetchEventById(eventId.value),
    participantStore.fetchParticipants(eventId.value)
  ])
})
</script>
