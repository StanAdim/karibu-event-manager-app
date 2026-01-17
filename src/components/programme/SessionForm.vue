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
        <p v-if="timeConflictWarning" class="mt-1 text-xs text-red-600">
          ⚠️ Time conflict detected
        </p>
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
      </div>
    </div>

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
import type { Session, CreateSessionDto, UpdateSessionDto, SessionType } from '@/app/store/programme'
import { useProgrammeStore } from '@/app/store/programme'

interface Props {
  session?: Session | null
  programmeDayId: string | number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  session: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateSessionDto | UpdateSessionDto]
  cancel: []
}>()

const programmeStore = useProgrammeStore()

const isEditMode = computed(() => !!props.session)

const formData = ref<CreateSessionDto>({
  programme_day_id: props.programmeDayId,
  type: 'keynote',
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  location: '',
  hall: '',
  speaker_id: undefined,
  moderator_id: undefined,
  panelist_ids: [],
  catering_notes: '',
})

const panelistIdsInput = ref('')
const error = ref('')

// Watch for time changes to check conflicts
const timeConflictWarning = computed(() => {
  if (!formData.value.start_time || !formData.value.end_time) return false
  const conflicts = programmeStore.checkTimeConflicts(
    formData.value.start_time,
    formData.value.end_time,
    isEditMode.value ? props.session?.id : undefined
  )
  return conflicts.length > 0
})

const speakerConflictWarning = computed(() => {
  if (!formData.value.speaker_id || !formData.value.start_time || !formData.value.end_time) return false
  const conflicts = programmeStore.checkSpeakerConflicts(
    formData.value.speaker_id,
    formData.value.start_time,
    formData.value.end_time,
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
        programme_day_id: session.programme_day_id,
        type: session.type,
        title: session.title,
        description: session.description || '',
        start_time: formatDateTimeLocal(session.start_time),
        end_time: formatDateTimeLocal(session.end_time),
        location: session.location || '',
        hall: session.hall || '',
        speaker_id: session.speaker_id,
        moderator_id: session.moderator_id,
        panelist_ids: session.panelists?.map(p => p.id) || [],
        catering_notes: session.catering_notes || '',
      }
      panelistIdsInput.value = session.panelists?.map(p => String(p.id)).join(', ') || ''
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
    const updateData: UpdateSessionDto = {
      id: props.session.id,
      ...formData.value,
    }
    emit('submit', updateData)
  } else {
    emit('submit', formData.value)
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
