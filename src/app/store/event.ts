import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Event {
  id: string | number
  name: string
  description?: string
  start_date?: string
  startDate?: string
  end_date?: string
  endDate?: string
  location?: string
  status?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  [key: string]: any
}

export interface CreateEventDto {
  name: string
  description?: string
  start_date?: string
  startDate?: string
  end_date?: string
  endDate?: string
  location?: string
  status?: string
}

export const useEventStore = defineStore('event', () => {
  const events = ref<Event[]>([])
  const currentEvent = ref<Event | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize event data from API
  function normalizeEvent(event: Event): Event {
    return {
      ...event,
      startDate: event.start_date || event.startDate,
      endDate: event.end_date || event.endDate,
      createdAt: event.created_at || event.createdAt,
      updatedAt: event.updated_at || event.updatedAt,
    }
  }

  // Normalize create/update payload for API
  function normalizePayload(data: CreateEventDto): any {
    return {
      name: data.name,
      description: data.description,
      start_date: data.start_date || data.startDate,
      end_date: data.end_date || data.endDate,
      location: data.location,
      status: data.status,
    }
  }

  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Event[] } | Event[]>('/api/v1/events')
      const eventsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as any)?.data || []
      events.value = eventsData.map(normalizeEvent)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch events'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventById(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Event } | Event>(`/api/v1/events/${id}`)
      const eventData = (response.data as any)?.data || response.data
      currentEvent.value = normalizeEvent(eventData as Event)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data: CreateEventDto) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data)
      const response = await api.post<{ data?: Event } | Event>('/api/v1/events', payload)
      const eventData = (response.data as any)?.data || response.data
      const newEvent = normalizeEvent(eventData as Event)
      events.value.push(newEvent)
      return newEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id: string | number, data: Partial<CreateEventDto>) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data as CreateEventDto)
      const response = await api.put<{ data?: Event } | Event>(`/api/v1/events/${id}`, payload)
      const eventData = (response.data as any)?.data || response.data
      const updatedEvent = normalizeEvent(eventData as Event)
      
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = updatedEvent
      }
      if (currentEvent.value?.id === id) {
        currentEvent.value = updatedEvent
      }
      return updatedEvent
    } catch (err: any) {
      error.value = err.message || 'Failed to update event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/events/${id}`)
      events.value = events.value.filter(e => e.id !== id)
      if (currentEvent.value?.id === id) {
        currentEvent.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    currentEvent,
    loading,
    error,
    fetchEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
  }
})
