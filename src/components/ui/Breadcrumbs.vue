<template>
  <nav class="flex items-center space-x-2 text-sm text-chatgpt-text-light mb-4">
    <router-link
      v-for="(crumb, index) in crumbs"
      :key="index"
      :to="crumb.to"
      class="hover:text-chatgpt-text transition-colors"
    >
      {{ crumb.label }}
    </router-link>
    <span v-if="crumbs.length > 0" class="text-chatgpt-text-light">/</span>
    <span class="text-chatgpt-text">{{ currentLabel }}</span>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Breadcrumb {
  label: string
  to: string
}

const route = useRoute()

const crumbs = computed<Breadcrumb[]>(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbs: Breadcrumb[] = []
  
  if (pathSegments.length > 0 && pathSegments[0] !== 'dashboard') {
    breadcrumbs.push({ label: 'Dashboard', to: '/dashboard' })
  }
  
  let currentPath = ''
  for (let i = 0; i < pathSegments.length - 1; i++) {
    currentPath += `/${pathSegments[i]}`
    const segment = pathSegments[i]
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({ label, to: currentPath })
  }
  
  return breadcrumbs
})

const currentLabel = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length === 0) return 'Dashboard'
  
  const lastSegment = pathSegments[pathSegments.length - 1]
  if (lastSegment === 'create') return 'Create'
  if (lastSegment === 'dashboard') return 'Dashboard'
  if (!isNaN(Number(lastSegment))) {
    // It's an ID, get the name from route meta or use a generic label
    const parent = pathSegments[pathSegments.length - 2]
    return parent ? `${parent.charAt(0).toUpperCase() + parent.slice(1)} Details` : 'Details'
  }
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
})
</script>
