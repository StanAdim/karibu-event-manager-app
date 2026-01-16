<template>
  <div class="min-h-screen bg-chatgpt-bg flex flex-col items-center justify-center px-4">
    <div class="max-w-2xl w-full text-center">
      <h1 class="text-5xl font-bold text-chatgpt-text mb-4">
        Karibu Event Management
      </h1>
      <p class="text-xl text-chatgpt-text-light mb-8">
        Streamline your events with our comprehensive management platform
      </p>
      <router-link
        to="/login"
        class="inline-block px-8 py-3 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
      >
        Login
      </router-link>
    </div>
    <footer class="mt-16 text-sm text-chatgpt-text-light">
      <p>&copy; 2024 Karibu Event Management. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
