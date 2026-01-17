<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleOverlayClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />

        <!-- Modal Container -->
        <div
          class="relative bg-white rounded-lg border border-chatgpt-border shadow-lg max-w-sm w-full z-10"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-chatgpt-border">
            <h3 class="text-lg font-semibold text-chatgpt-text">Actions</h3>
            <button
              @click="handleClose"
              class="p-1 rounded-lg hover:bg-gray-100 transition-colors text-chatgpt-text-light hover:text-chatgpt-text"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-2">
            <button
              v-if="showEdit"
              @click="handleAction('edit')"
              class="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-chatgpt-text"
            >
              <svg class="w-5 h-5 text-chatgpt-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="font-medium">Edit</span>
            </button>
            
            <button
              v-if="showView"
              @click="handleAction('view')"
              class="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-chatgpt-text"
            >
              <svg class="w-5 h-5 text-chatgpt-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="font-medium">View</span>
            </button>
            
            <button
              v-if="showChangeStatus"
              @click="handleAction('change-status')"
              class="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-chatgpt-text"
            >
              <svg class="w-5 h-5 text-chatgpt-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="font-medium">Change Status</span>
            </button>
            
            <button
              v-if="showDelete"
              @click="handleAction('delete')"
              class="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
            >
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="font-medium">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  showEdit?: boolean
  showView?: boolean
  showDelete?: boolean
  showChangeStatus?: boolean
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showEdit: true,
  showView: true,
  showDelete: true,
  showChangeStatus: true,
  closeOnOverlayClick: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'action': [action: 'edit' | 'view' | 'delete' | 'change-status']
  'close': []
}>()

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleAction(action: 'edit' | 'view' | 'delete' | 'change-status') {
  emit('action', action)
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  if (props.closeOnOverlayClick) {
    handleClose()
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  if (props.modelValue) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>