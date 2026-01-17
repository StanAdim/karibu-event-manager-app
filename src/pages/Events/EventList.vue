<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Events</h2>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search events..."
            class="px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          />
          <button
            v-if="canWriteEvents"
            @click="openCreateModal"
            class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Create Event
          </button>
        </div>
      </div>

      <div v-if="eventStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading events...</p>
      </div>

      <div v-else-if="filteredEvents.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No events found</p>
        <button
          v-if="canWriteEvents"
          @click="openCreateModal"
          class="text-chatgpt-text hover:underline"
        >
          Create your first event
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
                Start Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                End Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Location
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="event in filteredEvents"
              :key="event.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">{{ event.name }}</div>
                <div v-if="event.description" class="text-sm text-chatgpt-text-light truncate max-w-xs">
                  {{ event.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ formatDate(event.startDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ formatDate(event.endDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-chatgpt-text">
                {{ event.location || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(event.status)"
                >
                  {{ event.status || 'Active' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end">
                  <button
                    @click="openActionMenu(event)"
                    class="p-2 text-chatgpt-text hover:text-chatgpt-text-light hover:bg-gray-100 rounded-lg transition-colors"
                    title="Actions"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Event Modal -->
      <BaseModal
        v-model="isModalOpen"
        :title="modalTitle"
        @close="closeModal"
      >
        <EventForm
          ref="eventFormRef"
          :event="selectedEvent"
          :loading="eventStore.loading"
          @submit="handleFormSubmit"
          @cancel="closeModal"
        />
      </BaseModal>

      <!-- Action Menu Modal -->
      <ActionMenuModal
        v-model="isActionMenuOpen"
        :show-edit="canWriteEvents"
        :show-view="canReadEvents"
        :show-delete="canWriteEvents"
        :show-change-status="canWriteEvents"
        @action="handleActionMenuAction"
      />

      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        v-model="isDeleteConfirmOpen"
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirm-text="Yes, Delete"
        cancel-text="Cancel"
        @confirm="confirmDelete"
      />

      <!-- Change Status Modal -->
      <BaseModal
        v-model="isStatusModalOpen"
        title="Change Event Status"
        size="small"
        @close="closeStatusModal"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-chatgpt-text mb-2">Select Status</label>
            <select
              v-model="selectedStatus"
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="closeStatusModal"
              class="px-4 py-2 border border-chatgpt-border rounded-lg text-chatgpt-text hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              @click="confirmChangeStatus"
              class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            >
              Update Status
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ActionMenuModal from '@/components/ui/ActionMenuModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import EventForm from '@/components/common/EventForm.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useEventStore, type Event, type CreateEventDto } from '@/app/store/event'

const { canReadEvents, canWriteEvents } = usePermissions()

const router = useRouter()
const eventStore = useEventStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const isActionMenuOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const isStatusModalOpen = ref(false)
const selectedEvent = ref<Event | null>(null)
const eventToDelete = ref<Event | null>(null)
const eventToChangeStatus = ref<Event | null>(null)
const selectedStatus = ref<string>('')
const eventFormRef = ref<InstanceType<typeof EventForm> | null>(null)

const modalTitle = computed(() => {
  return selectedEvent.value ? 'Edit Event' : 'Create Event'
})

const filteredEvents = computed(() => {
  if (!searchQuery.value) {
    return eventStore.events
  }
  const query = searchQuery.value.toLowerCase()
  return eventStore.events.filter(
    (event) =>
      event.name.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
  )
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

function openCreateModal() {
  selectedEvent.value = null
  isModalOpen.value = true
}

function openEditModal(event: Event) {
  selectedEvent.value = event
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedEvent.value = null
  if (eventFormRef.value) {
    eventFormRef.value.setError('')
  }
}

async function handleFormSubmit(data: CreateEventDto | (CreateEventDto & { id: string })) {
  try {
    if ('id' in data) {
      // Edit mode
      await eventStore.updateEvent(data.id, data)
    } else {
      // Create mode
      await eventStore.createEvent(data)
    }
    await eventStore.fetchEvents() // Refresh list
    closeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save event. Please try again.'
    if (eventFormRef.value) {
      eventFormRef.value.setError(errorMessage)
    }
  }
}

function openActionMenu(event: Event) {
  selectedEvent.value = event
  isActionMenuOpen.value = true
}

function handleActionMenuAction(action: 'edit' | 'view' | 'delete' | 'change-status') {
  const event = selectedEvent.value
  if (!event) return

  switch (action) {
    case 'edit':
      openEditModal(event)
      break
    case 'view':
      router.push(`/events/${event.id}`)
      break
    case 'delete':
      eventToDelete.value = event
      isDeleteConfirmOpen.value = true
      break
    case 'change-status':
      eventToChangeStatus.value = event
      selectedStatus.value = event.status || 'active'
      isStatusModalOpen.value = true
      break
  }
}

async function confirmDelete() {
  if (!eventToDelete.value) return

  try {
    await eventStore.deleteEvent(eventToDelete.value.id)
    await eventStore.fetchEvents() // Refresh list
    eventToDelete.value = null
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to delete event. Please try again.'
    alert(errorMessage)
  }
}

function closeStatusModal() {
  isStatusModalOpen.value = false
  eventToChangeStatus.value = null
  selectedStatus.value = ''
}

async function confirmChangeStatus() {
  if (!eventToChangeStatus.value) return

  try {
    await eventStore.updateEvent(eventToChangeStatus.value.id, {
      status: selectedStatus.value,
    })
    await eventStore.fetchEvents() // Refresh list
    closeStatusModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to update status. Please try again.'
    alert(errorMessage)
  }
}

onMounted(() => {
  eventStore.fetchEvents()
})
</script>
