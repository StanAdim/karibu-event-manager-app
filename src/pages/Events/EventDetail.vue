<template>
  <AdminLayout>
    <div>
      <div v-if="eventStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading event details...</p>
      </div>

      <div v-else-if="!eventStore.currentEvent" class="text-center py-12">
        <p class="text-chatgpt-text-light mb-4">Event not found</p>
        <router-link
          to="/events"
          class="text-chatgpt-text hover:underline"
        >
          Back to Events
        </router-link>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-chatgpt-text">{{ eventStore.currentEvent.name }}</h2>
          <div class="flex items-center space-x-4">
            <button
              @click="openEditModal"
              class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Edit Event
            </button>
            <router-link
              to="/events"
              class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Back to List
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Event Information</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Description</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ eventStore.currentEvent.description || 'No description provided' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Start Date</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ formatDateTime(eventStore.currentEvent.startDate) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">End Date</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ formatDateTime(eventStore.currentEvent.endDate) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Location</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ eventStore.currentEvent.location || 'Not specified' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Status</dt>
                  <dd>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getStatusClass(eventStore.currentEvent.status)"
                    >
                      {{ eventStore.currentEvent.status || 'Active' }}
                    </span>
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
                  :to="`/participants?eventId=${eventStore.currentEvent.id}`"
                  class="block w-full px-4 py-2 text-center border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
                >
                  View Participants
                </router-link>
                <router-link
                  :to="`/checkpoints?eventId=${eventStore.currentEvent.id}`"
                  class="block w-full px-4 py-2 text-center border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
                >
                  View Checkpoints
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Event Modal -->
      <BaseModal
        v-model="isModalOpen"
        title="Edit Event"
        @close="closeModal"
      >
        <EventForm
          ref="eventFormRef"
          :event="eventStore.currentEvent"
          :loading="eventStore.loading"
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
import EventForm from '@/components/common/EventForm.vue'
import { useEventStore, type CreateEventDto } from '@/app/store/event'

const route = useRoute()
const eventStore = useEventStore()
const isModalOpen = ref(false)
const eventFormRef = ref<InstanceType<typeof EventForm> | null>(null)

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

function openEditModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  if (eventFormRef.value) {
    eventFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateEventDto | (CreateEventDto & { id: string })) {
  if (!('id' in data) || !eventStore.currentEvent) return
  
  try {
    await eventStore.updateEvent(data.id, data)
    await eventStore.fetchEventById(data.id) // Refresh current event
    closeModal()
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to update event. Please try again.'
    if (eventFormRef.value) {
      eventFormRef.value.setError(errorMessage)
    }
  }
}

onMounted(() => {
  const eventId = route.params.id as string
  eventStore.fetchEventById(eventId)
})
</script>
