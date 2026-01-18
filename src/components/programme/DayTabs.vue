<template>
  <div class="flex items-center space-x-2 overflow-x-auto pb-2">
    <button
      v-for="day in days"
      :key="day.id"
      @click="$emit('select', day)"
      :class="[
        'px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap',
        'border-2',
        isActive(day.id)
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
          : 'bg-white text-chatgpt-text border-chatgpt-border hover:border-indigo-300 hover:bg-indigo-50'
      ]"
    >
      <div class="flex items-center space-x-2">
        <span>Day {{ day.day_number }}</span>
        <span
          v-if="getSessionCount(day) > 0"
          :class="[
            'px-2 py-0.5 rounded-full text-xs font-semibold',
            isActive(day.id)
              ? 'bg-white bg-opacity-30 text-white'
              : 'bg-indigo-100 text-indigo-700'
          ]"
        >
          {{ getSessionCount(day) }}
        </span>
      </div>
      <div
        v-if="day.date"
        :class="[
          'text-xs mt-1',
          isActive(day.id) ? 'text-indigo-100' : 'text-chatgpt-text-light'
        ]"
      >
        {{ formatDate(day.date) }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ProgrammeDay } from '@/app/store/programme'

interface Props {
  days: ProgrammeDay[]
  activeDayId?: string | number
}

const props = defineProps<Props>()

defineEmits<{
  select: [day: ProgrammeDay]
}>()

function isActive(dayId: string | number): boolean {
  return props.activeDayId === dayId
}

function getSessionCount(day: ProgrammeDay): number {
  if (day.time_slots) {
    return day.time_slots.reduce((total, slot) => {
      return total + (slot.sessions?.length || 0)
    }, 0)
  }
  return day.sessions?.length || 0
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>
