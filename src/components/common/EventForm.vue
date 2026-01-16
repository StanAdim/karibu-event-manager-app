<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-chatgpt-text mb-2">
        Event Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter event name"
      />
    </div>

    <div>
      <label for="description" class="block text-sm font-medium text-chatgpt-text mb-2">
        Description
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        rows="4"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter event description"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="startDate" class="block text-sm font-medium text-chatgpt-text mb-2">
          Start Date <span class="text-red-500">*</span>
        </label>
        <input
          id="startDate"
          v-model="formData.startDate"
          type="datetime-local"
          required
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        />
      </div>

      <div>
        <label for="endDate" class="block text-sm font-medium text-chatgpt-text mb-2">
          End Date <span class="text-red-500">*</span>
        </label>
        <input
          id="endDate"
          v-model="formData.endDate"
          type="datetime-local"
          required
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label for="location" class="block text-sm font-medium text-chatgpt-text mb-2">
        Location
      </label>
      <input
        id="location"
        v-model="formData.location"
        type="text"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter event location"
      />
    </div>

    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
      {{ error }}
    </div>

    <div class="flex items-center justify-end space-x-4 pt-4">
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
        class="px-6 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
        <span v-else>{{ isEditMode ? 'Update' : 'Save' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEventStore, type CreateEventDto, type Event } from '@/app/store/event'

interface Props {
  event?: Event | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  event: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateEventDto | (CreateEventDto & { id: string })]
  cancel: []
}>()

const eventStore = useEventStore()

const isEditMode = computed(() => !!props.event)

const formData = ref<CreateEventDto>({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
})

const error = ref('')

// Initialize form with event data if editing
watch(() => props.event, (event) => {
  if (event) {
    formData.value = {
      name: event.name,
      description: event.description || '',
      startDate: formatDateTimeLocal(event.startDate),
      endDate: formatDateTimeLocal(event.endDate),
      location: event.location || '',
    }
  } else {
    // Reset form for create mode
    formData.value = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
    }
  }
  error.value = ''
}, { immediate: true })

function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function handleSubmit() {
  error.value = ''
  
  if (isEditMode.value && props.event) {
    emit('submit', { ...formData.value, id: props.event.id })
  } else {
    emit('submit', formData.value)
  }
}

function handleCancel() {
  error.value = ''
  emit('cancel')
}

// Expose error setter for parent component
defineExpose({
  setError: (message: string) => {
    error.value = message
  },
})
</script>
