<template>
  <div
    :class="[
      'relative rounded-lg border-2 p-3 transition-all hover:shadow-lg cursor-pointer',
      'group h-full flex flex-col',
      getSessionTypeClass(session.type).card,
      isDragging ? 'opacity-50 scale-95' : '',
      hasConflict ? 'ring-2 ring-red-400 ring-offset-2' : ''
    ]"
    :draggable="draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="$emit('click', session)"
  >
    <!-- Session Type Icon -->
    <div class="flex items-start justify-between mb-2 flex-shrink-0">
      <div class="flex items-center space-x-2 min-w-0 flex-1">
        <div :class="['p-1.5 rounded-lg flex-shrink-0', getSessionTypeClass(session.type).iconBg]">
          <div :class="['w-4 h-4', getSessionTypeClass(session.type).iconColor]">
            <!-- Keynote Icon -->
            <svg v-if="session.type === 'keynote'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <!-- Panel Icon -->
            <svg v-else-if="session.type === 'panel'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Lunch Icon -->
            <svg v-else-if="session.type === 'lunch'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <!-- Break/Tea Icon -->
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-semibold text-sm text-chatgpt-text group-hover:text-indigo-700 transition-colors line-clamp-1">
            {{ session.title }}
          </h4>
          <span :class="['text-xs font-medium px-1.5 py-0.5 rounded-full', getSessionTypeClass(session.type).badge]">
            {{ formatSessionType(session.type) }}
          </span>
        </div>
      </div>
      
      <!-- Conflict Warning -->
      <div v-if="hasConflict" class="flex-shrink-0" title="Time or speaker conflict">
        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Time -->
    <div class="flex items-center space-x-1 text-xs text-chatgpt-text-light mb-2 flex-shrink-0">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="whitespace-nowrap">{{ formatTime(session.start_time) }} - {{ formatTime(session.end_time) }}</span>
    </div>

    <!-- Speaker/Moderator -->
    <div v-if="session.speaker || session.moderator" class="mb-2 flex-shrink-0">
      <div v-if="session.speaker" class="flex items-center space-x-1.5">
        <div class="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
          <span class="text-xs font-medium text-indigo-700">
            {{ getInitials(session.speaker.name) }}
          </span>
        </div>
        <span class="text-xs text-chatgpt-text truncate">{{ session.speaker.name }}</span>
      </div>
      <div v-if="session.moderator" class="flex items-center space-x-1 mt-1">
        <span class="text-xs font-medium text-chatgpt-text-light">Mod:</span>
        <span class="text-xs text-chatgpt-text truncate">{{ session.moderator.name }}</span>
      </div>
    </div>

    <!-- Panelists (Compact) -->
    <div v-if="session.panelists && session.panelists.length > 0" class="mb-2 flex-shrink-0">
      <div class="flex items-center flex-wrap gap-1">
        <span class="text-xs font-medium text-chatgpt-text-light">Panel:</span>
        <div
          v-for="(panelist, idx) in session.panelists.slice(0, 3)"
          :key="panelist.id"
          class="flex items-center"
        >
          <div class="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
            <span class="text-xs font-medium text-purple-700 text-[10px]">
              {{ getInitials(panelist.name) }}
            </span>
          </div>
        </div>
        <span v-if="session.panelists.length > 3" class="text-xs text-chatgpt-text-light">
          +{{ session.panelists.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Location -->
    <div v-if="session.location || session.hall" class="flex items-center space-x-1 text-xs text-chatgpt-text-light mt-auto flex-shrink-0">
      <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="truncate">{{ session.hall || session.location }}</span>
    </div>

    <!-- Description Preview (Hidden in compact mode, shown on hover) -->
    <p v-if="session.description" class="text-xs text-chatgpt-text-light mt-1 line-clamp-1 hidden group-hover:block absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded border border-chatgpt-border shadow-lg z-50">
      {{ session.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Session } from '@/app/store/programme'

interface Props {
  session: Session
  draggable?: boolean
  hasConflict?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  draggable: true,
  hasConflict: false,
})

const emit = defineEmits<{
  click: [session: Session]
  dragStart: [session: Session, event: DragEvent]
  dragEnd: [session: Session]
}>()

const isDragging = ref(false)

function getSessionTypeClass(type: string) {
  const classes = {
    keynote: {
      card: 'border-indigo-300 bg-indigo-50 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      badge: 'bg-indigo-200 text-indigo-800',
    },
    panel: {
      card: 'border-purple-300 bg-purple-50 hover:border-purple-400',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badge: 'bg-purple-200 text-purple-800',
    },
    break: {
      card: 'border-gray-300 bg-gray-50 hover:border-gray-400',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      badge: 'bg-gray-200 text-gray-800',
    },
    lunch: {
      card: 'border-orange-300 bg-orange-50 hover:border-orange-400',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badge: 'bg-orange-200 text-orange-800',
    },
    tea: {
      card: 'border-amber-300 bg-amber-50 hover:border-amber-400',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      badge: 'bg-amber-200 text-amber-800',
    },
  }
  return classes[type as keyof typeof classes] || classes.break
}


function formatSessionType(type: string): string {
  const types: Record<string, string> = {
    keynote: 'Keynote',
    panel: 'Panel Discussion',
    break: 'Break',
    lunch: 'Lunch',
    tea: 'Evening Tea',
  }
  return types[type] || type
}

function formatTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getDuration(session: Session): string {
  const start = new Date(session.start_time).getTime()
  const end = new Date(session.end_time).getTime()
  const minutes = Math.round((end - start) / (1000 * 60))
  
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleDragStart(event: DragEvent) {
  if (!props.draggable) return
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('sessionId', String(props.session.id))
  }
  emit('dragStart', props.session, event)
}

function handleDragEnd() {
  isDragging.value = false
  emit('dragEnd', props.session)
}
</script>
