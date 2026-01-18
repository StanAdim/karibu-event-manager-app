<template>
  <div class="relative w-full">
    <!-- Timeline Container -->
    <div class="relative bg-white rounded-lg border border-chatgpt-border overflow-x-auto overflow-y-visible">
      <!-- Time Grid Header (Sticky) -->
      <div class="sticky top-0 z-20 bg-white border-b border-chatgpt-border p-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-chatgpt-text">
            {{ currentDay?.date ? formatDayDate(currentDay.date) : 'Programme Timeline' }}
          </h3>
          <div class="flex items-center space-x-3 text-xs text-chatgpt-text-light">
            <div class="flex items-center space-x-1.5">
              <div class="w-3 h-3 rounded bg-indigo-500"></div>
              <span>Keynote</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-3 h-3 rounded bg-purple-500"></div>
              <span>Panel</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-3 h-3 rounded bg-orange-500"></div>
              <span>Lunch/Break</span>
            </div>
          </div>
        </div>

        <!-- Time Scale with Grid Lines -->
        <div class="relative h-10 border-t border-b border-chatgpt-border">
          <!-- Grid Lines -->
          <div class="absolute inset-0 flex">
            <div
              v-for="hour in timeSlots"
              :key="`grid-${hour}`"
              class="flex-1 border-l border-chatgpt-border first:border-l-0 relative"
            >
              <!-- Hour Label -->
              <div class="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-chatgpt-text-light font-medium whitespace-nowrap">
                {{ formatHour(hour) }}
              </div>
              <!-- Quarter Hour Markers (optional) -->
              <div
                v-for="quarter in [15, 30, 45]"
                :key="`${hour}-${quarter}`"
                class="absolute top-0 w-px h-full border-l border-dotted border-chatgpt-border opacity-30"
                :style="{ left: `${(quarter / 60) * 100}%` }"
              ></div>
            </div>
          </div>
          <!-- End Marker -->
          <div class="absolute -top-6 right-0 text-xs text-chatgpt-text-light font-medium whitespace-nowrap">
            {{ formatHour(endHour) }}
          </div>
        </div>
      </div>

      <!-- Timeline Content -->
      <div class="relative" :style="{ minHeight: `${timelineHeight}px`, padding: '1.5rem', minWidth: '800px' }">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="h-24 bg-gray-100 rounded-lg animate-pulse"
          ></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="sessionsWithTimes.length === 0" class="text-center py-12">
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
          <p class="text-chatgpt-text-light mb-2">No sessions scheduled for this day</p>
          <p class="text-sm text-chatgpt-text-light">Click the + button to add a session</p>
        </div>

        <!-- Time Grid Background -->
        <div v-else class="absolute inset-0 flex pointer-events-none">
          <div
            v-for="hour in timeSlots"
            :key="`bg-${hour}`"
            class="flex-1 border-l border-chatgpt-border first:border-l-0 opacity-20"
          ></div>
        </div>

        <!-- Proportional Timeline with Sessions -->
        <div v-if="!loading && sessionsWithTimes.length > 0" class="relative" style="height: 100%">
          <!-- Sessions positioned proportionally -->
          <div
            v-for="session in positionedSessions"
            :key="session.id"
            :style="{
              position: 'absolute',
              left: `${session.position}%`,
              width: `${session.width}%`,
              top: `${session.row * sessionRowHeight + 10}px`,
              zIndex: session.hasConflict ? 30 : 20,
            }"
            class="transition-all duration-200"
          >
            <SessionCard
              :session="session.original"
              :draggable="draggable"
              :has-conflict="session.hasConflict"
              @click="$emit('sessionClick', session.original)"
              @dragStart="handleDragStart(session.original, $event)"
              @dragEnd="handleDragEnd"
              class="h-full"
            />
          </div>

          <!-- Current Time Indicator (optional - can be shown if current day) -->
          <div
            v-if="showCurrentTime"
            :style="{ left: `${currentTimePosition}%` }"
            class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none"
          >
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Session, ProgrammeDay } from '@/app/store/programme'
import SessionCard from './SessionCard.vue'
import { useProgrammeStore } from '@/app/store/programme'

interface Props {
  currentDay?: ProgrammeDay | null
  sessions?: Session[]
  loading?: boolean
  draggable?: boolean
  startHour?: number
  endHour?: number
}

const props = withDefaults(defineProps<Props>(), {
  sessions: () => [],
  loading: false,
  draggable: true,
  startHour: 8,
  endHour: 22,
})

const emit = defineEmits<{
  sessionClick: [session: Session]
  dragStart: [session: Session, event: DragEvent]
  dragEnd: []
}>()

const programmeStore = useProgrammeStore()
const draggedSession = ref<Session | null>(null)

// Calculate time slots for the day
const timeSlots = computed(() => {
  const slots: number[] = []
  for (let hour = props.startHour; hour < props.endHour; hour++) {
    slots.push(hour)
  }
  return slots
})

// Get sessions with their time slot times
const sessionsWithTimes = computed(() => {
  if (!props.sessions || !props.currentDay?.time_slots) return []
  
  return props.sessions.map(session => {
    // Find the time slot for this session
    const timeSlot = props.currentDay!.time_slots?.find(ts => 
      ts.sessions?.some(s => s.id === session.id)
    )
    
    // Use time slot times if session doesn't have its own times
    return {
      ...session,
      start_time: session.start_time || timeSlot?.start_time || '',
      end_time: session.end_time || timeSlot?.end_time || '',
    }
  }).filter(s => s.start_time && s.end_time)
})

