<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Time Range -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="start_time" class="block text-sm font-medium text-chatgpt-text mb-2">
          Start Time <span class="text-red-500">*</span>
        </label>
        <input
          id="start_time"
          v-model="formData.start_time"
          type="datetime-local"
          required
          step="900"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label for="end_time" class="block text-sm font-medium text-chatgpt-text mb-2">
          End Time <span class="text-red-500">*</span>
        </label>
        <input
          id="end_time"
          v-model="formData.end_time"
          type="datetime-local"
          required
          step="900"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p v-if="timeConflictWarning" class="mt-1 text-xs text-red-600">
          ⚠️ Time overlaps with existing time slots
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

const formData = ref<Omit<CreateTimeSlotDto, 'day_id'>>({
  start_time: '',
  end_time: '',
  title: '',
  description: '',
})

const error = ref('')

// Check for time conflicts with existing time slots
const timeConflictWarning = computed(() => {
  if (!props.day?.time_slots || !formData.value.start_time || !formData.value.end_time) {
    return false
  }
  
  const newStart = new Date(formData.value.start_time).getTime()
  const newEnd = new Date(formData.value.end_time).getTime()
  
  return props.day.time_slots.some(slot => {
    if (isEditMode.value && props.timeSlot?.id === slot.id) return false
    const slotStart = new Date(slot.start_time).getTime()
    const slotEnd = new Date(slot.end_time).getTime()
    
    return (
      (newStart >= slotStart && newStart < slotEnd) ||
      (newEnd > slotStart && newEnd <= slotEnd) ||
      (newStart <= slotStart && newEnd >= slotEnd)
    )
  })
})

// Initialize form data from timeSlot prop
watch(
  () => props.timeSlot,
  (timeSlot) => {
    if (timeSlot) {
      formData.value = {
        start_time: formatDateTimeLocal(timeSlot.start_time),
        end_time: formatDateTimeLocal(timeSlot.end_time),
        title: timeSlot.title || '',
        description: timeSlot.description || '',
      }
    } else {
      // Reset form for new time slot
      const now = new Date()
      now.setMinutes(0)
      const nextHour = new Date(now)
      nextHour.setHours(nextHour.getHours() + 1)
      
      formData.value = {
        start_time: formatDateTimeLocal(now.toISOString()),
        end_time: formatDateTimeLocal(nextHour.toISOString()),
        title: '',
        description: '',
      }
    }
  },
  { immediate: true }
)

function formatDateTimeLocal(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function handleSubmit() {
  if (timeConflictWarning.value) {
    error.value = 'Time slot overlaps with existing time slots. Please adjust the times.'
    return
  }

  error.value = ''

  if (isEditMode.value && props.timeSlot) {
    const updateData: UpdateTimeSlotDto = {
      id: props.timeSlot.id,
      ...formData.value,
    }
    emit('submit', updateData)
  } else {
    if (!props.day?.id) {
      error.value = 'Day is required'
      return
    }
    const createData: CreateTimeSlotDto = {
      day_id: props.day.id,
      ...formData.value,
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
