import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

// ==================== Interfaces ====================

export type SessionType = 'keynote' | 'panel' | 'break' | 'lunch' | 'tea'

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

export interface Agenda {
  id: string | number
  session_id: string | number
  title: string
  description?: string
  order?: number
  duration_minutes?: number
  created_at?: string
  updated_at?: string
}

export interface Session {
  id: string | number
  time_slot_id: string | number
  title: string
  type: SessionType
  description?: string
  location?: string
  hall?: string
  speaker_id?: string | number
  speaker?: Speaker
  moderator_id?: string | number
  moderator?: Speaker
  panelists?: Speaker[]
  participants?: Speaker[]
  agendas?: Agenda[]
  catering_notes?: string
  created_at?: string
  updated_at?: string
}

export interface TimeSlot {
  id: string | number
  day_id: string | number
  start_time: string
  end_time: string
  title?: string
  description?: string
  sessions?: Session[]
  created_at?: string
  updated_at?: string
}

export interface ProgrammeDay {
  id: string | number
  event_id: string | number
  day_number: number
  date: string
  title?: string
  description?: string
  time_slots?: TimeSlot[]
  created_at?: string
  updated_at?: string
}

export interface Programme {
  id: string | number
  event_id: string | number
  is_published: boolean
  published_at?: string
  days?: ProgrammeDay[]
  created_at?: string
  updated_at?: string
}

// ==================== DTOs ====================

export interface CreateDayDto {
  event_id: string | number
  day_number: number
  date: string
  title?: string
  description?: string
}

export interface UpdateDayDto extends Partial<CreateDayDto> {
  id?: string | number
}

export interface CreateTimeSlotDto {
  day_id: string | number
  start_time: string
  end_time: string
  title?: string
  description?: string
}

export interface UpdateTimeSlotDto extends Partial<CreateTimeSlotDto> {
  id?: string | number
}

export interface CreateSessionDto {
  time_slot_id: string | number
  title: string
  type: SessionType
  description?: string
  start_time?: string
  end_time?: string
  location?: string
  hall?: string
  speaker_id?: string | number
  moderator_id?: string | number
  panelist_ids?: (string | number)[]
  catering_notes?: string
}

export interface UpdateSessionDto extends Partial<CreateSessionDto> {
  id?: string | number
}

export interface CreateAgendaDto {
  session_id: string | number
  title: string
  description?: string
  order?: number
  duration_minutes?: number
}

export interface UpdateAgendaDto extends Partial<CreateAgendaDto> {
  id?: string | number
}

// ==================== Programme Store ====================

