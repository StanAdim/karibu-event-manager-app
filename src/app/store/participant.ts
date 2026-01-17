import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Participant {
  id: string | number
  full_name?: string
  fullName?: string
  first_name?: string
  firstName?: string
  last_name?: string
  lastName?: string
  email: string
  phone?: string
  event_id?: string | number
  eventId?: string | number
  checked_in?: boolean
  checkedIn?: boolean
  check_in_time?: string
  checkInTime?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  [key: string]: any
}

export interface CreateParticipantDto {
  fullName: string
  email: string
  phone?: string
  eventId: string | number
}

export interface ParticipantProgress {
  participant_id: string | number
  event_id: string | number
  total_checkpoints: number
  completed_checkpoints: number
  progress_percentage: number
  checkpoints: Array<{
    checkpoint_id: string | number
    checkpoint_name: string
    completed: boolean
    completed_at?: string
  }>
}

export const useParticipantStore = defineStore('participant', () => {
  const participants = ref<Participant[]>([])
  const currentParticipant = ref<Participant | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize participant data from API
  function normalizeParticipant(participant: Participant): Participant {
    return {
      ...participant,
      fullName: participant.full_name || participant.fullName || 
        (participant.first_name && participant.last_name 
          ? `${participant.first_name} ${participant.last_name}` 
          : participant.firstName && participant.lastName
            ? `${participant.firstName} ${participant.lastName}`
            : undefined),
      firstName: participant.first_name || participant.firstName,
      lastName: participant.last_name || participant.lastName,
      eventId: participant.event_id || participant.eventId,
      checkedIn: participant.checked_in !== undefined ? participant.checked_in : participant.checkedIn,
      checkInTime: participant.check_in_time || participant.checkInTime,
      createdAt: participant.created_at || participant.createdAt,
      updatedAt: participant.updated_at || participant.updatedAt,
    }
  }

  // Normalize create/update payload for API
  function normalizePayload(data: CreateParticipantDto): any {
    return {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
    }
  }

  async function fetchParticipants(eventId: string | number) {
    if (!eventId) {
      participants.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Participant[] } | Participant[]>(
        `/api/v1/events/${eventId}/participants`
      )
      const participantsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      participants.value = participantsData.map(normalizeParticipant)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch participants'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchParticipantById(eventId: string | number, participantId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Participant } | Participant>(
        `/api/v1/events/${eventId}/participants/${participantId}`
      )
      const participantData = (response.data as any)?.data || response.data
      currentParticipant.value = normalizeParticipant(participantData as Participant)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch participant'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createParticipant(data: CreateParticipantDto) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data)
      const response = await api.post<{ data?: Participant } | Participant>(
        `/api/v1/events/${data.eventId}/participants`,
        payload
      )
      const participantData = (response.data as any)?.data || response.data
      const newParticipant = normalizeParticipant(participantData as Participant)
      participants.value.push(newParticipant)
      return newParticipant
    } catch (err: any) {
      error.value = err.message || 'Failed to create participant'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateParticipant(
    eventId: string | number,
    participantId: string | number,
    data: Partial<CreateParticipantDto>
  ) {
    loading.value = true
    error.value = null
    try {
      const payload = normalizePayload(data as CreateParticipantDto)
      const response = await api.put<{ data?: Participant } | Participant>(
        `/api/v1/events/${eventId}/participants/${participantId}`,
        payload
      )
      const participantData = (response.data as any)?.data || response.data
      const updatedParticipant = normalizeParticipant(participantData as Participant)
      
      const index = participants.value.findIndex(p => p.id === participantId)
      if (index !== -1) {
        participants.value[index] = updatedParticipant
      }
      if (currentParticipant.value?.id === participantId) {
        currentParticipant.value = updatedParticipant
      }
      return updatedParticipant
    } catch (err: any) {
      error.value = err.message || 'Failed to update participant'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteParticipant(eventId: string | number, participantId: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/events/${eventId}/participants/${participantId}`)
      participants.value = participants.value.filter(p => p.id !== participantId)
      if (currentParticipant.value?.id === participantId) {
        currentParticipant.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete participant'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function bulkCreateParticipants(
    eventId: string | number,
    participants: CreateParticipantDto[]
  ) {
    loading.value = true
    error.value = null
    try {
      const payload = participants.map(normalizePayload)
      const response = await api.post<{ data?: Participant[] } | Participant[]>(
        `/api/v1/events/${eventId}/participants/bulk`,
        { participants: payload }
      )
      const participantsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      const newParticipants = participantsData.map(normalizeParticipant)
      participants.value.push(...newParticipants)
      return newParticipants
    } catch (err: any) {
      error.value = err.message || 'Failed to bulk create participants'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function importParticipants(eventId: string | number, file: File) {
    loading.value = true
    error.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<{ data?: Participant[] } | Participant[]>(
        `/api/v1/events/${eventId}/participants/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      const participantsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      const importedParticipants = participantsData.map(normalizeParticipant)
      participants.value.push(...importedParticipants)
      return importedParticipants
    } catch (err: any) {
      error.value = err.message || 'Failed to import participants'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function exportParticipants(eventId: string | number): Promise<Blob> {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(
        `/api/v1/events/${eventId}/participants/export`,
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to export participants'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function downloadExport(eventId: string | number, filename?: string) {
    try {
      const blob = await exportParticipants(eventId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `participants-export-${eventId}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw error
    }
  }

  async function fetchParticipantProgress(participantId: string | number): Promise<ParticipantProgress> {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: ParticipantProgress } | ParticipantProgress>(
        `/api/v1/participants/${participantId}/progress`
      )
      return (response.data as any)?.data || response.data as ParticipantProgress
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch participant progress'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchParticipantQRCode(participantId: string | number): Promise<string> {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(
        `/api/v1/participants/${participantId}/qr-code`,
        {
          responseType: 'blob',
        }
      )
      const url = window.URL.createObjectURL(response.data)
      return url
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch QR code'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchParticipantQRCodeData(participantId: string | number): Promise<any> {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: any } | any>(
        `/api/v1/participants/${participantId}/qr-code/data`
      )
      return (response.data as any)?.data || response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch QR code data'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    participants,
    currentParticipant,
    loading,
    error,
    fetchParticipants,
    fetchParticipantById,
    createParticipant,
    updateParticipant,
    deleteParticipant,
    bulkCreateParticipants,
    importParticipants,
    exportParticipants,
    downloadExport,
    fetchParticipantProgress,
    fetchParticipantQRCode,
    fetchParticipantQRCodeData,
  }
})
