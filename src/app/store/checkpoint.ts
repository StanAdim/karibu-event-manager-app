import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Checkpoint {
  id: string
  name: string
  description?: string
  eventId: string
  location?: string
  order?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateCheckpointDto {
  name: string
  description?: string
  eventId: string
  location?: string
  order?: number
}

export const useCheckpointStore = defineStore('checkpoint', () => {
  const checkpoints = ref<Checkpoint[]>([])
  const currentCheckpoint = ref<Checkpoint | null>(null)
  const loading = ref(false)

  async function fetchCheckpoints(eventId?: string) {
    loading.value = true
    try {
      const url = eventId ? `/checkpoints?eventId=${eventId}` : '/checkpoints'
      const response = await api.get<Checkpoint[]>(url)
      checkpoints.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchCheckpointById(id: string) {
    loading.value = true
    try {
      const response = await api.get<Checkpoint>(`/checkpoints/${id}`)
      currentCheckpoint.value = response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createCheckpoint(data: CreateCheckpointDto) {
    loading.value = true
    try {
      const response = await api.post<Checkpoint>('/checkpoints', data)
      checkpoints.value.push(response.data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateCheckpoint(id: string, data: Partial<CreateCheckpointDto>) {
    loading.value = true
    try {
      const response = await api.put<Checkpoint>(`/checkpoints/${id}`, data)
      const index = checkpoints.value.findIndex(c => c.id === id)
      if (index !== -1) {
        checkpoints.value[index] = response.data
      }
      if (currentCheckpoint.value?.id === id) {
        currentCheckpoint.value = response.data
      }
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteCheckpoint(id: string) {
    loading.value = true
    try {
      await api.delete(`/checkpoints/${id}`)
      checkpoints.value = checkpoints.value.filter(c => c.id !== id)
      if (currentCheckpoint.value?.id === id) {
        currentCheckpoint.value = null
      }
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    checkpoints,
    currentCheckpoint,
    loading,
    fetchCheckpoints,
    fetchCheckpointById,
    createCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
  }
})
