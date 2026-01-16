<template>
  <svg
    viewBox="0 0 800 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="w-full h-auto"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- Background circle -->
    <circle cx="400" cy="300" r="250" fill="#f3f4f6" opacity="0.5" />
    
    <!-- Calendar icon -->
    <g transform="translate(200, 100)">
      <rect x="0" y="0" width="120" height="140" rx="8" fill="white" stroke="#9ca3af" stroke-width="2" />
      <rect x="0" y="0" width="120" height="40" rx="8" fill="#6366f1" />
      <text x="60" y="25" text-anchor="middle" fill="white" font-size="20" font-weight="bold">EVENT</text>
      <circle cx="30" cy="80" r="8" fill="#6366f1" />
      <circle cx="60" cy="80" r="8" fill="#6366f1" />
      <circle cx="90" cy="80" r="8" fill="#6366f1" />
      <line x1="20" y1="110" x2="100" y2="110" stroke="#9ca3af" stroke-width="2" />
      <line x1="20" y1="125" x2="80" y2="125" stroke="#9ca3af" stroke-width="1.5" />
    </g>
    
    <!-- People/participants -->
    <g transform="translate(500, 150)">
      <!-- Person 1 -->
      <circle cx="0" cy="0" r="25" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2" />
      <circle cx="0" cy="-5" r="12" fill="#6366f1" />
      <rect x="-15" y="15" width="30" height="40" rx="15" fill="#6366f1" />
      
      <!-- Person 2 -->
      <circle cx="60" cy="0" r="25" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2" />
      <circle cx="60" cy="-5" r="12" fill="#10b981" />
      <rect x="45" y="15" width="30" height="40" rx="15" fill="#10b981" />
      
      <!-- Person 3 -->
      <circle cx="120" cy="0" r="25" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2" />
      <circle cx="120" cy="-5" r="12" fill="#f59e0b" />
      <rect x="105" y="15" width="30" height="40" rx="15" fill="#f59e0b" />
    </g>
    
    <!-- Checkpoint/check-in icon -->
    <g transform="translate(350, 400)">
      <circle cx="0" cy="0" r="50" fill="white" stroke="#6366f1" stroke-width="3" />
      <path d="M -15 -5 L -5 5 L 15 -15" stroke="#6366f1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>
    
    <!-- Connection lines -->
    <path d="M 320 240 L 500 180" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5" opacity="0.5" />
    <path d="M 400 350 L 400 400" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5" opacity="0.5" />
    
    <!-- Stats/chart icon -->
    <g transform="translate(150, 450)">
      <rect x="0" y="0" width="80" height="60" rx="4" fill="white" stroke="#9ca3af" stroke-width="2" />
      <rect x="10" y="40" width="15" height="15" fill="#6366f1" />
      <rect x="30" y="30" width="15" height="25" fill="#10b981" />
      <rect x="50" y="20" width="15" height="35" fill="#f59e0b" />
      <text x="40" y="75" text-anchor="middle" fill="#6b7280" font-size="10">Reports</text>
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  ariaLabel?: string
}>(), {
  ariaLabel: 'Events management illustration showing calendar, participants, check-ins, and reports'
})
</script>
