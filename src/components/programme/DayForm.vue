<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Day Number -->
    <div>
      <label for="day_number" class="block text-sm font-medium text-chatgpt-text mb-2">
        Day Number <span class="text-red-500">*</span>
      </label>
      <input
        id="day_number"
        v-model.number="formData.day_number"
        type="number"
        min="1"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter day number (e.g., 1, 2, 3...)"
      />
    </div>

    <!-- Date -->
    <div>
      <label for="date" class="block text-sm font-medium text-chatgpt-text mb-2">
        Date <span class="text-red-500">*</span>
      </label>
      <input
        id="date"
        v-model="formData.date"
        type="date"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
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
        placeholder="e.g., Opening Day, Conference Day 1"
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
        placeholder="Enter day description"
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
        :disabled="loading"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
        <span v-else>{{ isEditMode ? 'Update Day' : 'Create Day' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ProgrammeDay, CreateDayDto, UpdateDayDto } from '@/app/store/programme'

interface Props {
  day?: ProgrammeDay | null
  eventId: string | number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  day: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateDayDto | UpdateDayDto]
  cancel: []
}>()

const isEditMode = computed(() => !!props.day)

const formData = ref<CreateDayDto>({
  event_id: props.eventId,
  day_number: 1,
  date: new Date().toISOString().split('T')[0],
  title: '',
  description: '',
})

const error = ref('')

// Initialize form data from day prop
watch(
  () => props.day,
  (day) => {
    if (day) {
      formData.value = {
        event_id: day.event_id,
        day_number: day.day_number,
        date: day.date ? new Date(day.date).toISOString().split('T')[0] : '',
        title: day.title || '',
        description: day.description || '',
      }
    } else {
      // Reset form for new day
      formData.value = {
        event_id: props.eventId,
        day_number: 1,
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
      }
    }
  },
  { immediate: true }
)

// Watch eventId changes
watch(
  () => props.eventId,
  (eventId) => {
    formData.value.event_id = eventId
  }
)

function handleSubmit() {
  error.value = ''

  // Ensure event_id is always set from props.eventId
  if (!props.eventId) {
    error.value = 'Event ID is required'
    return
  }

  const submitData = {
    ...formData.value,
    event_id: props.eventId || formData.value.event_id,
  }

  if (isEditMode.value && props.day) {
    const updateData: UpdateDayDto = {
      id: props.day.id,
      ...submitData,
    }
    emit('submit', updateData)
  } else {
    emit('submit', submitData)
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