export const useProgrammeStore = defineStore('programme', () => {
  const programme = ref<Programme | null>(null)
  const days = ref<ProgrammeDay[]>([])
  const currentDay = ref<ProgrammeDay | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ==================== Normalization ====================

  function normalizeDay(day: any): ProgrammeDay {
    return {
      ...day,
      event_id: day.event_id || day.eventId,
      day_number: day.day_number || day.dayNumber || 1,
      time_slots: day.time_slots?.map(normalizeTimeSlot) || day.timeSlots?.map(normalizeTimeSlot) || [],
      created_at: day.created_at || day.createdAt,
      updated_at: day.updated_at || day.updatedAt,
    }
  }

  function normalizeTimeSlot(slot: any): TimeSlot {
    return {
      ...slot,
      day_id: slot.day_id || slot.dayId,
      start_time: slot.start_time || slot.startTime,
      end_time: slot.end_time || slot.endTime,
      sessions: slot.sessions?.map(normalizeSession) || [],
      created_at: slot.created_at || slot.createdAt,
      updated_at: slot.updated_at || slot.updatedAt,
    }
  }

  function normalizeSession(session: any): Session {
    return {
      ...session,
      time_slot_id: session.time_slot_id || session.timeSlotId,
      start_time: session.start_time || session.startTime,
      end_time: session.end_time || session.endTime,
      speaker_id: session.speaker_id || session.speakerId,
      moderator_id: session.moderator_id || session.moderatorId,
      agendas: session.agendas?.map(normalizeAgenda) || [],
      participants: session.participants || [],
      created_at: session.created_at || session.createdAt,
      updated_at: session.updated_at || session.updatedAt,
    }
  }

  function normalizeAgenda(agenda: any): Agenda {
    return {
      ...agenda,
      session_id: agenda.session_id || agenda.sessionId,
      created_at: agenda.created_at || agenda.createdAt,
      updated_at: agenda.updated_at || agenda.updatedAt,
    }
  }

  // ==================== Programme Methods ====================

  async function fetchProgramme(eventId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Programme } | Programme>(
        `/api/v1/events/${eventId}/programme`
      )
      const programmeData = (response.data as any)?.data || response.data
      programme.value = {
        ...programmeData,
        event_id: programmeData.event_id || programmeData.eventId || eventId,
        is_published: programmeData.is_published || programmeData.isPublished || false,
        days: programmeData.days?.map(normalizeDay) || [],
      }
      days.value = programme.value.days || []
      return programme.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch programme'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function publishProgramme(eventId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Programme } | Programme>(
        `/api/v1/events/${eventId}/programme/publish`
      )
      const programmeData = (response.data as any)?.data || response.data
      if (programme.value) {
        programme.value.is_published = true
        programme.value.published_at = programmeData.published_at || new Date().toISOString()
      }
      return programmeData
    } catch (err: any) {
      error.value = err.message || 'Failed to publish programme'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unpublishProgramme(eventId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Programme } | Programme>(
        `/api/v1/events/${eventId}/programme/unpublish`
      )
      if (programme.value) {
        programme.value.is_published = false
        programme.value.published_at = undefined
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to unpublish programme'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Days Methods ====================

  async function fetchDays(eventId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: ProgrammeDay[] } | ProgrammeDay[]>(
        `/api/v1/events/${eventId}/days`
      )
      const daysData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      days.value = daysData.map(normalizeDay).sort((a, b) => a.day_number - b.day_number)
      return days.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch days'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createDay(data: CreateDayDto) {
    loading.value = true
    error.value = null
    try {
      // Validate event_id
      if (!data.event_id || data.event_id === 'undefined' || data.event_id === undefined) {
        throw new Error('Event ID is required')
      }

      const response = await api.post<{ data?: ProgrammeDay } | ProgrammeDay>(
        `/api/v1/events/${data.event_id}/days`,
        {
          day_number: data.day_number,
          date: data.date,
          title: data.title,
          description: data.description,
        }
      )
      const dayData = (response.data as any)?.data || response.data
      const newDay = normalizeDay(dayData)
      days.value.push(newDay)
      days.value.sort((a, b) => a.day_number - b.day_number)
      
      if (programme.value) {
        if (!programme.value.days) programme.value.days = []
        programme.value.days.push(newDay)
        programme.value.days.sort((a, b) => a.day_number - b.day_number)
      }
      
      return newDay
    } catch (err: any) {
      error.value = err.message || 'Failed to create day'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDay(id: string | number, data: UpdateDayDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: ProgrammeDay } | ProgrammeDay>(
        `/api/v1/days/${id}`,
        {
          day_number: data.day_number,
          date: data.date,
          title: data.title,
          description: data.description,
        }
      )
      const dayData = (response.data as any)?.data || response.data
      const updatedDay = normalizeDay(dayData)
      
      const index = days.value.findIndex(d => d.id === id)
      if (index !== -1) {
        days.value[index] = updatedDay
      }
      
      if (currentDay.value?.id === id) {
        currentDay.value = updatedDay
      }
      
      if (programme.value?.days) {
        const programmeIndex = programme.value.days.findIndex(d => d.id === id)
        if (programmeIndex !== -1) {
          programme.value.days[programmeIndex] = updatedDay
        }
      }
      
      return updatedDay
    } catch (err: any) {
      error.value = err.message || 'Failed to update day'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDay(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/days/${id}`)
      days.value = days.value.filter(d => d.id !== id)
      
      if (currentDay.value?.id === id) {
        currentDay.value = null
      }
      
      if (programme.value?.days) {
        programme.value.days = programme.value.days.filter(d => d.id !== id)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete day'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setCurrentDay(day: ProgrammeDay | null) {
    currentDay.value = day
  }

  // ==================== Time Slots Methods ====================

  async function createTimeSlot(dayId: string | number, data: Omit<CreateTimeSlotDto, 'day_id'>) {
    loading.value = true
    error.value = null
    try {
      // Find the day to get event_id
      const day = days.value.find(d => d.id === dayId) || currentDay.value
      if (!day) throw new Error('Day not found')
      
      const eventId = day.event_id
      const response = await api.post<{ data?: TimeSlot } | TimeSlot>(
        `/api/v1/events/${eventId}/days/${dayId}/time-slots`,
        {
          start_time: data.start_time,
          end_time: data.end_time,
          title: data.title,
          description: data.description,
        }
      )
      const slotData = (response.data as any)?.data || response.data
      const newSlot = normalizeTimeSlot({ ...slotData, day_id: dayId })
      
      // Update day's time slots
      const dayIndex = days.value.findIndex(d => d.id === dayId)
      if (dayIndex !== -1) {
        if (!days.value[dayIndex].time_slots) {
          days.value[dayIndex].time_slots = []
        }
        days.value[dayIndex].time_slots!.push(newSlot)
        days.value[dayIndex].time_slots!.sort((a, b) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        })
      }
      
      if (currentDay.value?.id === dayId) {
        if (!currentDay.value.time_slots) {
          currentDay.value.time_slots = []
        }
        currentDay.value.time_slots.push(newSlot)
        currentDay.value.time_slots.sort((a, b) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        })
      }
      
      return newSlot
    } catch (err: any) {
      error.value = err.message || 'Failed to create time slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTimeSlot(id: string | number, data: UpdateTimeSlotDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: TimeSlot } | TimeSlot>(
        `/api/v1/time-slots/${id}`,
        {
          start_time: data.start_time,
          end_time: data.end_time,
          title: data.title,
          description: data.description,
        }
      )
      const slotData = (response.data as any)?.data || response.data
      const updatedSlot = normalizeTimeSlot(slotData)
      
      // Update in all days
      days.value.forEach(day => {
        if (day.time_slots) {
          const index = day.time_slots.findIndex(s => s.id === id)
          if (index !== -1) {
            day.time_slots[index] = updatedSlot
          }
        }
      })
      
      if (currentDay.value?.time_slots) {
        const index = currentDay.value.time_slots.findIndex(s => s.id === id)
        if (index !== -1) {
          currentDay.value.time_slots[index] = updatedSlot
        }
      }
      
      return updatedSlot
    } catch (err: any) {
      error.value = err.message || 'Failed to update time slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTimeSlot(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/time-slots/${id}`)
      
      // Remove from all days
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots = day.time_slots.filter(s => s.id !== id)
        }
      })
      
      if (currentDay.value?.time_slots) {
        currentDay.value.time_slots = currentDay.value.time_slots.filter(s => s.id !== id)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete time slot'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Sessions Methods ====================

  async function createSession(slotId: string | number, data: Omit<CreateSessionDto, 'time_slot_id'>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Session } | Session>(
        `/api/v1/time-slots/${slotId}/sessions`,
        {
          title: data.title,
          type: data.type,
          description: data.description,
          location: data.location,
          hall: data.hall,
          speaker_id: data.speaker_id,
          moderator_id: data.moderator_id,
          panelist_ids: data.panelist_ids,
          catering_notes: data.catering_notes,
        }
      )
      const sessionData = (response.data as any)?.data || response.data
      const newSession = normalizeSession({ ...sessionData, time_slot_id: slotId })
      
      // Update time slot's sessions
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.id === slotId) {
              if (!slot.sessions) slot.sessions = []
              slot.sessions.push(newSession)
            }
          })
        }
      })
      
      if (currentDay.value?.time_slots) {
        currentDay.value.time_slots.forEach(slot => {
          if (slot.id === slotId) {
            if (!slot.sessions) slot.sessions = []
            slot.sessions.push(newSession)
          }
        })
      }
      
      return newSession
    } catch (err: any) {
      error.value = err.message || 'Failed to create session'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSession(id: string | number, data: UpdateSessionDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Session } | Session>(
        `/api/v1/sessions/${id}`,
        {
          title: data.title,
          type: data.type,
          description: data.description,
          location: data.location,
          hall: data.hall,
          speaker_id: data.speaker_id,
          moderator_id: data.moderator_id,
          panelist_ids: data.panelist_ids,
          catering_notes: data.catering_notes,
        }
      )
      const sessionData = (response.data as any)?.data || response.data
      const updatedSession = normalizeSession(sessionData)
      
      // Update in all time slots
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.sessions) {
              const index = slot.sessions.findIndex(s => s.id === id)
              if (index !== -1) {
                slot.sessions[index] = updatedSession
              }
            }
          })
        }
      })
      
      if (currentDay.value?.time_slots) {
        currentDay.value.time_slots.forEach(slot => {
          if (slot.sessions) {
            const index = slot.sessions.findIndex(s => s.id === id)
            if (index !== -1) {
              slot.sessions[index] = updatedSession
            }
          }
        })
      }
      
      return updatedSession
    } catch (err: any) {
      error.value = err.message || 'Failed to update session'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSession(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/sessions/${id}`)
      
      // Remove from all time slots
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.sessions) {
              slot.sessions = slot.sessions.filter(s => s.id !== id)
            }
          })
        }
      })
      
      if (currentDay.value?.time_slots) {
        currentDay.value.time_slots.forEach(slot => {
          if (slot.sessions) {
            slot.sessions = slot.sessions.filter(s => s.id !== id)
          }
        })
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete session'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Agendas Methods ====================

  async function createAgenda(sessionId: string | number, data: Omit<CreateAgendaDto, 'session_id'>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Agenda } | Agenda>(
        `/api/v1/sessions/${sessionId}/agendas`,
        {
          title: data.title,
          description: data.description,
          order: data.order,
          duration_minutes: data.duration_minutes,
        }
      )
      const agendaData = (response.data as any)?.data || response.data
      const newAgenda = normalizeAgenda({ ...agendaData, session_id: sessionId })
      
      // Update session's agendas
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.sessions) {
              slot.sessions.forEach(session => {
                if (session.id === sessionId) {
                  if (!session.agendas) session.agendas = []
                  session.agendas.push(newAgenda)
                  session.agendas.sort((a, b) => (a.order || 0) - (b.order || 0))
                }
              })
            }
          })
        }
      })
      
      return newAgenda
    } catch (err: any) {
      error.value = err.message || 'Failed to create agenda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAgenda(id: string | number, data: UpdateAgendaDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Agenda } | Agenda>(
        `/api/v1/agendas/${id}`,
        {
          title: data.title,
          description: data.description,
          order: data.order,
          duration_minutes: data.duration_minutes,
        }
      )
      const agendaData = (response.data as any)?.data || response.data
      const updatedAgenda = normalizeAgenda(agendaData)
      
      // Update in all sessions
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.sessions) {
              slot.sessions.forEach(session => {
                if (session.agendas) {
                  const index = session.agendas.findIndex(a => a.id === id)
                  if (index !== -1) {
                    session.agendas[index] = updatedAgenda
                  }
                }
              })
            }
          })
        }
      })
      
      return updatedAgenda
    } catch (err: any) {
      error.value = err.message || 'Failed to update agenda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAgenda(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/agendas/${id}`)
      
      // Remove from all sessions
      days.value.forEach(day => {
        if (day.time_slots) {
          day.time_slots.forEach(slot => {
            if (slot.sessions) {
              slot.sessions.forEach(session => {
                if (session.agendas) {
                  session.agendas = session.agendas.filter(a => a.id !== id)
                }
              })
            }
          })
        }
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to delete agenda'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ==================== Helper Methods ====================

  // Get all sessions from all days
  const allSessions = computed(() => {
    const sessions: Session[] = []
    days.value.forEach(day => {
      if (day.time_slots) {
        day.time_slots.forEach(slot => {
          if (slot.sessions) {
            sessions.push(...slot.sessions)
          }
        })
      }
    })
    return sessions.sort((a, b) => {
      return new Date(a.start_time || '').getTime() - new Date(b.start_time || '').getTime()
    })
  })

  // Get sessions for current day
  const currentDaySessions = computed(() => {
    if (!currentDay.value?.time_slots) return []
    const sessions: Session[] = []
    currentDay.value.time_slots.forEach(slot => {
      if (slot.sessions) {
        sessions.push(...slot.sessions)
      }
    })
    return sessions.sort((a, b) => {
      return new Date(a.start_time || '').getTime() - new Date(b.start_time || '').getTime()
    })
  })

  // Check for time conflicts
  function checkTimeConflicts(
    startTime: string,
    endTime: string,
    excludeSessionId?: string | number
  ): Session[] {
    return allSessions.value.filter(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false
      if (!session.start_time || !session.end_time) return false
      
      const sessionStart = new Date(session.start_time).getTime()
      const sessionEnd = new Date(session.end_time).getTime()
      const newStart = new Date(startTime).getTime()
      const newEnd = new Date(endTime).getTime()
      
      return (
        (newStart >= sessionStart && newStart < sessionEnd) ||
        (newEnd > sessionStart && newEnd <= sessionEnd) ||
        (newStart <= sessionStart && newEnd >= sessionEnd)
      )
    })
  }

  // Check for speaker conflicts
  function checkSpeakerConflicts(
    speakerId: string | number,
    startTime: string,
    endTime: string,
    excludeSessionId?: string | number
  ): Session[] {
    return allSessions.value.filter(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false
      if (!session.start_time || !session.end_time) return false
      
      const sessionStart = new Date(session.start_time).getTime()
      const sessionEnd = new Date(session.end_time).getTime()
      const newStart = new Date(startTime).getTime()
      const newEnd = new Date(endTime).getTime()
      
      const hasOverlap =
        (newStart >= sessionStart && newStart < sessionEnd) ||
        (newEnd > sessionStart && newEnd <= sessionEnd) ||
        (newStart <= sessionStart && newEnd >= sessionEnd)
      
      if (!hasOverlap) return false
      
      return (
        session.speaker_id === speakerId ||
        session.moderator_id === speakerId ||
        session.panelists?.some(p => p.id === speakerId)
      )
    })
  }

  return {
    // State
    programme,
    days,
    currentDay,
    loading,
    error,
    
    // Computed
    allSessions,
    currentDaySessions,
    
    // Programme methods
    fetchProgramme,
    publishProgramme,
    unpublishProgramme,
    
    // Days methods
    fetchDays,
    createDay,
    updateDay,
    deleteDay,
    setCurrentDay,
    
    // Time Slots methods
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    
    // Sessions methods
    createSession,
    updateSession,
    deleteSession,
    
    // Agendas methods
    createAgenda,
    updateAgenda,
    deleteAgenda,
    
    // Helper methods
    checkTimeConflicts,
    checkSpeakerConflicts,
  }
})
