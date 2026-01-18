<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Session Type -->
    <div>
      <label for="type" class="block text-sm font-medium text-chatgpt-text mb-2">
        Session Type <span class="text-red-500">*</span>
      </label>
      <select
        id="type"
        v-model="formData.type"
        required
        @change="handleTypeChange"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="keynote">🎤 Keynote</option>
        <option value="panel">🧑‍🤝‍🧑 Panel Discussion</option>
        <option value="break">☕ Break</option>
        <option value="lunch">🍽 Lunch</option>
        <option value="tea">☕ Evening Tea</option>
      </select>
    </div>

    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-chatgpt-text mb-2">
        Session Title <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter session title"
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
        placeholder="Enter session description"
      />
    </div>

    <!-- Time Slot Selection -->
    <div v-if="!isEditMode && availableTimeSlots.length > 0">
      <label for="time_slot_id" class="block text-sm font-medium text-chatgpt-text mb-2">
        Time Slot <span class="text-red-500">*</span>
      </label>
      <select
        id="time_slot_id"
        v-model="formData.time_slot_id"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">Select a time slot</option>
        <option
          v-for="slot in availableTimeSlots"
          :key="slot.id"
          :value="slot.id"
        >
          {{ formatTimeSlot(slot) }}
        </option>
      </select>
    </div>
    
    <!-- Time Range (for display or edit mode) -->
    <div v-if="isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-chatgpt-text-light mb-2">
          Start Time
        </label>
        <div class="px-4 py-2 border border-chatgpt-border rounded-lg bg-gray-50 text-chatgpt-text">
          {{ session?.start_time ? formatDateTime(session.start_time) : 'N/A' }}
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-chatgpt-text-light mb-2">
          End Time
        </label>
        <div class="px-4 py-2 border border-chatgpt-border rounded-lg bg-gray-50 text-chatgpt-text">
          {{ session?.end_time ? formatDateTime(session.end_time) : 'N/A' }}
        </div>
      </div>
    </div>
    
    <p v-if="timeConflictWarning" class="text-xs text-red-600 mt-2">
      ⚠️ Time conflict detected with existing sessions
    </p>

    <!-- Location / Hall -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="location" class="block text-sm font-medium text-chatgpt-text mb-2">
          Location
        </label>
        <input
          id="location"
          v-model="formData.location"
          type="text"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g., Main Conference Hall"
        />
      </div>

      <div>
        <label for="hall" class="block text-sm font-medium text-chatgpt-text mb-2">
          Hall / Room
        </label>
        <input
          id="hall"
          v-model="formData.hall"
          type="text"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g., Hall A"
        />
      </div>
    </div>

    <!-- Keynote: Speaker -->
    <div v-if="formData.type === 'keynote'">
      <label for="speaker_id" class="block text-sm font-medium text-chatgpt-text mb-2">
        Speaker
      </label>
      <input
        id="speaker_id"
        v-model="formData.speaker_id"
        type="text"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Speaker ID (will be integrated with speakers API)"
      />
      <p v-if="speakerConflictWarning" class="mt-1 text-xs text-red-600">
        ⚠️ Speaker has a scheduling conflict
      </p>
    </div>

    <!-- Panel: Moderator + Panelists -->
    <template v-if="formData.type === 'panel'">
      <div>
        <label for="moderator_id" class="block text-sm font-medium text-chatgpt-text mb-2">
          Moderator
        </label>
        <input
          id="moderator_id"
          v-model="formData.moderator_id"
          type="text"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Moderator ID"
        />
      </div>

      <div>
        <label for="panelist_ids" class="block text-sm font-medium text-chatgpt-text mb-2">
          Panelists (comma-separated IDs)
        </label>
        <input
          id="panelist_ids"
          v-model="panelistIdsInput"
          type="text"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="e.g., 1, 2, 3"
        />
      </div>
    </template>

    <!-- Break/Lunch/Tea: Catering Notes -->
    <div v-if="['break', 'lunch', 'tea'].includes(formData.type)">
      <label for="catering_notes" class="block text-sm font-medium text-chatgpt-text mb-2">
        Catering Notes
      </label>
      <textarea
        id="catering_notes"
        v-model="formData.catering_notes"
        rows="2"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Special catering requirements or notes"
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
        <span v-else>{{ isEditMode ? 'Update Session' : 'Create Session' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Session, CreateSessionDto, UpdateSessionDto, SessionType, ProgrammeDay } from '@/app/store/programme'
import { useProgrammeStore } from '@/app/store/programme'

interface Props {
  session?: Session | null
  currentDay?: ProgrammeDay | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  session: null,
  currentDay: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateSessionDto | UpdateSessionDto]
  cancel: []
}>()

