<template>
  <AdminLayout>
    <div>
      <div v-if="participantStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading participant details...</p>
      </div>

      <div v-else-if="!participantStore.currentParticipant" class="text-center py-12">
        <p class="text-chatgpt-text-light mb-4">Participant not found</p>
        <router-link
          to="/participants"
          class="text-chatgpt-text hover:underline"
        >
          Back to Participants
        </router-link>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-chatgpt-text">
            {{ participantStore.currentParticipant.firstName }} {{ participantStore.currentParticipant.lastName }}
          </h2>
          <div class="flex items-center space-x-4">
            <button
              @click="openEditModal"
              class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Edit Participant
            </button>
            <button
              v-if="!participantStore.currentParticipant.checkedIn"
              @click="handleCheckIn"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Check In
            </button>
            <router-link
              to="/participants"
              class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Back to List
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Participant Information</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Full Name</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ participantStore.currentParticipant.firstName }} {{ participantStore.currentParticipant.lastName }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Email</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ participantStore.currentParticipant.email }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Phone</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ participantStore.currentParticipant.phone || 'Not provided' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Check-in Status</dt>
                  <dd>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="participantStore.currentParticipant.checkedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ participantStore.currentParticipant.checkedIn ? 'Checked In' : 'Not Checked In' }}
                    </span>
                  </dd>
                </div>
                <div v-if="participantStore.currentParticipant.checkInTime">
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Check-in Time</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ formatDateTime(participantStore.currentParticipant.checkInTime) }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <router-link
                  v-if="participantStore.currentParticipant.eventId"
                  :to="`/events/${participantStore.currentParticipant.eventId}`"
                  class="block w-full px-4 py-2 text-center border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
                >
                  View Event
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Participant Modal -->
      <BaseModal
        v-model="isModalOpen"
        title="Edit Participant"
        @close="closeModal"
      >
        <ParticipantForm
          ref="participantFormRef"
          :participant="participantStore.currentParticipant"
          :loading="participantStore.loading"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ParticipantForm from '@/components/common/ParticipantForm.vue'
import { useParticipantStore, type CreateParticipantDto } from '@/app/store/participant'

const route = useRoute()
const participantStore = useParticipantStore()
const isModalOpen = ref(false)
const participantFormRef = ref<InstanceType<typeof ParticipantForm> | null>(null)

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openEditModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  if (participantFormRef.value) {
    participantFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateParticipantDto | (CreateParticipantDto & { id: string })) {
  if (!('id' in data) || !participantStore.currentParticipant) return
  
  const eventId = participantStore.currentParticipant.eventId
  if (!eventId) {
    const errorMessage = 'Event ID is required'
    if (participantFormRef.value) {
      participantFormRef.value.setError(errorMessage)
    }
    return
  }
  
  try {
    await participantStore.updateParticipant(eventId, data.id, data)
    await participantStore.fetchParticipantById(eventId, data.id) // Refresh current participant
    closeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to update participant. Please try again.'
    if (participantFormRef.value) {
      participantFormRef.value.setError(errorMessage)
    }
  }
}

onMounted(() => {
  const participantId = route.params.id as string
  const eventId = route.query.eventId as string | undefined
  
  if (!eventId && participantStore.currentParticipant?.eventId) {
    participantStore.fetchParticipantById(participantStore.currentParticipant.eventId, participantId)
  } else if (eventId) {
    participantStore.fetchParticipantById(eventId, participantId)
  }
})
</script>
