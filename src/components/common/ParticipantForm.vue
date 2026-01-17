<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="fullName" class="block text-sm font-medium text-chatgpt-text mb-2">
        Full Name <span class="text-red-500">*</span>
      </label>
      <input
        id="fullName"
        v-model="formData.fullName"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter full name"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-chatgpt-text mb-2">
        Email <span class="text-red-500">*</span>
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter email address"
      />
    </div>

    <div>
      <label for="phone" class="block text-sm font-medium text-chatgpt-text mb-2">
        Phone
      </label>
      <input
        id="phone"
        v-model="formData.phone"
        type="tel"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter phone number"
      />
    </div>

    <div>
      <label for="eventId" class="block text-sm font-medium text-chatgpt-text mb-2">
        Event (Optional)
      </label>
      <select
        id="eventId"
        v-model="formData.eventId"
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
      >
        <option value="">Select an event</option>
        <option
          v-for="event in eventStore.events"
          :key="event.id"
          :value="event.id"
        >
          {{ event.name }}
        </option>
      </select>
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
        <span v-if="loading">{{ isEditMode ? 'Updating...' : 'Adding...' }}</span>
        <span v-else>{{ isEditMode ? 'Update' : 'Save' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useParticipantStore, type CreateParticipantDto, type Participant } from '@/app/store/participant'
import { useEventStore } from '@/app/store/event'

interface Props {
  participant?: Participant | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  participant: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateParticipantDto | (CreateParticipantDto & { id: string })]
  cancel: []
}>()

const participantStore = useParticipantStore()
const eventStore = useEventStore()

const isEditMode = computed(() => !!props.participant)

const formData = ref<CreateParticipantDto>({
  fullName: '',
  email: '',
  phone: '',
  eventId: '',
})

const error = ref('')

onMounted(() => {
  eventStore.fetchEvents()
})

// Initialize form with participant data if editing
watch(() => props.participant, (participant) => {
  if (participant) {
    // Construct fullName from firstName/lastName if fullName is not available
    const fullName = participant.fullName || 
      (participant.firstName && participant.lastName 
        ? `${participant.firstName} ${participant.lastName}` 
        : participant.firstName || participant.lastName || '')
    
    formData.value = {
      fullName: fullName,
      email: participant.email,
      phone: participant.phone || '',
      eventId: participant.eventId || '',
    }
  } else {
    // Reset form for create mode
    formData.value = {
      fullName: '',
      email: '',
      phone: '',
      eventId: '',
    }
  }
  error.value = ''
}, { immediate: true })

function handleSubmit() {
  error.value = ''
  
  if (isEditMode.value && props.participant) {
    emit('submit', { ...formData.value, id: props.participant.id })
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
