<template>
  <div class="relative">
    <div 
      class="flex items-center border border-chatgpt-border rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"
      :class="{ 'ring-2 ring-indigo-500 border-transparent': isOpen }"
    >
      <!-- Hour Selector -->
      <div class="flex-1 relative">
        <select
          :id="`${id}-hours`"
          v-model="selectedHour"
          @focus="isOpen = true"
          @blur="handleBlur"
          class="appearance-none w-full px-4 py-2 bg-transparent border-r border-chatgpt-border text-chatgpt-text focus:outline-none cursor-pointer text-center font-medium"
          :disabled="disabled"
        >
          <option 
            v-for="hour in hours" 
            :key="hour.value" 
            :value="hour.value"
            class="text-chatgpt-text"
          >
            {{ hour.display }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2 border-r border-chatgpt-border">
          <svg class="w-4 h-4 text-chatgpt-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      <!-- Separator -->
      <div class="px-2 py-2 text-chatgpt-text-light font-semibold">:</div>

      <!-- Minute Selector -->
      <div class="flex-1 relative">
        <select
          :id="`${id}-minutes`"
          v-model="selectedMinute"
          @focus="isOpen = true"
          @blur="handleBlur"
          class="appearance-none w-full px-4 py-2 bg-transparent text-chatgpt-text focus:outline-none cursor-pointer text-center font-medium"
          :disabled="disabled"
        >
          <option 
            v-for="minute in minutes" 
            :key="minute.value" 
            :value="minute.value"
            class="text-chatgpt-text"
          >
            {{ minute.display }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-2">
          <svg class="w-4 h-4 text-chatgpt-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'

interface Props {
  modelValue?: string // Format: HH:mm
  id?: string
  disabled?: boolean
  step?: number // Minutes step (default: 15)
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  id: 'time-selector',
  disabled: false,
  step: 15,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

// Generate hours (00-23)
const hours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    display: String(i).padStart(2, '0'),
  }))
})

// Generate minutes based on step
const minutes = computed(() => {
  const minuteOptions: { value: string; display: string }[] = []
  for (let i = 0; i < 60; i += props.step) {
    minuteOptions.push({
      value: String(i).padStart(2, '0'),
      display: String(i).padStart(2, '0'),
    })
  }
  return minuteOptions
})

// Parse modelValue into hour and minute
const selectedHour = ref('09')
const selectedMinute = ref('00')

// Initialize from modelValue
function initializeFromValue(value: string) {
  if (value) {
    const [hour, minute] = value.split(':')
    selectedHour.value = hour || '09'
    selectedMinute.value = minute || '00'
  } else {
    selectedHour.value = '09'
    selectedMinute.value = '00'
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue: string) => {
  if (newValue) {
    const [hour, minute] = newValue.split(':')
    if (hour && minute) {
      selectedHour.value = hour
      selectedMinute.value = minute
    }
  }
}, { immediate: true })

// Watch for internal changes and emit
watch([selectedHour, selectedMinute], () => {
  const timeValue = `${selectedHour.value}:${selectedMinute.value}`
  emit('update:modelValue', timeValue)
})

function handleBlur() {
  // Small delay to allow click events to register
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

onMounted(() => {
  initializeFromValue(props.modelValue)
})
</script>

<style scoped>
select {
  background-image: none;
}

select::-ms-expand {
  display: none;
}

/* Custom scrollbar for select dropdowns */
select {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb #f3f4f6;
}

select::-webkit-scrollbar {
  width: 6px;
}

select::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

select::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

select::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>