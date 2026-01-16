<template>
  <AdminLayout>
    <div>
      <h2 class="text-2xl font-semibold text-chatgpt-text mb-6">Add Participant</h2>

      <div class="bg-white rounded-lg border border-chatgpt-border p-6 max-w-2xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium text-chatgpt-text mb-2">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-chatgpt-text mb-2">
                Last Name <span class="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-chatgpt-text mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-chatgpt-text mb-2">
              Phone
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label for="eventId" class="block text-sm font-medium text-chatgpt-text mb-2">
              Event (Optional)
            </label>
            <select
              id="eventId"
              v-model="form.eventId"
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
            >
              <option value="">Select an event</option>
              <option
                v-for="event in eventStore.events"
                :key="event.id"
                :value="event.id"
              >
                {{ event.name }}
              </option>
            </select>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ error }}
          </div>

          <div class="flex items-center space-x-4">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Adding...</span>
              <span v-else>Add Participant</span>
            </button>
            <router-link
              to="/participants"
              class="px-6 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import { useParticipantStore, type CreateParticipantDto } from '@/app/store/participant'
import { useEventStore } from '@/app/store/event'

const router = useRouter()
const participantStore = useParticipantStore()
const eventStore = useEventStore()

const form = ref<CreateParticipantDto>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  eventId: '',
})

const loading = ref(false)
const error = ref('')

onMounted(() => {
  eventStore.fetchEvents()
})

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const participant = await participantStore.createParticipant(form.value)
    router.push(`/participants/${participant.id}`)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to add participant. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
