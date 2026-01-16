<template>
  <AdminLayout>
    <div>
      <h2 class="text-2xl font-semibold text-chatgpt-text mb-6">Create Checkpoint</h2>

      <div class="bg-white rounded-lg border border-chatgpt-border p-6 max-w-2xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-chatgpt-text mb-2">
              Checkpoint Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter checkpoint name"
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-chatgpt-text mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
              placeholder="Enter checkpoint description"
            />
          </div>

          <div>
            <label for="eventId" class="block text-sm font-medium text-chatgpt-text mb-2">
              Event <span class="text-red-500">*</span>
            </label>
            <select
              id="eventId"
              v-model="form.eventId"
              required
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="location" class="block text-sm font-medium text-chatgpt-text mb-2">
                Location
              </label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
                placeholder="Enter checkpoint location"
              />
            </div>

            <div>
              <label for="order" class="block text-sm font-medium text-chatgpt-text mb-2">
                Order
              </label>
              <input
                id="order"
                v-model.number="form.order"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-chatgpt-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chatgpt-text focus:border-transparent"
                placeholder="Enter order number"
              />
            </div>
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
              <span v-if="loading">Creating...</span>
              <span v-else>Create Checkpoint</span>
            </button>
            <router-link
              to="/checkpoints"
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
import { useCheckpointStore, type CreateCheckpointDto } from '@/app/store/checkpoint'
import { useEventStore } from '@/app/store/event'

const router = useRouter()
const checkpointStore = useCheckpointStore()
const eventStore = useEventStore()

const form = ref<CreateCheckpointDto>({
  name: '',
  description: '',
  eventId: '',
  location: '',
  order: undefined,
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
    const checkpoint = await checkpointStore.createCheckpoint(form.value)
    router.push(`/checkpoints/${checkpoint.id}`)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create checkpoint. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
