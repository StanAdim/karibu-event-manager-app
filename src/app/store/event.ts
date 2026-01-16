import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Event {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateEventDto {
  name: string
  description?: string
  startDate: string
  endDate: string
  location?: string
}

export const useEventStore = defineStore('event', () => {
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)

  async function fetchEvents() {
    loading.value = true
    try {
      const response = await api.get<Event[]>('/events')
      events.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchEventById(id: string) {
    loading.value = true
    try {
      const response = await api.get<Event>(`/events/${id}`)
      currentEvent.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data: CreateEventDto) {
    loading.value = true
    try {
      const response = await api.post<Event>('/events', data)
      events.value.push(response.data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string, data: Partial<CreateEventDto>) {
    loading.value = true
    try {
      const response = await api.put<Event>(`/events/${id}`, data)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = response.data
      }
      if (currentEvent.value?.id === id) {
        currentEvent.value = response.data
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(id: string) {
    loading.value = true
    try {
      await api.delete(`/events/${id}`)
      events.value = events.value.filter(e => e.id !== id)
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    currentEvent,
    loading,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
  }
})
