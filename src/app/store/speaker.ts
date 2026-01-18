import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Speaker {
  id: string | number
  name: string
  avatar?: string
  bio?: string
  title?: string
  organization?: string
  email?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface CreateSpeakerDto {
  name: string
  avatar?: string
  bio?: string
  title?: string
  organization?: string
  email?: string
  phone?: string
}

export interface UpdateSpeakerDto extends Partial<CreateSpeakerDto> {
  id?: string | number
}

export const useSpeakerStore = defineStore('speaker', () => {
  const speakers = ref<Speaker[]>([])
  const currentSpeaker = ref<Speaker | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize speaker data from API
  function normalizeSpeaker(speaker: Speaker): Speaker {
    return {
      ...speaker,
      created_at: speaker.created_at || speaker.createdAt,
      updated_at: speaker.updated_at || speaker.updatedAt,
    }
  }

  // Normalize create/update payload for API
  function normalizePayload(data: CreateSpeakerDto | UpdateSpeakerDto): any {
    return {
      name: data.name,
      avatar: data.avatar,
      bio: data.bio,
      title: data.title,
      organization: data.organization,
      email: data.email,
      phone: data.phone,
    }
  }

  async function fetchSpeakers() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Speaker[] } | Speaker[]>('/api/v1/speakers')
      const speakersData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      speakers.value = speakersData.map(normalizeSpeaker)
      return speakers.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch speakers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSpeakerById(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Speaker } | Speaker>(`/api/v1/speakers/${id}`)
      const speakerData = (response.data as any)?.data || response.data
      currentSpeaker.value = normalizeSpeaker(speakerData as Speaker)
      return currentSpeaker.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch speaker'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createSpeaker(data: CreateSpeakerDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Speaker } | Speaker>(
        '/api/v1/speakers',
        normalizePayload(data)
      )
      const speakerData = (response.data as any)?.data || response.data
      const newSpeaker = normalizeSpeaker(speakerData as Speaker)
      speakers.value.push(newSpeaker)
      return newSpeaker
    } catch (err: any) {
      error.value = err.message || 'Failed to create speaker'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSpeaker(id: string | number, data: UpdateSpeakerDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Speaker } | Speaker>(
        `/api/v1/speakers/${id}`,
        normalizePayload(data)
      )
      const speakerData = (response.data as any)?.data || response.data
      const updatedSpeaker = normalizeSpeaker(speakerData as Speaker)
      
      const index = speakers.value.findIndex(s => s.id === id)
      if (index !== -1) {
        speakers.value[index] = updatedSpeaker
      }
      
      if (currentSpeaker.value?.id === id) {
        currentSpeaker.value = updatedSpeaker
      }
      
      return updatedSpeaker
    } catch (err: any) {
      error.value = err.message || 'Failed to update speaker'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSpeaker(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/speakers/${id}`)
      speakers.value = speakers.value.filter(s => s.id !== id)
      
      if (currentSpeaker.value?.id === id) {
        currentSpeaker.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete speaker'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add participant to session
  async function addParticipantToSession(sessionId: string | number, speakerId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Speaker } | Speaker>(
        `/api/v1/sessions/${sessionId}/participants`,
        { speaker_id: speakerId }
      )
      return (response.data as any)?.data || response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to add participant to session'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove participant from session
  async function removeParticipantFromSession(sessionId: string | number, speakerId: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/sessions/${sessionId}/participants/${speakerId}`)
    } catch (err: any) {
      error.value = err.message || 'Failed to remove participant from session'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    speakers,
    currentSpeaker,
    loading,
    error,
    fetchSpeakers,
    fetchSpeakerById,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    addParticipantToSession,
    removeParticipantFromSession,
  }
})
