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
          class="relative bg-white rounded-lg border border-chatgpt-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
          :class="size === 'small' ? 'max-w-md' : size === 'large' ? 'max-w-4xl' : ''"
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
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="p-6 border-t border-chatgpt-border">
            <slot name="footer" />
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
  title: string
  size?: 'small' | 'medium' | 'large'
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closeOnOverlayClick: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
}>()

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
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
