<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Time Range -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="start_time" class="block text-sm font-medium text-chatgpt-text mb-2">
          Start Time <span class="text-red-500">*</span>
        </label>
        <TimeSelector
          id="start_time"
          v-model="formData.start_time"
          :step="15"
          :required="true"
        />
      </div>

      <div>
        <label for="end_time" class="block text-sm font-medium text-chatgpt-text mb-2">
          End Time <span class="text-red-500">*</span>
        </label>
        <TimeSelector
          id="end_time"
          v-model="formData.end_time"
          :step="15"
          :required="true"
        />
        <p v-if="timeConflictWarning" class="mt-1 text-xs text-red-600">
          ⚠️ Time overlaps with existing time slot{{ formData.venue ? ' in the same venue' : '' }}
        </p>
      </div>
    </div>

    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-chatgpt-text mb-2">
        Title
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="e.g., Morning Session, Afternoon Break"
      />
    </div>

    <!-- Venue -->
    <div>
      <label for="venue" class="block text-sm font-medium text-chatgpt-text mb-2">
        Venue
      </label>
      <input
        id="venue"
        v-model="formData.venue"
        type="text"
        maxlength="255"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="e.g., Main Hall, Conference Room A"
      />
    </div>

    <!-- Order -->
    <div>
      <label for="order" class="block text-sm font-medium text-chatgpt-text mb-2">
        Order
      </label>
      <input
        id="order"
        v-model.number="formData.order"
        type="number"
        min="0"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Display order (optional)"
      />
      <p class="mt-1 text-xs text-chatgpt-text-light">Optional: Used to sort time slots</p>
    </div>

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-chatgpt-text mb-2">
        Description
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="3"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter time slot description"
      />
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-4 pt-4 border-t border-chatgpt-border">
      <button
        type="button"
        @click="handleCancel"
        class="px-6 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading || timeConflictWarning"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
        <span v-else>{{ isEditMode ? 'Update Time Slot' : 'Create Time Slot' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import TimeSelector from '@/components/ui/TimeSelector.vue'
import type { TimeSlot, CreateTimeSlotDto, UpdateTimeSlotDto, ProgrammeDay } from '@/app/store/programme'
import { useProgrammeStore } from '@/app/store/programme'

interface Props {
  timeSlot?: TimeSlot | null
  day?: ProgrammeDay | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  timeSlot: null,
  day: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateTimeSlotDto | UpdateTimeSlotDto]
  cancel: []
}>()

const programmeStore = useProgrammeStore()
const isEditMode = computed(() => !!props.timeSlot)

// Store time strings in HH:mm format
const formData = ref<{
  start_time: string
  end_time: string
  title: string
  description: string
  venue: string
  order: number | null
}>({
  start_time: '',
  end_time: '',
  title: '',
  description: '',
  venue: '',
  order: null,
})

const error = ref('')

// Helper function to combine day date with time
function combineDateWithTime(dayDate: string, time: string): string {
  if (!dayDate || !time) return ''
  
  // Validate time format (HH:mm)
  if (!/^\d{2}:\d{2}$/.test(time)) return ''
  
  // Handle both YYYY-MM-DD and ISO date formats
  let date: Date
  if (dayDate.includes('T')) {
    // ISO format - parse directly
    date = new Date(dayDate)
  } else {
    // YYYY-MM-DD format - parse as local date
    const [year, month, day] = dayDate.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return ''
    date = new Date(year, month - 1, day) // month is 0-indexed
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) return ''
  
  const [hours, minutes] = time.split(':').map(Number)
  
  // Validate hours and minutes
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return ''
  }
  
  date.setHours(hours, minutes, 0, 0)
  
  // Check if result is still valid
  if (isNaN(date.getTime())) return ''
  
  return date.toISOString()
}

