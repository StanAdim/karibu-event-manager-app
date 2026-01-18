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
            <div class="flex items-center space-x-4">
              <!-- Publish/Unpublish Button -->
              <button
                v-if="canPublishProgramme && programmeStore.programme"
                @click="handlePublishToggle"
                :disabled="programmeStore.loading"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  programmeStore.programme.is_published
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700',
                  programmeStore.loading && 'opacity-50 cursor-not-allowed'
                ]"
              >
                {{ programmeStore.programme.is_published ? 'Unpublish' : 'Publish' }}
              </button>
              
              <!-- Add Day Button -->
              <button
                v-if="canManageProgramme"
                @click="openDayModal"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Add Day
              </button>
              
              <router-link
                :to="`/events/${eventId}`"
                class="px-4 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
              >
                Back to Event
              </router-link>
            </div>
          </div>

          <!-- Programme Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-lg border border-chatgpt-border p-4">
              <div class="text-2xl font-bold text-chatgpt-text">
                {{ programmeStore.days.length }}
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
        <div v-if="programmeStore.days.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <DayTabs
              :days="programmeStore.days"
              :active-day-id="programmeStore.currentDay?.id"
              @select="handleDaySelect"
            />
            <!-- Day Actions -->
            <div v-if="canManageProgramme && programmeStore.currentDay" class="flex items-center space-x-2">
              <button
                @click="openDayModal(programmeStore.currentDay)"
                class="px-3 py-1.5 text-sm border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors text-chatgpt-text"
                title="Edit Day"
              >
                Edit Day
              </button>
              <button
                @click="() => { dayToDelete = programmeStore.currentDay; isDeleteDayModalOpen = true }"
                class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Day"
              >
                Delete Day
              </button>
              <button
                @click="openTimeSlotModal"
                class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Add Time Slot"
              >
                Add Time Slot
              </button>
            </div>
          </div>
          
          <!-- Time Slots List for Current Day -->
          <div v-if="programmeStore.currentDay?.time_slots && programmeStore.currentDay.time_slots.length > 0" class="mb-4">
            <div class="flex items-center space-x-2 overflow-x-auto pb-2">
              <div
                v-for="slot in programmeStore.currentDay.time_slots"
                :key="slot.id"
                class="px-4 py-2 bg-white border border-chatgpt-border rounded-lg flex items-center space-x-2 whitespace-nowrap"
              >
                <div class="text-sm text-chatgpt-text">
                  <span class="font-medium">{{ slot.title || 'Time Slot' }}</span>
                  <span class="text-chatgpt-text-light ml-2">
                    {{ formatTimeSlot(slot) }}
                  </span>
                  <span class="text-chatgpt-text-light ml-2">
                    ({{ slot.sessions?.length || 0 }} sessions)
                  </span>
                </div>
                <div v-if="canManageProgramme" class="flex items-center space-x-1 ml-2">
                  <button
                    @click="openTimeSlotModal(slot)"
                    class="p-1 text-chatgpt-text-light hover:text-chatgpt-text transition-colors"
                    title="Edit Time Slot"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="handleDeleteTimeSlot(slot.id)"
                    class="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Time Slot"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Programme Timeline -->
        <div v-if="programmeStore.currentDay" class="relative">
          <ProgrammeTimeline
            :current-day="programmeStore.currentDay"
            :sessions="programmeStore.currentDaySessions"
            :loading="programmeStore.loading"
            :draggable="canManageProgramme"
            @session-click="handleSessionClick"
          />
        </div>

        <!-- Add Session FAB - Show if user has permission and there's at least one programme day -->
        <button
          v-if="canManageProgramme && programmeStore.days.length > 0 && programmeStore.currentDay"
          @click="openSessionModal"
          class="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 flex items-center justify-center z-30"
          title="Add Session"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>

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
          :current-day="programmeStore.currentDay"
          :loading="programmeStore.loading"
          @submit="handleSessionSubmit"
          @cancel="closeSessionModal"
        />
      </BaseModal>

      <!-- Day Modal -->
      <BaseModal
        v-model="isDayModalOpen"
        :title="selectedDay ? 'Edit Day' : 'Create New Day'"
        @close="closeDayModal"
      >
        <DayForm
          v-if="eventId"
          ref="dayFormRef"
          :day="selectedDay"
          :event-id="eventId"
          :loading="programmeStore.loading"
          @submit="handleDaySubmit"
          @cancel="closeDayModal"
        />
      </BaseModal>

      <!-- Time Slot Modal -->
      <BaseModal
        v-model="isTimeSlotModalOpen"
        :title="selectedTimeSlot ? 'Edit Time Slot' : 'Create New Time Slot'"
        @close="closeTimeSlotModal"
      >
        <TimeSlotForm
          v-if="programmeStore.currentDay"
          ref="timeSlotFormRef"
          :time-slot="selectedTimeSlot"
          :day="programmeStore.currentDay"
          :loading="programmeStore.loading"
          @submit="handleTimeSlotSubmit"
          @cancel="closeTimeSlotModal"
        />
      </BaseModal>

      <!-- Delete Confirmation Modals -->
      <ConfirmModal
        v-model="isDeleteModalOpen"
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleSessionDelete"
        @cancel="isDeleteModalOpen = false"
      />
      
      <ConfirmModal
        v-model="isDeleteDayModalOpen"
        title="Delete Day"
        message="Are you sure you want to delete this day? All time slots and sessions will be deleted. This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleDayDelete"
        @cancel="isDeleteDayModalOpen = false"
      />
      
      <ConfirmModal
        v-model="isDeleteTimeSlotModalOpen"
        title="Delete Time Slot"
        message="Are you sure you want to delete this time slot? All sessions in this time slot will be deleted. This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleTimeSlotDelete"
        @cancel="isDeleteTimeSlotModalOpen = false"
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
import DayForm from '@/components/programme/DayForm.vue'
import TimeSlotForm from '@/components/programme/TimeSlotForm.vue'
import { useEventStore } from '@/app/store/event'
import { 
  useProgrammeStore, 
  type CreateSessionDto, 
  type UpdateSessionDto, 
  type Session,
  type ProgrammeDay,
  type CreateDayDto,
  type UpdateDayDto,
  type TimeSlot,
  type CreateTimeSlotDto,
  type UpdateTimeSlotDto
} from '@/app/store/programme'
import { usePermissions } from '@/app/composables/usePermissions'

