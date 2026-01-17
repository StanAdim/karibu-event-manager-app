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
          class="relative bg-white rounded-lg border border-chatgpt-border shadow-lg max-w-md w-full z-10"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-chatgpt-border">
            <h3 class="text-lg font-semibold text-chatgpt-text">{{ title }}</h3>
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
          <div class="p-6">
            <p class="text-chatgpt-text">{{ message }}</p>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-chatgpt-border flex justify-end space-x-3">
            <button
              @click="handleClose"
              class="px-4 py-2 border border-chatgpt-border rounded-lg text-chatgpt-text hover:bg-gray-50 transition-colors font-medium"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {{ confirmText }}
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
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  confirmText: 'Yes',
  cancelText: 'No',
  closeOnOverlayClick: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

function handleClose() {
  emit('update:modelValue', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
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