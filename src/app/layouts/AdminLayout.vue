<template>
  <div class="flex h-screen bg-chatgpt-bg">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 h-full bg-white border-r border-chatgpt-border transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-16' : 'w-64'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo/Title -->
        <div class="h-16 flex items-center justify-center border-b border-chatgpt-border px-4">
          <span v-if="!sidebarCollapsed" class="text-lg font-semibold text-chatgpt-text">
            Karibu Events
          </span>
          <span v-else class="text-lg font-semibold text-chatgpt-text">KE</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-2">
            <li>
              <router-link
                to="/dashboard"
                class="flex items-center px-3 py-2 rounded-lg text-sm text-chatgpt-text hover:bg-gray-100 transition-colors"
                :class="{ 'bg-gray-100 font-medium': $route.path === '/dashboard' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span v-if="!sidebarCollapsed">Dashboard</span>
              </router-link>
            </li>

            <!-- Events -->
            <li v-if="canReadEvents">
              <div class="px-3 py-2">
                <button
                  @click="toggleEventsMenu"
                  class="flex items-center w-full text-sm text-chatgpt-text hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span v-if="!sidebarCollapsed" class="flex-1 text-left">Events</span>
                  <svg
                    v-if="!sidebarCollapsed"
                    :class="['w-4 h-4 transition-transform', eventsMenuOpen ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <ul
                  v-if="eventsMenuOpen && !sidebarCollapsed"
                  class="mt-1 ml-8 space-y-1"
                >
                  <li>
                    <router-link
                      to="/events"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/events' && !$route.params.id && !$route.path.includes('create') }"
                    >
                      Event List
                    </router-link>
                  </li>
                </ul>
              </div>
            </li>

            <!-- Participants -->
            <li v-if="canReadParticipants">
              <div class="px-3 py-2">
                <button
                  @click="toggleParticipantsMenu"
                  class="flex items-center w-full text-sm text-chatgpt-text hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span v-if="!sidebarCollapsed" class="flex-1 text-left">Participants</span>
                  <svg
                    v-if="!sidebarCollapsed"
                    :class="['w-4 h-4 transition-transform', participantsMenuOpen ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <ul
                  v-if="participantsMenuOpen && !sidebarCollapsed"
                  class="mt-1 ml-8 space-y-1"
                >
                  <li>
                    <router-link
                      to="/participants"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/participants' && !$route.params.id && !$route.path.includes('create') }"
                    >
                      Participant List
                    </router-link>
                  </li>
                </ul>
              </div>
            </li>

            <!-- Checkpoints -->
            <li v-if="canReadCheckpoints">
              <div class="px-3 py-2">
                <button
                  @click="toggleCheckpointsMenu"
                  class="flex items-center w-full text-sm text-chatgpt-text hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span v-if="!sidebarCollapsed" class="flex-1 text-left">Checkpoints</span>
                  <svg
                    v-if="!sidebarCollapsed"
                    :class="['w-4 h-4 transition-transform', checkpointsMenuOpen ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <ul
                  v-if="checkpointsMenuOpen && !sidebarCollapsed"
                  class="mt-1 ml-8 space-y-1"
                >
                  <li>
                    <router-link
                      to="/checkpoints"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/checkpoints' && !$route.params.id && !$route.path.includes('create') }"
                    >
                      Checkpoint List
                    </router-link>
                  </li>
                </ul>
              </div>
            </li>

            <!-- Reports -->
            <li v-if="canViewReports">
              <router-link
                to="/reports"
                class="flex items-center px-3 py-2 rounded-lg text-sm text-chatgpt-text hover:bg-gray-100 transition-colors"
                :class="{ 'bg-gray-100 font-medium': $route.path === '/reports' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span v-if="!sidebarCollapsed">Reports</span>
              </router-link>
            </li>

            <!-- Access Management -->
            <li v-if="canAccessAccessManagement">
              <div class="px-3 py-2">
                <button
                  @click="toggleAccessManagementMenu"
                  class="flex items-center w-full text-sm text-chatgpt-text hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span v-if="!sidebarCollapsed" class="flex-1 text-left">Access Management</span>
                  <svg
                    v-if="!sidebarCollapsed"
                    :class="['w-4 h-4 transition-transform', accessManagementMenuOpen ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <ul
                  v-if="accessManagementMenuOpen && !sidebarCollapsed"
                  class="mt-1 ml-8 space-y-1"
                >
                  <li v-if="canAccessUsers">
                    <router-link
                      to="/users"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/users' && !$route.params.id }"
                    >
                      Users
                    </router-link>
                  </li>
                  <li v-if="canAccessRoles">
                    <router-link
                      to="/roles"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/roles' && !$route.params.id }"
                    >
                      Roles
                    </router-link>
                  </li>
                  <li v-if="canAccessPermissions">
                    <router-link
                      to="/permissions"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/permissions' }"
                    >
                      Permissions
                    </router-link>
                  </li>
                  <li v-if="canManageCheckpointTypes || hasRole('super-admin')">
                    <router-link
                      to="/checkpoint-types"
                      class="block px-3 py-2 rounded-lg text-sm text-chatgpt-text-light hover:bg-gray-100 transition-colors"
                      :class="{ 'bg-gray-100 text-chatgpt-text font-medium': $route.path === '/checkpoint-types' }"
                    >
                      Checkpoint Types
                    </router-link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        <!-- Logout -->
        <div class="border-t border-chatgpt-border p-4">
          <button
            @click="handleLogout"
            class="flex items-center w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span v-if="!sidebarCollapsed">Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div
      :class="[
        'flex-1 flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      ]"
    >
      <!-- Header -->
      <header class="h-16 bg-white border-b border-chatgpt-border flex items-center justify-between px-6 sticky top-0 z-20">
        <div class="flex items-center space-x-4">
          <button
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 text-chatgpt-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-chatgpt-text">Karibu Event Management</h1>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-chatgpt-text-light">{{ authStore.user?.name || 'User' }}</span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <Breadcrumbs />
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useAuth } from '../composables/useAuth'
import { usePermissions } from '../composables/usePermissions'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

const route = useRoute()
const authStore = useAuthStore()
const { logout } = useAuth()
const {
  canAccessUsers,
  canAccessRoles,
  canAccessPermissions,
  canAccessAccessManagement,
  canReadEvents,
  canReadParticipants,
  canReadCheckpoints,
  canViewReports,
  canManageCheckpointTypes,
  hasRole,
} = usePermissions()

const sidebarCollapsed = ref(false)
const eventsMenuOpen = ref(false)
const participantsMenuOpen = ref(false)
const checkpointsMenuOpen = ref(false)
const accessManagementMenuOpen = ref(false)

// Auto-expand menus based on current route
watch(() => route.path, (path) => {
  eventsMenuOpen.value = path.startsWith('/events')
  participantsMenuOpen.value = path.startsWith('/participants')
  checkpointsMenuOpen.value = path.startsWith('/checkpoints')
  accessManagementMenuOpen.value = path.startsWith('/users') || path.startsWith('/roles') || path.startsWith('/permissions') || path.startsWith('/checkpoint-types')
}, { immediate: true })

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleEventsMenu() {
  eventsMenuOpen.value = !eventsMenuOpen.value
}

function toggleParticipantsMenu() {
  participantsMenuOpen.value = !participantsMenuOpen.value
}

function toggleCheckpointsMenu() {
  checkpointsMenuOpen.value = !checkpointsMenuOpen.value
}

function toggleAccessManagementMenu() {
  accessManagementMenuOpen.value = !accessManagementMenuOpen.value
}

function handleLogout() {
  logout()
}
</script>
