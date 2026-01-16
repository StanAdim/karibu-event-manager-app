<template>
  <AdminLayout>
    <div>
      <div v-if="checkpointStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading checkpoint details...</p>
      </div>

      <div v-else-if="!checkpointStore.currentCheckpoint" class="text-center py-12">
        <p class="text-chatgpt-text-light mb-4">Checkpoint not found</p>
        <router-link
          to="/checkpoints"
          class="text-chatgpt-text hover:underline"
        >
          Back to Checkpoints
        </router-link>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-chatgpt-text">{{ checkpointStore.currentCheckpoint.name }}</h2>
          <div class="flex items-center space-x-4">
            <button
              @click="openEditModal"
              class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Edit Checkpoint
            </button>
            <router-link
              to="/checkpoints"
              class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Back to List
            </router-link>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-lg border border-chatgpt-border p-6">
              <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Checkpoint Information</h3>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Description</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ checkpointStore.currentCheckpoint.description || 'No description provided' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Event</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ getEventName(checkpointStore.currentCheckpoint.eventId) || 'Not specified' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Location</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ checkpointStore.currentCheckpoint.location || 'Not specified' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-chatgpt-text-light mb-1">Order</dt>
                  <dd class="text-sm text-chatgpt-text">
                    {{ checkpointStore.currentCheckpoint.order || 'Not specified' }}
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
                  :to="`/events/${checkpointStore.currentCheckpoint.eventId}`"
                  class="block w-full px-4 py-2 text-center border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
                >
                  View Event
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Checkpoint Modal -->
      <BaseModal
        v-model="isModalOpen"
        title="Edit Checkpoint"
        @close="closeModal"
      >
        <CheckpointForm
          ref="checkpointFormRef"
          :checkpoint="checkpointStore.currentCheckpoint"
          :loading="checkpointStore.loading"
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
import CheckpointForm from '@/components/common/CheckpointForm.vue'
import { useCheckpointStore, type CreateCheckpointDto } from '@/app/store/checkpoint'
import { useEventStore } from '@/app/store/event'

const route = useRoute()
const checkpointStore = useCheckpointStore()
const eventStore = useEventStore()
const isModalOpen = ref(false)
const checkpointFormRef = ref<InstanceType<typeof CheckpointForm> | null>(null)

function getEventName(eventId: string) {
  const event = eventStore.events.find(e => e.id === eventId)
  return event?.name
}

function openEditModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  if (checkpointFormRef.value) {
    checkpointFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateCheckpointDto | (CreateCheckpointDto & { id: string })) {
  if (!('id' in data) || !checkpointStore.currentCheckpoint) return
  
  const eventId = checkpointStore.currentCheckpoint.eventId
  if (!eventId) {
    const errorMessage = 'Event ID is required'
    if (checkpointFormRef.value) {
      checkpointFormRef.value.setError(errorMessage)
    }
    return
  }
  
  try {
    await checkpointStore.updateCheckpoint(eventId, data.id, data)
    await checkpointStore.fetchCheckpointById(eventId, data.id) // Refresh current checkpoint
    closeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to update checkpoint. Please try again.'
    if (checkpointFormRef.value) {
      checkpointFormRef.value.setError(errorMessage)
    }
  }
}

onMounted(async () => {
  const checkpointId = route.params.id as string
  const eventId = route.query.eventId as string | undefined
  
  await eventStore.fetchEvents()
  
  if (eventId) {
    await checkpointStore.fetchCheckpointById(eventId, checkpointId)
  } else if (checkpointStore.currentCheckpoint?.eventId) {
    await checkpointStore.fetchCheckpointById(checkpointStore.currentCheckpoint.eventId, checkpointId)
  }
})
</script>
