import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: () => import('@/pages/LandingPage.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events',
      name: 'EventList',
      component: () => import('@/pages/Events/EventList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:id',
      name: 'EventDetail',
      component: () => import('@/pages/Events/EventDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:eventId/participants',
      name: 'EventParticipants',
      component: () => import('@/pages/Events/EventParticipants.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:eventId/checkpoints',
      name: 'EventCheckpoints',
      component: () => import('@/pages/Events/EventCheckpoints.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:eventId/programme',
      name: 'EventProgramme',
      component: () => import('@/pages/Events/EventProgramme.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/participants',
      name: 'ParticipantList',
      component: () => import('@/pages/Participants/ParticipantList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/participants/:id',
      name: 'ParticipantDetail',
      component: () => import('@/pages/Participants/ParticipantDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkpoints',
      name: 'CheckpointList',
      component: () => import('@/pages/Checkpoints/CheckpointList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkpoints/:id',
      name: 'CheckpointDetail',
      component: () => import('@/pages/Checkpoints/CheckpointDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'EventReports',
      component: () => import('@/pages/Reports/EventReports.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'UserList',
      component: () => import('@/pages/Users/UserList.vue'),
      meta: { requiresAuth: true, permission: 'users.read' },
    },
    {
      path: '/users/:id',
      name: 'UserDetail',
      component: () => import('@/pages/Users/UserDetail.vue'),
      meta: { requiresAuth: true, permission: 'users.read' },
    },
    {
      path: '/roles',
      name: 'RoleList',
      component: () => import('@/pages/Roles/RoleList.vue'),
      meta: { requiresAuth: true, permission: 'roles.read' },
    },
    {
      path: '/roles/:id',
      name: 'RoleDetail',
      component: () => import('@/pages/Roles/RoleDetail.vue'),
      meta: { requiresAuth: true, permission: 'roles.read' },
    },
    {
      path: '/permissions',
      name: 'PermissionList',
      component: () => import('@/pages/Permissions/PermissionList.vue'),
      meta: { requiresAuth: true, permission: 'permissions.read' },
    },
    {
      path: '/checkpoint-types',
      name: 'CheckpointTypeList',
      component: () => import('@/pages/CheckpointTypes/CheckpointTypeList.vue'),
      meta: { requiresAuth: true },
    },
    // 404 catch-all route - must be last
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFound.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // If authenticated but user data is missing, fetch it
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // If fetch fails, user might not be authenticated anymore
      console.error('Failed to fetch user in route guard:', error)
    }
  }
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Redirect authenticated users away from login
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // Check permissions
  if (to.meta.permission) {
    const requiredPermission = to.meta.permission as string
    if (!authStore.hasPermission(requiredPermission)) {
      // Redirect to dashboard with error message
      next({
        path: '/dashboard',
        query: { error: 'You do not have permission to access this page' }
      })
      return
    }
  }
  
  next()
})

export default router
