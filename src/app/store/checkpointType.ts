import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface CheckpointType {
  id: string | number
  name: string
  description?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  [key: string]: any
}

export interface CreateCheckpointTypeDto {
  name: string
  description?: string
}

export const useCheckpointTypeStore = defineStore('checkpointType', () => {
  const checkpointTypes = ref<CheckpointType[]>([])
  const currentCheckpointType = ref<CheckpointType | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize checkpoint type data from API
  function normalizeCheckpointType(checkpointType: CheckpointType): CheckpointType {
    return {
      ...checkpointType,
      createdAt: checkpointType.created_at || checkpointType.createdAt,
      updatedAt: checkpointType.updated_at || checkpointType.updatedAt,
    }
  }

  async function fetchCheckpointTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: CheckpointType[] } | CheckpointType[]>('/api/v1/checkpoint-types')
      const typesData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      checkpointTypes.value = typesData.map(normalizeCheckpointType)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch checkpoint types'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCheckpointTypeById(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: CheckpointType } | CheckpointType>(`/api/v1/checkpoint-types/${id}`)
      const typeData = (response.data as any)?.data || response.data
      currentCheckpointType.value = normalizeCheckpointType(typeData as CheckpointType)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch checkpoint type'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCheckpointType(data: CreateCheckpointTypeDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: CheckpointType } | CheckpointType>('/api/v1/checkpoint-types', data)
      const typeData = (response.data as any)?.data || response.data
      const newType = normalizeCheckpointType(typeData as CheckpointType)
      checkpointTypes.value.push(newType)
      return newType
    } catch (err: any) {
      error.value = err.message || 'Failed to create checkpoint type'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCheckpointType(id: string | number, data: Partial<CreateCheckpointTypeDto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: CheckpointType } | CheckpointType>(`/api/v1/checkpoint-types/${id}`, data)
      const typeData = (response.data as any)?.data || response.data
      const updatedType = normalizeCheckpointType(typeData as CheckpointType)
      
      // Update in list
      const index = checkpointTypes.value.findIndex(t => t.id === id)
      if (index !== -1) {
        checkpointTypes.value[index] = updatedType
      }
      
      // Update current type if it matches
      if (currentCheckpointType.value?.id === id) {
        currentCheckpointType.value = updatedType
      }
      
      return updatedType
    } catch (err: any) {
      error.value = err.message || 'Failed to update checkpoint type'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCheckpointType(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/checkpoint-types/${id}`)
      checkpointTypes.value = checkpointTypes.value.filter(t => t.id !== id)
      if (currentCheckpointType.value?.id === id) {
        currentCheckpointType.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete checkpoint type'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    checkpointTypes,
    currentCheckpointType,
    loading,
    error,
    fetchCheckpointTypes,
    fetchCheckpointTypeById,
    createCheckpointType,
    updateCheckpointType,
    deleteCheckpointType,
  }
})
