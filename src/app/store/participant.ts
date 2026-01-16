import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  eventId?: string
  checkedIn?: boolean
  checkInTime?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateParticipantDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  eventId?: string
}

export const useParticipantStore = defineStore('participant', () => {
  const participants = ref<Participant[]>([])
  const currentParticipant = ref<Participant | null>(null)
  const loading = ref(false)

  async function fetchParticipants(eventId?: string) {
    loading.value = true
    try {
      const url = eventId ? `/participants?eventId=${eventId}` : '/participants'
      const response = await api.get<Participant[]>(url)
      participants.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchParticipantById(id: string) {
    loading.value = true
    try {
      const response = await api.get<Participant>(`/participants/${id}`)
      currentParticipant.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createParticipant(data: CreateParticipantDto) {
    loading.value = true
    try {
      const response = await api.post<Participant>('/participants', data)
      participants.value.push(response.data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateParticipant(id: string, data: Partial<CreateParticipantDto>) {
    loading.value = true
    try {
      const response = await api.put<Participant>(`/participants/${id}`, data)
      const index = participants.value.findIndex(p => p.id === id)
      if (index !== -1) {
        participants.value[index] = response.data
      }
      if (currentParticipant.value?.id === id) {
        currentParticipant.value = response.data
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteParticipant(id: string) {
    loading.value = true
    try {
      await api.delete(`/participants/${id}`)
      participants.value = participants.value.filter(p => p.id !== id)
      if (currentParticipant.value?.id === id) {
        currentParticipant.value = null
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function checkInParticipant(id: string) {
    loading.value = true
    try {
      const response = await api.post<Participant>(`/participants/${id}/checkin`)
      const index = participants.value.findIndex(p => p.id === id)
      if (index !== -1) {
        participants.value[index] = response.data
      }
      if (currentParticipant.value?.id === id) {
        currentParticipant.value = response.data
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    participants,
    currentParticipant,
    loading,
    fetchParticipants,
    fetchParticipantById,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    checkInParticipant,
  }
})
