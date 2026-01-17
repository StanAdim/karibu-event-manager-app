<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-chatgpt-text">Checkpoints</h2>
          <p v-if="eventStore.currentEvent" class="text-sm text-chatgpt-text-light mt-1">
            Event: {{ eventStore.currentEvent.name }}
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search checkpoints..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <button
            v-if="canWriteCheckpoints"
            @click="openCreateModal"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Create Checkpoint
          </button>
          <router-link
            :to="`/events/${eventId}`"
            class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
          >
            Back to Event
          </router-link>
        </div>
      </div>

      <div v-if="checkpointStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading checkpoints...</p>
      </div>

      <div v-else-if="filteredCheckpoints.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No checkpoints found for this event</p>
        <button
          v-if="canWriteCheckpoints"
          @click="openCreateModal"
          class="text-chatgpt-text hover:underline"
        >
          Create your first checkpoint
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
                {{ checkpoint.location || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ checkpoint.order || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    v-if="canWriteCheckpoints"
                    @click="openEditModal(checkpoint)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Edit
                  </button>
                  <router-link
                    v-if="canReadCheckpoints"
                    :to="`/checkpoints/${checkpoint.id}`"
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

      <!-- Create/Edit Checkpoint Modal -->
      <BaseModal
        v-model="isModalOpen"
        :title="modalTitle"
        @close="closeModal"
      >
        <CheckpointForm
          ref="checkpointFormRef"
          :checkpoint="selectedCheckpoint"
          :loading="checkpointStore.loading"
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
import CheckpointForm from '@/components/common/CheckpointForm.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useCheckpointStore, type Checkpoint, type CreateCheckpointDto } from '@/app/store/checkpoint'
import { useEventStore } from '@/app/store/event'

const { canReadCheckpoints, canWriteCheckpoints } = usePermissions()

const route = useRoute()
const checkpointStore = useCheckpointStore()
const eventStore = useEventStore()
const eventId = computed(() => route.params.eventId as string)
const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedCheckpoint = ref<Checkpoint | null>(null)
const checkpointFormRef = ref<InstanceType<typeof CheckpointForm> | null>(null)

const modalTitle = computed(() => {
  return selectedCheckpoint.value ? 'Edit Checkpoint' : 'Create Checkpoint'
})

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

function openCreateModal() {
  selectedCheckpoint.value = null
  isModalOpen.value = true
}

function openEditModal(checkpoint: Checkpoint) {
  selectedCheckpoint.value = checkpoint
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedCheckpoint.value = null
  if (checkpointFormRef.value) {
    checkpointFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateCheckpointDto | (CreateCheckpointDto & { id: string })) {
  // Use eventId from route
  const finalEventId = data.eventId || eventId.value
  
  if (!finalEventId) {
    const errorMessage = 'Event ID is required'
    if (checkpointFormRef.value) {
      checkpointFormRef.value.setError(errorMessage)
    }
    return
  }

  try {
    if ('id' in data) {
      // Edit mode
      await checkpointStore.updateCheckpoint(finalEventId, data.id, data)
    } else {
      // Create mode - ensure eventId is included
      const createData = { ...data, eventId: finalEventId }
      await checkpointStore.createCheckpoint(createData)
    }
    await checkpointStore.fetchCheckpoints(eventId.value) // Refresh list for this event
    closeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save checkpoint. Please try again.'
    if (checkpointFormRef.value) {
      checkpointFormRef.value.setError(errorMessage)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    eventStore.fetchEventById(eventId.value),
    checkpointStore.fetchCheckpoints(eventId.value)
  ])
})
</script>