const route = useRoute()
const router = useRouter()
const { canWriteProgramme, canManageProgramme, canPublishProgramme } = usePermissions()

const eventId = computed(() => route.params.eventId as string)
const eventStore = useEventStore()
const programmeStore = useProgrammeStore()

// Session modals
const isSessionModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedSession = ref<Session | null>(null)
const sessionFormRef = ref<InstanceType<typeof SessionForm> | null>(null)

// Day modals
const isDayModalOpen = ref(false)
const isDeleteDayModalOpen = ref(false)
const selectedDay = ref<ProgrammeDay | null>(null)
const dayToDelete = ref<ProgrammeDay | null>(null)
const dayFormRef = ref<InstanceType<typeof DayForm> | null>(null)

// Time Slot modals
const isTimeSlotModalOpen = ref(false)
const isDeleteTimeSlotModalOpen = ref(false)
const selectedTimeSlot = ref<TimeSlot | null>(null)
const timeSlotToDelete = ref<TimeSlot | null>(null)
const timeSlotFormRef = ref<InstanceType<typeof TimeSlotForm> | null>(null)

const totalSessions = computed(() => {
  return programmeStore.allSessions.length
})

const currentDaySessions = computed(() => {
  return programmeStore.currentDaySessions.length
})

const completionPercentage = computed(() => {
  // Simple calculation: assume 8 sessions per day is "complete"
  const expectedSessionsPerDay = 8
  const totalExpected = programmeStore.days.length * expectedSessionsPerDay
  if (totalExpected === 0) return 0
  return Math.min(100, Math.round((totalSessions.value / totalExpected) * 100))
})

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function formatTimeSlot(slot: TimeSlot): string {
  const start = new Date(slot.start_time)
  const end = new Date(slot.end_time)
  const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${startTime} - ${endTime}`
}

function handleDaySelect(day: ProgrammeDay) {
  programmeStore.setCurrentDay(day)
}

// Day management
function openDayModal(day?: ProgrammeDay) {
  selectedDay.value = day || null
  isDayModalOpen.value = true
}

function closeDayModal() {
  isDayModalOpen.value = false
  selectedDay.value = null
  if (dayFormRef.value) {
    dayFormRef.value.setError('')
  }
}

async function handleDaySubmit(data: CreateDayDto | UpdateDayDto) {
  try {
    if ('id' in data && data.id) {
      await programmeStore.updateDay(data.id, data)
    } else {
      await programmeStore.createDay(data as CreateDayDto)
    }
    closeDayModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save day. Please try again.'
    if (dayFormRef.value) {
      dayFormRef.value.setError(errorMessage)
    }
  }
}

function handleDayDelete() {
  if (!dayToDelete.value) return
  const dayId = dayToDelete.value.id
  programmeStore.deleteDay(dayId)
    .then(() => {
      isDeleteDayModalOpen.value = false
      dayToDelete.value = null
      // Select first day if current was deleted
      if (programmeStore.days.length > 0) {
        programmeStore.setCurrentDay(programmeStore.days[0])
      }
    })
    .catch((err: any) => {
      console.error('Failed to delete day:', err)
    })
}

// Time Slot management
function openTimeSlotModal(slot?: TimeSlot) {
  if (!programmeStore.currentDay) {
    console.warn('Cannot open time slot modal: No day selected')
    return
  }
  selectedTimeSlot.value = slot || null
  isTimeSlotModalOpen.value = true
}

function closeTimeSlotModal() {
  isTimeSlotModalOpen.value = false
  selectedTimeSlot.value = null
  if (timeSlotFormRef.value) {
    timeSlotFormRef.value.setError('')
  }
}

async function handleTimeSlotSubmit(data: CreateTimeSlotDto | UpdateTimeSlotDto) {
  try {
    if ('id' in data && data.id) {
      await programmeStore.updateTimeSlot(data.id, data)
    } else {
      // Ensure we have a valid day_id from currentDay or the form data
      const createData = data as CreateTimeSlotDto
      const dayId = createData.day_id || programmeStore.currentDay?.id
      
      if (!dayId) {
        throw new Error('Day ID is required to create a time slot')
      }
      
      await programmeStore.createTimeSlot(dayId, {
        start_time: createData.start_time,
        end_time: createData.end_time,
        venue: createData.venue,
        order: createData.order,
        title: createData.title,
        description: createData.description,
      })
    }
    closeTimeSlotModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save time slot. Please try again.'
    if (timeSlotFormRef.value) {
      timeSlotFormRef.value.setError(errorMessage)
    }
  }
}

function handleDeleteTimeSlot(slotId: string | number) {
  timeSlotToDelete.value = { id: slotId } as TimeSlot
  isDeleteTimeSlotModalOpen.value = true
}

function handleTimeSlotDelete() {
  if (!timeSlotToDelete.value) return
  const slotId = timeSlotToDelete.value.id
  programmeStore.deleteTimeSlot(slotId)
    .then(() => {
      isDeleteTimeSlotModalOpen.value = false
      timeSlotToDelete.value = null
    })
    .catch((err: any) => {
      console.error('Failed to delete time slot:', err)
    })
}

// Session management
function openSessionModal(session?: Session) {
  if (!session && !programmeStore.currentDay && programmeStore.days.length > 0) {
    programmeStore.setCurrentDay(programmeStore.days[0])
  }
  
  if (!session && !programmeStore.currentDay) {
    console.warn('Cannot open session modal: No programme day selected')
    return
  }
  
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

async function handleSessionSubmit(data: any) {
  try {
    if (data.id) {
      // Update
      await programmeStore.updateSession(data.id, data)
    } else {
      // Create - need time_slot_id
      if (!data.time_slot_id && programmeStore.currentDay?.time_slots?.length) {
        // Use first time slot if none specified
        data.time_slot_id = programmeStore.currentDay.time_slots[0].id
      }
      if (data.time_slot_id) {
        const { time_slot_id, ...sessionData } = data
        await programmeStore.createSession(time_slot_id, sessionData)
      } else {
        throw new Error('Time slot is required to create a session')
      }
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
  }
}

// Programme publish/unpublish
async function handlePublishToggle() {
  if (!programmeStore.programme || !eventId.value) return
  
  try {
    if (programmeStore.programme.is_published) {
      await programmeStore.unpublishProgramme(eventId.value)
    } else {
      await programmeStore.publishProgramme(eventId.value)
    }
  } catch (err: any) {
    console.error('Failed to toggle programme publish status:', err)
  }
}

onMounted(async () => {
  // Fetch event details and programme
  if (eventId.value) {
    await eventStore.fetchEventById(eventId.value)
    await programmeStore.fetchProgramme(eventId.value)
    await programmeStore.fetchDays(eventId.value)
    
    // Set first day as current if available
    if (programmeStore.days.length > 0 && !programmeStore.currentDay) {
      programmeStore.setCurrentDay(programmeStore.days[0])
    }
  }
})
</script>