// Calculate timeline time range from time slots or sessions
const timelineStart = computed(() => {
  if (props.currentDay?.time_slots && props.currentDay.time_slots.length > 0) {
    const earliest = Math.min(
      ...props.currentDay.time_slots.map(ts => {
        const date = new Date(ts.start_time)
        return date.getHours() + date.getMinutes() / 60
      })
    )
    return Math.max(props.startHour, Math.floor(earliest))
  }
  
  if (sessionsWithTimes.value.length > 0) {
    const earliest = Math.min(
      ...sessionsWithTimes.value.map(s => {
        const date = new Date(s.start_time)
        return date.getHours() + date.getMinutes() / 60
      })
    )
    return Math.max(props.startHour, Math.floor(earliest))
  }
  
  return props.startHour
})

const timelineEnd = computed(() => {
  if (props.currentDay?.time_slots && props.currentDay.time_slots.length > 0) {
    const latest = Math.max(
      ...props.currentDay.time_slots.map(ts => {
        const date = new Date(ts.end_time)
        return date.getHours() + date.getMinutes() / 60
      })
    )
    return Math.min(props.endHour, Math.ceil(latest))
  }
  
  if (sessionsWithTimes.value.length > 0) {
    const latest = Math.max(
      ...sessionsWithTimes.value.map(s => {
        const date = new Date(s.end_time)
        return date.getHours() + date.getMinutes() / 60
      })
    )
    return Math.min(props.endHour, Math.ceil(latest))
  }
  
  return props.endHour
})

const timelineDuration = computed(() => {
  return timelineEnd.value - timelineStart.value
})

// Interface for positioned session
interface PositionedSession {
  original: Session
  position: number // Percentage from left
  width: number // Percentage width
  row: number // Which row/lane (for overlapping sessions)
  hasConflict: boolean
}

// Calculate session row height based on content
const sessionRowHeight = 140 // Height in pixels per row
const timelineHeight = computed(() => {
  if (!positionedSessions.value || positionedSessions.value.length === 0) {
    return 400
  }
  const maxRow = Math.max(...positionedSessions.value.map((s: PositionedSession) => s.row))
  return (maxRow + 1) * sessionRowHeight + 100
})

// Calculate proportional positions for sessions
const positionedSessions = computed((): PositionedSession[] => {
  if (sessionsWithTimes.value.length === 0) {
    return []
  }

  const positioned: PositionedSession[] = []
  const rows: Session[][] = [] // Track which sessions are in which row

  // Sort sessions by start time
  const sortedSessions = [...sessionsWithTimes.value].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })

  sortedSessions.forEach(session => {
    const startTime = new Date(session.start_time)
    const endTime = new Date(session.end_time)

    const startHours = startTime.getHours() + startTime.getMinutes() / 60
    const endHours = endTime.getHours() + endTime.getMinutes() / 60

    // Calculate position and width as percentages
    const startOffset = startHours - timelineStart.value
    const duration = endHours - startHours

    const position = (startOffset / timelineDuration.value) * 100
    const width = (duration / timelineDuration.value) * 100

    // Find a row that doesn't have overlapping sessions
    let row = 0
    for (let r = 0; r < rows.length; r++) {
      const rowSessions = rows[r]
      const hasOverlap = rowSessions.some(s => {
        const sStart = new Date(s.start_time)
        const sEnd = new Date(s.end_time)
        const sStartHours = sStart.getHours() + sStart.getMinutes() / 60
        const sEndHours = sEnd.getHours() + sEnd.getMinutes() / 60

        return !(endHours <= sStartHours || startHours >= sEndHours)
      })

      if (!hasOverlap) {
        row = r
        break
      } else {
        row = r + 1
      }
    }

    // Add to row
    if (!rows[row]) {
      rows[row] = []
    }
    rows[row].push(session)

    const hasConflict = checkSessionConflict(session)

    positioned.push({
      original: session,
      position: Math.max(0, Math.min(100, position)),
      width: Math.max(2, Math.min(100, width)), // Minimum 2% width for visibility
      row,
      hasConflict,
    })
  })

  return positioned
})

// Current time indicator (optional)
const showCurrentTime = computed(() => {
  if (!props.currentDay) return false
  const today = new Date()
  const dayDate = props.currentDay.date ? new Date(props.currentDay.date) : null
  if (!dayDate) return false

  // Check if current day
  const isToday =
    today.getDate() === dayDate.getDate() &&
    today.getMonth() === dayDate.getMonth() &&
    today.getFullYear() === dayDate.getFullYear()

  return isToday
})

const currentTimePosition = computed(() => {
  const now = new Date()
  const currentHours = now.getHours() + now.getMinutes() / 60
  const offset = currentHours - timelineStart.value
  return (offset / timelineDuration.value) * 100
})

function formatDayDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour} ${period}`
}

function checkSessionConflict(session: Session): boolean {
  const conflicts = programmeStore.checkTimeConflicts(
    session.start_time,
    session.end_time,
    session.id
  )
  return conflicts.length > 0
}

function handleDragStart(session: Session, event: DragEvent) {
  draggedSession.value = session
  emit('dragStart', session, event)
}

function handleDragEnd() {
  draggedSession.value = null
  emit('dragEnd')
}
</script>
