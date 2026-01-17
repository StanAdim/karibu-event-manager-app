<template>
  <AdminLayout>
    <div>
      <!-- Loading State -->
      <div v-if="programmeStore.loading && !programmeStore.currentDay" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="text-chatgpt-text-light mt-4">Loading programme...</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Programme Overview Dashboard -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold text-chatgpt-text mb-2">
                {{ eventStore.currentEvent?.name || 'Event Programme' }}
              </h1>
              <p v-if="eventStore.currentEvent" class="text-chatgpt-text-light">
                {{ formatDateRange(eventStore.currentEvent.startDate, eventStore.currentEvent.endDate) }}
                <span v-if="eventStore.currentEvent.location"> • {{ eventStore.currentEvent.location }}</span>
              </p>
            </div>
            <router-link
              :to="`/events/${eventId}`"
              class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Back to Event
            </router-link>
          </div>

          <!-- Programme Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-lg border border-chatgpt-border p-4">
              <div class="text-2xl font-bold text-chatgpt-text">
                {{ programmeStore.programmeDays.length }}
              </div>
              <div class="text-sm text-chatgpt-text-light mt-1">Programme Days</div>
            </div>
            <div class="bg-white rounded-lg border border-chatgpt-border p-4">
              <div class="text-2xl font-bold text-chatgpt-text">
                {{ totalSessions }}
              </div>
              <div class="text-sm text-chatgpt-text-light mt-1">Total Sessions</div>
            </div>
            <div class="bg-white rounded-lg border border-chatgpt-border p-4">
              <div class="text-2xl font-bold text-chatgpt-text">
                {{ currentDaySessions }}
              </div>
              <div class="text-sm text-chatgpt-text-light mt-1">Today's Sessions</div>
            </div>
            <div class="bg-white rounded-lg border border-chatgpt-border p-4">
              <div class="flex items-center">
                <div class="flex-1">
                  <div class="text-sm text-chatgpt-text-light mb-1">Completion</div>
                  <div class="text-lg font-semibold text-chatgpt-text">
                    {{ completionPercentage }}%
                  </div>
                </div>
                <div class="w-16 h-16">
                  <svg class="transform -rotate-90 w-16 h-16">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      stroke-width="6"
                      fill="none"
                      class="text-chatgpt-border"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      stroke-width="6"
                      fill="none"
                      :stroke-dasharray="`${completionPercentage * 1.76} 176`"
                      class="text-indigo-600 transition-all duration-300"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Day Tabs -->
        <div v-if="programmeStore.programmeDays.length > 0" class="mb-6">
          <DayTabs
            :days="programmeStore.programmeDays"
            :active-day-id="programmeStore.currentDay?.id"
            @select="handleDaySelect"
          />
        </div>

        <!-- Programme Timeline -->
        <div v-if="programmeStore.currentDay" class="relative">
          <ProgrammeTimeline
            :current-day="programmeStore.currentDay"
            :sessions="programmeStore.sessions"
            :loading="programmeStore.loading"
            :draggable="canWriteProgramme"
            @session-click="handleSessionClick"
          />

          <!-- Add Session FAB -->
          <button
            v-if="canWriteProgramme"
            @click="openSessionModal"
            class="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center z-30"
            title="Add Session"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- No Days State -->
        <div v-else class="text-center py-12 bg-white rounded-lg border border-chatgpt-border">
          <svg
            class="mx-auto h-12 w-12 text-chatgpt-text-light mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p class="text-chatgpt-text-light mb-2">No programme days found</p>
          <p class="text-sm text-chatgpt-text-light">Programme days need to be created first</p>
        </div>
      </div>

      <!-- Session Modal -->
      <BaseModal
        v-model="isSessionModalOpen"
        :title="selectedSession ? 'Edit Session' : 'Create New Session'"
        size="large"
        @close="closeSessionModal"
      >
        <SessionForm
          v-if="programmeStore.currentDay"
          ref="sessionFormRef"
          :session="selectedSession"
          :programme-day-id="programmeStore.currentDay.id"
          :loading="programmeStore.loading"
          @submit="handleSessionSubmit"
          @cancel="closeSessionModal"
        />
      </BaseModal>

      <!-- Delete Confirmation Modal -->
      <ConfirmModal
        v-model="isDeleteModalOpen"
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleSessionDelete"
        @cancel="isDeleteModalOpen = false"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import DayTabs from '@/components/programme/DayTabs.vue'
import ProgrammeTimeline from '@/components/programme/ProgrammeTimeline.vue'
import SessionForm from '@/components/programme/SessionForm.vue'
import { useEventStore } from '@/app/store/event'
import { useProgrammeStore, type CreateSessionDto, type UpdateSessionDto, type Session } from '@/app/store/programme'
import { usePermissions } from '@/app/composables/usePermissions'

const route = useRoute()
const router = useRouter()
const { canWriteProgramme } = usePermissions()

const eventId = computed(() => route.params.eventId as string)
const eventStore = useEventStore()
const programmeStore = useProgrammeStore()

const isSessionModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedSession = ref<Session | null>(null)
const sessionFormRef = ref<InstanceType<typeof SessionForm> | null>(null)

const totalSessions = computed(() => {
  return programmeStore.programmeDays.reduce((total: number, day) => {
    return total + (day.sessions?.length || 0)
  }, 0)
})

const currentDaySessions = computed(() => {
  return programmeStore.currentDay?.sessions?.length || programmeStore.sessions.length || 0
})

const completionPercentage = computed(() => {
  // Simple calculation: assume 8 sessions per day is "complete"
  const expectedSessionsPerDay = 8
  const totalExpected = programmeStore.programmeDays.length * expectedSessionsPerDay
  if (totalExpected === 0) return 0
  return Math.min(100, Math.round((totalSessions.value / totalExpected) * 100))
})

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function handleDaySelect(day: any) {
  programmeStore.setCurrentDay(day)
}

function openSessionModal(session?: Session) {
  selectedSession.value = session || null
  isSessionModalOpen.value = true
}

function closeSessionModal() {
  isSessionModalOpen.value = false
  selectedSession.value = null
  if (sessionFormRef.value) {
    sessionFormRef.value.setError('')
  }
}

function handleSessionClick(session: Session) {
  if (canWriteProgramme.value) {
    openSessionModal(session)
  }
}

async function handleSessionSubmit(data: CreateSessionDto | UpdateSessionDto) {
  try {
    if ('id' in data) {
      // Update
      await programmeStore.updateSession(data.id, data)
    } else {
      // Create
      await programmeStore.createSession(data)
    }
    closeSessionModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save session. Please try again.'
    if (sessionFormRef.value) {
      sessionFormRef.value.setError(errorMessage)
    }
  }
}

async function handleSessionDelete() {
  if (!selectedSession.value) return
  
  try {
    await programmeStore.deleteSession(selectedSession.value.id)
    isDeleteModalOpen.value = false
    selectedSession.value = null
  } catch (err: any) {
    console.error('Failed to delete session:', err)
    // Show error notification here if you have one
  }
}

onMounted(async () => {
  // Fetch event details
  if (eventId.value) {
    await eventStore.fetchEventById(eventId.value)
    await programmeStore.fetchProgrammeDays(eventId.value)
    
    // Set first day as current if available
    if (programmeStore.programmeDays.length > 0 && !programmeStore.currentDay) {
      programmeStore.setCurrentDay(programmeStore.programmeDays[0])
    }
  }
})
</script>
