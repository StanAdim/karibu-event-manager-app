<template>
  <div class="min-h-screen bg-white">
    <!-- Sticky Navigation -->
    <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-chatgpt-border">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-chatgpt-text">Karibu Events</h1>
          </div>
          <div class="flex items-center space-x-4">
            <a
              href="#features"
              class="hidden md:block text-sm text-chatgpt-text-light hover:text-chatgpt-text transition-colors"
            >
              Features
            </a>
            <router-link
              to="/login"
              class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium text-sm"
            >
              Login
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-chatgpt-bg to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div class="text-center lg:text-left">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-chatgpt-text mb-6 leading-tight">
              Effortless Events &<br />
              <span class="text-chatgpt-text">Participant Management</span>
            </h1>
            <p class="text-lg md:text-xl text-chatgpt-text-light mb-8 max-w-2xl mx-auto lg:mx-0">
              Plan, manage and track events, participants, and check-ins — all in one place.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <router-link
                to="/login"
                class="w-full sm:w-auto px-8 py-3 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-base shadow-sm hover:shadow-md"
              >
                Get Started
              </router-link>
              <a
                href="#features"
                class="w-full sm:w-auto px-8 py-3 border-2 border-chatgpt-border text-chatgpt-text rounded-lg hover:bg-gray-50 transition-colors font-semibold text-base"
              >
                Learn More
              </a>
            </div>
          </div>

          <!-- Illustration -->
          <div class="flex items-center justify-center lg:justify-end">
            <div class="w-full max-w-lg animate-fade-in">
              <EventsIllustration />
            </div>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="flex justify-center mt-12 animate-bounce">
          <a href="#features" class="text-chatgpt-text-light hover:text-chatgpt-text transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-chatgpt-text mb-4">
            Everything You Need to Manage Events
          </h2>
          <p class="text-lg text-chatgpt-text-light max-w-2xl mx-auto">
            Powerful features designed to streamline your event management workflow
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Feature 1: Event Planning -->
          <div class="bg-white rounded-lg border border-chatgpt-border p-6 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-chatgpt-text mb-2">
              Event Planning & Scheduling
            </h3>
            <p class="text-chatgpt-text-light">
              Create and manage events with detailed scheduling, locations, and status tracking.
            </p>
          </div>

          <!-- Feature 2: Participant Management -->
          <div class="bg-white rounded-lg border border-chatgpt-border p-6 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-chatgpt-text mb-2">
              Participant Registration & Tracking
            </h3>
            <p class="text-chatgpt-text-light">
              Register participants, manage their information, and track attendance across events.
            </p>
          </div>

          <!-- Feature 3: Check-ins -->
          <div class="bg-white rounded-lg border border-chatgpt-border p-6 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-chatgpt-text mb-2">
              Real-Time Check-ins
            </h3>
            <p class="text-chatgpt-text-light">
              Monitor participant check-ins in real-time with checkpoint management and status updates.
            </p>
          </div>

          <!-- Feature 4: Reports -->
          <div class="bg-white rounded-lg border border-chatgpt-border p-6 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-chatgpt-text mb-2">
              Reports & Insights
            </h3>
            <p class="text-chatgpt-text-light">
              Generate comprehensive reports with statistics, attendance data, and event analytics.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-chatgpt-bg">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-chatgpt-text mb-4">
          Ready to Get Started?
        </h2>
        <p class="text-lg text-chatgpt-text-light mb-8">
          Join thousands of event organizers who trust Karibu Events to manage their events.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link
            to="/login"
            class="px-8 py-3 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-base shadow-sm hover:shadow-md"
          >
            Login to Start
          </router-link>
          <router-link
            to="/login"
            class="px-8 py-3 border-2 border-chatgpt-text text-chatgpt-text rounded-lg hover:bg-chatgpt-text hover:text-white transition-colors font-semibold text-base"
          >
            Explore Dashboard
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-white border-t border-chatgpt-border py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-chatgpt-text-light">
          <p>&copy; 2024 Karibu Event Management. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import EventsIllustration from '@/components/common/EventsIllustration.vue'
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
