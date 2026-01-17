<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-chatgpt-text mb-2">
        Checkpoint Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter checkpoint name"
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
        placeholder="Enter checkpoint description"
      />
    </div>

    <div>
      <label for="checkpoint_type_id" class="block text-sm font-medium text-chatgpt-text mb-2">
        Type <span class="text-red-500">*</span>
      </label>
      <select
        id="checkpoint_type_id"
        v-model="formData.checkpoint_type_id"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        :disabled="checkpointTypeStore.loading"
      >
        <option value="">Select a type</option>
        <option
          v-for="type in checkpointTypeStore.checkpointTypes"
          :key="type.id"
          :value="String(type.id)"
        >
          {{ type.name }}
        </option>
      </select>
      <p v-if="checkpointTypeStore.checkpointTypes.length === 0 && !checkpointTypeStore.loading" class="mt-1 text-xs text-chatgpt-text-light">
        No checkpoint types available. Please create one first.
      </p>
    </div>

    <div>
      <label for="eventId" class="block text-sm font-medium text-chatgpt-text mb-2">
        Event <span class="text-red-500">*</span>
      </label>
      <select
        id="eventId"
        v-model="formData.eventId"
        required
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

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="location" class="block text-sm font-medium text-chatgpt-text mb-2">
          Location
        </label>
        <input
          id="location"
          v-model="formData.location"
          type="text"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          placeholder="Enter checkpoint location"
        />
      </div>

      <div>
        <label for="order" class="block text-sm font-medium text-chatgpt-text mb-2">
          Order
        </label>
        <input
          id="order"
          v-model.number="formData.order"
          type="number"
          min="0"
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          placeholder="Enter order number"
        />
      </div>
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
import { ref, watch, computed, onMounted } from 'vue'
import { useCheckpointStore, type CreateCheckpointDto, type Checkpoint } from '@/app/store/checkpoint'
import { useEventStore } from '@/app/store/event'
import { useCheckpointTypeStore } from '@/app/store/checkpointType'

interface Props {
  checkpoint?: Checkpoint | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checkpoint: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateCheckpointDto | (CreateCheckpointDto & { id: string })]
  cancel: []
}>()

const checkpointStore = useCheckpointStore()
const eventStore = useEventStore()
const checkpointTypeStore = useCheckpointTypeStore()

const isEditMode = computed(() => !!props.checkpoint)

const formData = ref<CreateCheckpointDto>({
  name: '',
  description: '',
  checkpoint_type_id: '',
  eventId: '',
  location: '',
  order: undefined,
})

const error = ref('')

onMounted(async () => {
  await Promise.all([
    eventStore.fetchEvents(),
    checkpointTypeStore.fetchCheckpointTypes()
  ])
})

// Initialize form with checkpoint data if editing
watch(() => props.checkpoint, (checkpoint) => {
  if (checkpoint) {
    const typeId = checkpoint.checkpointTypeId || checkpoint.checkpoint_type_id
    formData.value = {
      name: checkpoint.name,
      description: checkpoint.description || '',
      checkpoint_type_id: typeId ? String(typeId) : '',
      eventId: checkpoint.eventId,
      location: checkpoint.location || '',
      order: checkpoint.order,
    }
  } else {
    // Reset form for create mode
    formData.value = {
      name: '',
      description: '',
      checkpoint_type_id: '',
      eventId: '',
      location: '',
      order: undefined,
    }
  }
  error.value = ''
}, { immediate: true })

function handleSubmit() {
  error.value = ''
  
  if (isEditMode.value && props.checkpoint) {
    emit('submit', { ...formData.value, id: props.checkpoint.id })
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
