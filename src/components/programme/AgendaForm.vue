<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-chatgpt-text mb-2">
        Title <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Enter agenda item title"
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
        placeholder="Enter agenda item description"
      />
    </div>

    <!-- Order and Duration -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          placeholder="Display order (0, 1, 2...)"
        />
      </div>

      <div>
        <label for="duration_minutes" class="block text-sm font-medium text-chatgpt-text mb-2">
          Duration (minutes)
        </label>
        <input
          id="duration_minutes"
          v-model.number="formData.duration_minutes"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Duration in minutes"
        />
      </div>
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
        <span v-else>{{ isEditMode ? 'Update Agenda Item' : 'Create Agenda Item' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Agenda, CreateAgendaDto, UpdateAgendaDto } from '@/app/store/programme'

interface Props {
  agenda?: Agenda | null
  sessionId: string | number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  agenda: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateAgendaDto | UpdateAgendaDto]
  cancel: []
}>()

const isEditMode = computed(() => !!props.agenda)

const formData = ref<Omit<CreateAgendaDto, 'session_id'>>({
  title: '',
  description: '',
  order: 0,
  duration_minutes: undefined,
})

const error = ref('')

// Initialize form data from agenda prop
watch(
  () => props.agenda,
  (agenda) => {
    if (agenda) {
      formData.value = {
        title: agenda.title,
        description: agenda.description || '',
        order: agenda.order || 0,
        duration_minutes: agenda.duration_minutes,
      }
    } else {
      // Reset form for new agenda
      formData.value = {
        title: '',
        description: '',
        order: 0,
        duration_minutes: undefined,
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  error.value = ''

  if (isEditMode.value && props.agenda) {
    const updateData: UpdateAgendaDto = {
      id: props.agenda.id,
      ...formData.value,
    }
    emit('submit', updateData)
  } else {
    const createData: CreateAgendaDto = {
      session_id: props.sessionId,
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
