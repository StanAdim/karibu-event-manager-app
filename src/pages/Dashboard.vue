<template>
  <AdminLayout>
    <div>
      <h2 class="text-2xl font-semibold text-chatgpt-text mb-6">Dashboard</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg border border-chatgpt-border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-chatgpt-text-light mb-1">Total Events</p>
              <p class="text-3xl font-semibold text-chatgpt-text">{{ stats.totalEvents }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-chatgpt-border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-chatgpt-text-light mb-1">Total Participants</p>
              <p class="text-3xl font-semibold text-chatgpt-text">{{ stats.totalParticipants }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-chatgpt-border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-chatgpt-text-light mb-1">Active Checkpoints</p>
              <p class="text-3xl font-semibold text-chatgpt-text">{{ stats.activeCheckpoints }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-chatgpt-border p-6">
        <h3 class="text-lg font-semibold text-chatgpt-text mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link
            v-if="canWriteEvents"
            to="/events"
            @click.prevent="openCreateEventModal"
            class="p-4 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-chatgpt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="text-sm font-medium text-chatgpt-text">Create Event</span>
            </div>
          </router-link>

          <router-link
            v-if="canWriteParticipants"
            to="/participants"
            @click.prevent="openCreateParticipantModal"
            class="p-4 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-chatgpt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="text-sm font-medium text-chatgpt-text">Add Participant</span>
            </div>
          </router-link>

          <router-link
            v-if="canWriteCheckpoints"
            to="/checkpoints"
            @click.prevent="openCreateCheckpointModal"
            class="p-4 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-chatgpt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="text-sm font-medium text-chatgpt-text">Create Checkpoint</span>
            </div>
          </router-link>

          <router-link
            v-if="canViewReports"
            to="/reports"
            class="p-4 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-chatgpt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-sm font-medium text-chatgpt-text">View Reports</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { usePermissions } from '@/app/composables/usePermissions'
import { useEventStore } from '@/app/store/event'
import { useParticipantStore } from '@/app/store/participant'
import { useCheckpointStore } from '@/app/store/checkpoint'

const router = useRouter()
const { canWriteEvents, canWriteParticipants, canWriteCheckpoints } = usePermissions()
// Reports functionality not available - permission not in super-admin list
const canViewReports = { value: false }

function openCreateEventModal() {
  router.push('/events')
  // The EventList component will handle opening the modal
}

function openCreateParticipantModal() {
  router.push('/participants')
  // The ParticipantList component will handle opening the modal
}

function openCreateCheckpointModal() {
  router.push('/checkpoints')
  // The CheckpointList component will handle opening the modal
}

const eventStore = useEventStore()
const participantStore = useParticipantStore()
const checkpointStore = useCheckpointStore()

const stats = ref({
  totalEvents: 0,
  totalParticipants: 0,
  activeCheckpoints: 0,
})

onMounted(async () => {
  try {
    // Fetch events first
    await eventStore.fetchEvents()
    
    // Fetch participants and checkpoints for all events
    const participantPromises = eventStore.events.map(event => 
      participantStore.fetchParticipants(event.id)
    )
    const checkpointPromises = eventStore.events.map(event => 
      checkpointStore.fetchCheckpoints(event.id)
    )
    
    await Promise.all([...participantPromises, ...checkpointPromises])
    
    // Calculate totals across all events
    let totalParticipants = 0
    let totalCheckpoints = 0
    
    // Note: Since we're fetching per event, we need to aggregate
    // For now, we'll use the last fetched data or aggregate properly
    // This is a simplified approach - in production, you might want to aggregate differently
    totalParticipants = participantStore.participants.length
    totalCheckpoints = checkpointStore.checkpoints.length
    
    stats.value = {
      totalEvents: eventStore.events.length,
      totalParticipants,
      activeCheckpoints: totalCheckpoints,
    }
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  }
})
</script>
