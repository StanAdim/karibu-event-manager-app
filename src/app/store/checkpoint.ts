import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Checkpoint {
  id: string | number
  name: string
  description?: string
  checkpoint_type_id?: string | number
  checkpointTypeId?: string | number
  type?: string
  event_id?: string | number
  eventId?: string | number
  location?: string
  order?: number
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  [key: string]: any
}

export interface CreateCheckpointDto {
  name: string
  description?: string
  checkpoint_type_id: string | number
  eventId: string | number
  location?: string
  order?: number | undefined
}

export const useCheckpointStore = defineStore('checkpoint', () => {
  const checkpoints = ref<Checkpoint[]>([])
  const currentCheckpoint = ref<Checkpoint | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize checkpoint data from API
  function normalizeCheckpoint(checkpoint: Checkpoint): Checkpoint {
    return {
      ...checkpoint,
      checkpointTypeId: checkpoint.checkpoint_type_id || checkpoint.checkpointTypeId,
      eventId: checkpoint.event_id || checkpoint.eventId,
      createdAt: checkpoint.created_at || checkpoint.createdAt,
      updatedAt: checkpoint.updated_at || checkpoint.updatedAt,
    }
  }

  // Normalize create/update payload for API
  function normalizePayload(data: CreateCheckpointDto): any {
    return {
      name: data.name,
      description: data.description,
      checkpoint_type_id: typeof data.checkpoint_type_id === 'string' ? Number(data.checkpoint_type_id) : data.checkpoint_type_id,
      location: data.location,
      order: data.order,
    }
  }

  async function fetchCheckpoints(eventId: string | number) {
    if (!eventId) {
      checkpoints.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Checkpoint[] } | Checkpoint[]>(
        `/api/v1/events/${eventId}/checkpoints`
      )
      const checkpointsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      checkpoints.value = checkpointsData.map(normalizeCheckpoint)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch checkpoints'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAllCheckpoints() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Checkpoint[] } | Checkpoint[]>(
        '/api/v1/checkpoints/all'
      )
      const checkpointsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      checkpoints.value = checkpointsData.map(normalizeCheckpoint)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch checkpoints'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCheckpointById(eventId: string | number, checkpointId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Checkpoint } | Checkpoint>(
        `/api/v1/events/${eventId}/checkpoints/${checkpointId}`
      )
      const checkpointData = (response.data as any)?.data || response.data
      currentCheckpoint.value = normalizeCheckpoint(checkpointData as Checkpoint)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch checkpoint'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCheckpoint(data: CreateCheckpointDto) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data)
      const response = await api.post<{ data?: Checkpoint } | Checkpoint>(
        `/api/v1/events/${data.eventId}/checkpoints`,
        payload
      )
      const checkpointData = (response.data as any)?.data || response.data
      const newCheckpoint = normalizeCheckpoint(checkpointData as Checkpoint)
      checkpoints.value.push(newCheckpoint)
      return newCheckpoint
    } catch (err: any) {
      error.value = err.message || 'Failed to create checkpoint'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCheckpoint(
    eventId: string | number,
    checkpointId: string | number,
    data: Partial<CreateCheckpointDto>
  ) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data as CreateCheckpointDto)
      const response = await api.put<{ data?: Checkpoint } | Checkpoint>(
        `/api/v1/events/${eventId}/checkpoints/${checkpointId}`,
        payload
      )
      const checkpointData = (response.data as any)?.data || response.data
      const updatedCheckpoint = normalizeCheckpoint(checkpointData as Checkpoint)
      
      const index = checkpoints.value.findIndex(c => c.id === checkpointId)
      if (index !== -1) {
        checkpoints.value[index] = updatedCheckpoint
      }
      if (currentCheckpoint.value?.id === checkpointId) {
        currentCheckpoint.value = updatedCheckpoint
      }
      return updatedCheckpoint
    } catch (err: any) {
      error.value = err.message || 'Failed to update checkpoint'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCheckpoint(eventId: string | number, checkpointId: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/events/${eventId}/checkpoints/${checkpointId}`)
      checkpoints.value = checkpoints.value.filter(c => c.id !== checkpointId)
      if (currentCheckpoint.value?.id === checkpointId) {
        currentCheckpoint.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete checkpoint'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    checkpoints,
    currentCheckpoint,
    loading,
    error,
    fetchCheckpoints,
    fetchAllCheckpoints,
    fetchCheckpointById,
    createCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
  }
})
