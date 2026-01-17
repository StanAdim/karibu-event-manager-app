<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-chatgpt-text mb-2">
        Type Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter checkpoint type name"
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
        placeholder="Enter description"
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
        <span v-else>{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CheckpointType, CreateCheckpointTypeDto } from '@/app/store/checkpointType'

interface Props {
  checkpointType?: CheckpointType | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checkpointType: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateCheckpointTypeDto | (CreateCheckpointTypeDto & { id: string | number })]
  cancel: []
}>()

const isEditMode = computed(() => !!props.checkpointType)

const formData = ref<CreateCheckpointTypeDto>({
  name: '',
  description: '',
})

const error = ref('')

// Initialize form with checkpoint type data if editing
watch(() => props.checkpointType, (checkpointType) => {
  if (checkpointType) {
    formData.value = {
      name: checkpointType.name,
      description: checkpointType.description || '',
    }
  } else {
    // Reset form for create mode
    formData.value = {
      name: '',
      description: '',
    }
  }
  error.value = ''
}, { immediate: true })

function handleSubmit() {
  error.value = ''
  
  if (isEditMode.value && props.checkpointType) {
    emit('submit', { ...formData.value, id: props.checkpointType.id })
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
