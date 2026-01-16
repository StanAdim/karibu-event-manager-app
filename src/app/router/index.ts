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
      path: '/events/create',
      name: 'EventCreate',
      component: () => import('@/pages/Events/EventCreate.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/events/:id',
      name: 'EventDetail',
      component: () => import('@/pages/Events/EventDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/participants',
      name: 'ParticipantList',
      component: () => import('@/pages/Participants/ParticipantList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/participants/create',
      name: 'ParticipantCreate',
      component: () => import('@/pages/Participants/ParticipantCreate.vue'),
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
      path: '/checkpoints/create',
      name: 'CheckpointCreate',
      component: () => import('@/pages/Checkpoints/CheckpointCreate.vue'),
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
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
