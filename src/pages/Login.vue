<template>
  <div class="min-h-screen bg-chatgpt-bg flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg border border-chatgpt-border p-8 shadow-sm">
        <h2 class="text-2xl font-semibold text-chatgpt-text mb-6 text-center">
          Login to Your Account
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-chatgpt-text mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-chatgpt-text mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="rounded border-chatgpt-border text-chatgpt-text focus:ring-chatgpt-text"
              />
              <span class="ml-2 text-sm text-chatgpt-text-light">Remember me</span>
            </label>
            <a href="#" class="text-sm text-chatgpt-text hover:underline">
              Forgot Password?
            </a>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link
            to="/"
            class="text-sm text-chatgpt-text-light hover:text-chatgpt-text transition-colors"
          >
            ← Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/app/composables/useAuth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const { login } = useAuth()

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    await login(email.value, password.value)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
