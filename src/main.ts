import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'
import { useAuthStore } from './app/store/auth'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth on app load
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  app.mount('#app')
}).catch(() => {
  // Even if initialization fails, mount the app
  app.mount('#app')
})
