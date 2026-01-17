<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-chatgpt-text mb-2">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
        placeholder="Enter user name"
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

    <div v-if="!isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="password" class="block text-sm font-medium text-chatgpt-text mb-2">
          Password <span class="text-red-500">*</span>
        </label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          required
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          placeholder="Enter password"
        />
      </div>

      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-chatgpt-text mb-2">
          Confirm Password <span class="text-red-500">*</span>
        </label>
        <input
          id="password_confirmation"
          v-model="formData.password_confirmation"
          type="password"
          required
          class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
          placeholder="Confirm password"
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
        <span v-else>{{ isEditMode ? 'Update' : 'Create' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { User, CreateUserDto } from '@/app/store/user'

interface Props {
  user?: User | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  loading: false,
})

const emit = defineEmits<{
  submit: [data: CreateUserDto | (CreateUserDto & { id: string | number })]
  cancel: []
}>()

const isEditMode = computed(() => !!props.user)

const formData = ref<CreateUserDto>({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const error = ref('')

// Initialize form with user data if editing
watch(() => props.user, (user) => {
  if (user) {
    formData.value = {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
    }
  } else {
    // Reset form for create mode
    formData.value = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    }
  }
  error.value = ''
}, { immediate: true })

function handleSubmit() {
  error.value = ''
  
  // Validate password confirmation for create mode
  if (!isEditMode.value && formData.value.password !== formData.value.password_confirmation) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (isEditMode.value && props.user) {
    // For update, only send fields that are filled (excluding password if empty)
    const updateData: Partial<CreateUserDto> = {
      name: formData.value.name,
      email: formData.value.email,
    }
    // Only include password if provided
    if (formData.value.password && formData.value.password_confirmation) {
      if (formData.value.password !== formData.value.password_confirmation) {
        error.value = 'Passwords do not match'
        return
      }
      updateData.password = formData.value.password
      updateData.password_confirmation = formData.value.password_confirmation
    }
    emit('submit', { ...updateData, id: props.user.id } as CreateUserDto & { id: string | number })
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