// Check for time conflicts with existing time slots in the same venue
const timeConflictWarning = computed(() => {
  if (!props.day?.time_slots || !props.day?.date || !formData.value.start_time || !formData.value.end_time) {
    return false
  }
  
  // If venue is specified, only check conflicts within the same venue
  // If venue is not specified, check conflicts with all slots (no venue)
  const venue = formData.value.venue?.trim() || null
  
  // Validate that we can create valid dates before checking conflicts
  const startDateTimeStr = combineDateWithTime(props.day.date, formData.value.start_time)
  const endDateTimeStr = combineDateWithTime(props.day.date, formData.value.end_time)
  
  if (!startDateTimeStr || !endDateTimeStr) {
    return false
  }
  
  const newStart = new Date(startDateTimeStr).getTime()
  const newEnd = new Date(endDateTimeStr).getTime()
  
  // Check if dates are valid
  if (isNaN(newStart) || isNaN(newEnd)) {
    return false
  }
  
  return props.day.time_slots.some((slot: TimeSlot) => {
    if (isEditMode.value && props.timeSlot?.id === slot.id) return false
    
    // Check venue match: if venue is specified, only check slots with the same venue
    // If venue is null/empty, only check slots with no venue
    const slotVenue = slot.venue?.trim() || null
    if (venue !== slotVenue) return false
    
    const slotStart = new Date(slot.start_time).getTime()
    const slotEnd = new Date(slot.end_time).getTime()
    
    // Skip invalid slot times
    if (isNaN(slotStart) || isNaN(slotEnd)) return false
    
    // Check for time overlap
    return (
      (newStart >= slotStart && newStart < slotEnd) ||
      (newEnd > slotStart && newEnd <= slotEnd) ||
      (newStart <= slotStart && newEnd >= slotEnd)
    )
  })
})

// Extract time from datetime string (format: HH:mm)
function extractTimeFromDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '09:00'
  
  const date = new Date(dateTimeString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '09:00'
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// Initialize form data from timeSlot prop
watch(
  () => props.timeSlot,
  (timeSlot: TimeSlot | null) => {
    if (timeSlot) {
      formData.value = {
        start_time: extractTimeFromDateTime(timeSlot.start_time),
        end_time: extractTimeFromDateTime(timeSlot.end_time),
        title: timeSlot.title || '',
        description: timeSlot.description || '',
        venue: timeSlot.venue || '',
        order: timeSlot.order !== undefined ? timeSlot.order : null,
      }
    } else {
      // Reset form for new time slot - default to 09:00 - 10:00
      formData.value = {
        start_time: '09:00',
        end_time: '10:00',
        title: '',
        description: '',
        venue: '',
        order: null,
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (timeConflictWarning.value) {
    const venueText = formData.value.venue ? ` in venue "${formData.value.venue}"` : ''
    error.value = `Time slot overlaps with an existing time slot${venueText}. Please adjust the times or venue.`
    return
  }

  if (!props.day?.id) {
    error.value = 'Day is required'
    return
  }

  if (!props.day?.date) {
    error.value = 'Day date is required'
    return
  }

  if (!formData.value.start_time || !formData.value.end_time) {
    error.value = 'Start time and end time are required'
    return
  }

  error.value = ''

  // Backend expects time in H:i format (e.g., "09:00"), not full datetime
  // The formData already has times in HH:mm format from TimeSelector, which matches Laravel's H:i format
  const startTime = formData.value.start_time // Already in HH:mm format (e.g., "09:00")
  const endTime = formData.value.end_time // Already in HH:mm format (e.g., "10:00")

  // Validate end_time is after start_time
  if (startTime >= endTime) {
    error.value = 'End time must be after start time'
    return
  }

  if (isEditMode.value && props.timeSlot) {
    const updateData: UpdateTimeSlotDto = {
      id: props.timeSlot.id,
      start_time: startTime,
      end_time: endTime,
      event_day_id: props.day?.id,
      venue: formData.value.venue?.trim() || undefined,
      order: formData.value.order !== null && formData.value.order !== undefined ? formData.value.order : undefined,
      title: formData.value.title,
      description: formData.value.description,
    }
    emit('submit', updateData)
  } else {
    // Ensure day_id is always set and valid (check for null/undefined but allow 0)
    const dayId = props.day?.id
    if (dayId === null || dayId === undefined) {
      error.value = 'Day ID is required'
      return
    }
    
    const createData: CreateTimeSlotDto = {
      day_id: dayId,
      event_day_id: dayId,
      start_time: startTime,
      end_time: endTime,
      venue: formData.value.venue?.trim() || undefined,
      order: formData.value.order !== null && formData.value.order !== undefined ? formData.value.order : undefined,
      title: formData.value.title,
      description: formData.value.description,
    }
    emit('submit', createData)
  }
}

function handleCancel() {
  error.value = ''
  emit('cancel')
}

// Expose error setter for parent component
function setError(message: string) {
  error.value = message
}

defineExpose({
  setError,
})
</script>