const programmeStore = useProgrammeStore()

const isEditMode = computed(() => !!props.session)

const formData = ref<CreateSessionDto & { time_slot_id?: string | number }>({
  time_slot_id: props.currentDay?.time_slots?.[0]?.id,
  type: 'keynote',
  title: '',
  description: '',
  location: '',
  hall: '',
  speaker_id: undefined,
  moderator_id: undefined,
  panelist_ids: [],
  catering_notes: '',
})

// Available time slots for selection
const availableTimeSlots = computed(() => {
  return props.currentDay?.time_slots || []
})

const panelistIdsInput = ref('')
const error = ref('')

// Get selected time slot for conflict checking
const selectedTimeSlot = computed(() => {
  if (!formData.value.time_slot_id || !props.currentDay?.time_slots) return null
  return props.currentDay.time_slots.find(slot => slot.id === formData.value.time_slot_id)
})

// Watch for time slot changes to check conflicts (for new sessions, conflicts would be within the same time slot)
const timeConflictWarning = computed(() => {
  // For edit mode or when creating, conflicts would be checked at the time slot level
  // This is a simplified check - you might want to enhance this
  return false
})

const speakerConflictWarning = computed(() => {
  if (!formData.value.speaker_id || !selectedTimeSlot.value) return false
  const slotStart = selectedTimeSlot.value.start_time
  const slotEnd = selectedTimeSlot.value.end_time
  const conflicts = programmeStore.checkSpeakerConflicts(
    formData.value.speaker_id,
    slotStart,
    slotEnd,
    isEditMode.value ? props.session?.id : undefined
  )
  return conflicts.length > 0
})

// Initialize form data from session prop
watch(
  () => props.session,
  (session) => {
    if (session) {
      formData.value = {
        time_slot_id: session.time_slot_id,
        type: session.type,
        title: session.title,
        description: session.description || '',
        location: session.location || '',
        hall: session.hall || '',
        speaker_id: session.speaker_id,
        moderator_id: session.moderator_id,
        panelist_ids: session.panelists?.map(p => p.id) || [],
        catering_notes: session.catering_notes || '',
      }
      panelistIdsInput.value = session.panelists?.map(p => String(p.id)).join(', ') || ''
    } else {
      // Reset form for new session
      formData.value = {
        time_slot_id: props.currentDay?.time_slots?.[0]?.id,
        type: 'keynote',
        title: '',
        description: '',
        location: '',
        hall: '',
        speaker_id: undefined,
        moderator_id: undefined,
        panelist_ids: [],
        catering_notes: '',
      }
      panelistIdsInput.value = ''
    }
  },
  { immediate: true }
)

// Watch current day to update available time slots
watch(
  () => props.currentDay,
  (day) => {
    if (!props.session && day?.time_slots?.length) {
      formData.value.time_slot_id = day.time_slots[0].id
    }
  }
)

function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeSlot(slot: any): string {
  const start = new Date(slot.start_time)
  const end = new Date(slot.end_time)
  const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return slot.title ? `${slot.title} (${startTime} - ${endTime})` : `${startTime} - ${endTime}`
}

function handleTypeChange() {
  // Clear type-specific fields when type changes
  if (!['keynote'].includes(formData.value.type)) {
    formData.value.speaker_id = undefined
  }
  if (formData.value.type !== 'panel') {
    formData.value.moderator_id = undefined
    formData.value.panelist_ids = []
    panelistIdsInput.value = ''
  }
  if (!['break', 'lunch', 'tea'].includes(formData.value.type)) {
    formData.value.catering_notes = ''
  }
}

function handleSubmit() {
  if (timeConflictWarning.value) {
    error.value = 'Cannot create session due to time conflict. Please adjust the time.'
    return
  }

  error.value = ''

  // Parse panelist IDs
  if (panelistIdsInput.value) {
    formData.value.panelist_ids = panelistIdsInput.value
      .split(',')
      .map(id => id.trim())
      .filter(id => id)
      .map(id => {
        const num = Number(id)
        return isNaN(num) ? id : num
      })
  } else {
    formData.value.panelist_ids = []
  }

  if (isEditMode.value && props.session) {
    const { time_slot_id, ...sessionData } = formData.value
    const updateData: UpdateSessionDto = {
      id: props.session.id,
      ...sessionData,
    }
    emit('submit', updateData)
  } else {
    // For new sessions, ensure time_slot_id is provided
    if (!formData.value.time_slot_id) {
      error.value = 'Please select a time slot'
      return
    }
    const { time_slot_id, ...sessionData } = formData.value
    emit('submit', { ...sessionData, time_slot_id })
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
