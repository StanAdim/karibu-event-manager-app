<template>
  <div class="min-h-screen flex items-center justify-center bg-chatgpt-bg">
    <div class="text-center px-4">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-chatgpt-text mb-4">404</h1>
        <h2 class="text-3xl font-semibold text-chatgpt-text mb-4">Page Not Found</h2>
        <p class="text-lg text-chatgpt-text-light mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/dashboard"
          class="px-6 py-3 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          Go to Dashboard
        </router-link>
        <button
          @click="$router.go(-1)"
          class="px-6 py-3 bg-white border border-chatgpt-border text-chatgpt-text rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Not Found page
</script>
