import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export type SessionType = 'keynote' | 'panel' | 'break' | 'lunch' | 'tea'

export interface Speaker {
  id: string | number
  name: string
  avatar?: string
  bio?: string
  title?: string
  organization?: string
}

export interface Session {
  id: string | number
  programme_day_id: string | number
  title: string
  type: SessionType
  description?: string
  start_time: string
  end_time: string
  duration_minutes?: number
  location?: string
  hall?: string
  speaker_id?: string | number
  speaker?: Speaker
  moderator_id?: string | number
  moderator?: Speaker
  panelists?: Speaker[]
  catering_notes?: string
  created_at?: string
  updated_at?: string
}

export interface ProgrammeDay {
  id: string | number
  event_id: string | number
  day_number: number
  date: string
  sessions?: Session[]
  created_at?: string
  updated_at?: string
}

export interface CreateSessionDto {
  programme_day_id: string | number
  title: string
  type: SessionType
  description?: string
  start_time: string
  end_time: string
  location?: string
  hall?: string
  speaker_id?: string | number
  moderator_id?: string | number
  panelist_ids?: (string | number)[]
  catering_notes?: string
}

export interface UpdateSessionDto extends Partial<CreateSessionDto> {
  id: string | number
}

export const useProgrammeStore = defineStore('programme', () => {
  const programmeDays = ref<ProgrammeDay[]>([])
  const currentDay = ref<ProgrammeDay | null>(null)
  const sessions = ref<Session[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Normalize session data from API
  function normalizeSession(session: Session): Session {
    return {
      ...session,
      start_time: session.start_time,
      end_time: session.end_time,
    }
  }

  // Normalize programme day data from API
  function normalizeProgrammeDay(day: ProgrammeDay): ProgrammeDay {
    return {
      ...day,
      sessions: day.sessions?.map(normalizeSession) || [],
    }
  }

  // Fetch all programme days for an event
  async function fetchProgrammeDays(eventId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: ProgrammeDay[] } | ProgrammeDay[]>(
        `/api/v1/events/${eventId}/programme-days`
      )
      const daysData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      programmeDays.value = daysData.map(normalizeProgrammeDay).sort((a, b) => a.day_number - b.day_number)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch programme days'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch sessions for a specific programme day
  async function fetchSessionsByDay(dayId: string | number) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data?: Session[] } | Session[]>(
        `/api/v1/programme-days/${dayId}/sessions`
      )
      const sessionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.data || []
      sessions.value = sessionsData.map(normalizeSession).sort((a, b) => {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      })
      
      // Update the day in programmeDays if it exists
      const dayIndex = programmeDays.value.findIndex(d => d.id === dayId)
      if (dayIndex !== -1) {
        programmeDays.value[dayIndex].sessions = sessions.value
      }
      
      if (currentDay.value?.id === dayId) {
        currentDay.value.sessions = sessions.value
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch sessions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set current day
  function setCurrentDay(day: ProgrammeDay) {
    currentDay.value = day
    if (day.sessions) {
      sessions.value = day.sessions
    } else {
      fetchSessionsByDay(day.id)
    }
  }

  // Create a new session
  async function createSession(data: CreateSessionDto) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post<{ data?: Session } | Session>('/api/v1/sessions', data)
      const sessionData = (response.data as any)?.data || response.data
      const newSession = normalizeSession(sessionData as Session)
      sessions.value.push(newSession)
      sessions.value.sort((a, b) => {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      })
      
      // Update programmeDays
      const dayIndex = programmeDays.value.findIndex(d => d.id === data.programme_day_id)
      if (dayIndex !== -1) {
        if (!programmeDays.value[dayIndex].sessions) {
          programmeDays.value[dayIndex].sessions = []
        }
        programmeDays.value[dayIndex].sessions!.push(newSession)
        programmeDays.value[dayIndex].sessions!.sort((a, b) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        })
      }
      
      if (currentDay.value?.id === data.programme_day_id) {
        if (!currentDay.value.sessions) {
          currentDay.value.sessions = []
        }
        currentDay.value.sessions.push(newSession)
        currentDay.value.sessions.sort((a, b) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
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

  // Update a session
  async function updateSession(id: string | number, data: Partial<CreateSessionDto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put<{ data?: Session } | Session>(`/api/v1/sessions/${id}`, data)
      const sessionData = (response.data as any)?.data || response.data
      const updatedSession = normalizeSession(sessionData as Session)
      
      // Update in sessions array
      const sessionIndex = sessions.value.findIndex(s => s.id === id)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex] = updatedSession
        sessions.value.sort((a, b) => {
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        })
      }
      
      // Update in programmeDays
      programmeDays.value.forEach(day => {
        if (day.sessions) {
          const index = day.sessions.findIndex(s => s.id === id)
          if (index !== -1) {
            day.sessions[index] = updatedSession
            day.sessions.sort((a, b) => {
              return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            })
          }
        }
      })
      
      if (currentDay.value?.sessions) {
        const index = currentDay.value.sessions.findIndex(s => s.id === id)
        if (index !== -1) {
          currentDay.value.sessions[index] = updatedSession
          currentDay.value.sessions.sort((a, b) => {
            return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          })
        }
      }
      
      return updatedSession
    } catch (err: any) {
      error.value = err.message || 'Failed to update session'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a session
  async function deleteSession(id: string | number) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/v1/sessions/${id}`)
      sessions.value = sessions.value.filter(s => s.id !== id)
      
      // Update programmeDays
      programmeDays.value.forEach(day => {
        if (day.sessions) {
          day.sessions = day.sessions.filter(s => s.id !== id)
        }
      })
      
      if (currentDay.value?.sessions) {
        currentDay.value.sessions = currentDay.value.sessions.filter(s => s.id !== id)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete session'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Check for time conflicts
  function checkTimeConflicts(
    startTime: string,
    endTime: string,
    excludeSessionId?: string | number
  ): Session[] {
    const conflicts = sessions.value.filter(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false
      
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
    
    return conflicts
  }

  // Check for speaker conflicts
  function checkSpeakerConflicts(
    speakerId: string | number,
    startTime: string,
    endTime: string,
    excludeSessionId?: string | number
  ): Session[] {
    const conflicts = sessions.value.filter(session => {
      if (excludeSessionId && session.id === excludeSessionId) return false
      
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
        session.panelists?.some(p => p.id === speakerId || (p as any).id === speakerId)
      )
    })
    
    return conflicts
  }

  return {
    programmeDays,
    currentDay,
    sessions,
    loading,
    error,
    fetchProgrammeDays,
    fetchSessionsByDay,
    setCurrentDay,
    createSession,
    updateSession,
    deleteSession,
    checkTimeConflicts,
    checkSpeakerConflicts,
  }
})
