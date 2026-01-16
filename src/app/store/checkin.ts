import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface CheckInVerificationRequest {
  code: string
  checkpoint_id?: string | number
  checkpointId?: string | number
}

export interface CheckInVerificationResponse {
  success: boolean
  participant?: {
    id: string | number
    first_name?: string
    firstName?: string
    last_name?: string
    lastName?: string
    email: string
    checked_in?: boolean
    checkedIn?: boolean
    check_in_time?: string
    checkInTime?: string
  }
  event?: {
    id: string | number
    name: string
  }
  checkpoint?: {
    id: string | number
    name: string
  }
  message: string
  already_checked_in?: boolean
  alreadyCheckedIn?: boolean
}

export const useCheckInStore = defineStore('checkin', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastVerification = ref<CheckInVerificationResponse | null>(null)

  async function verifyCheckIn(data: CheckInVerificationRequest): Promise<CheckInVerificationResponse> {
    loading.value = true
    error.value = null
    try {
      const payload: any = {
        code: data.code,
      }

      if (data.checkpoint_id || data.checkpointId) {
        payload.checkpoint_id = data.checkpoint_id || data.checkpointId
      }

      const response = await api.post<{ data?: CheckInVerificationResponse } | CheckInVerificationResponse>(
        '/api/v1/checkin/verify',
        payload
      )

      const verificationData = (response.data as any)?.data || response.data
      lastVerification.value = verificationData as CheckInVerificationResponse
      return verificationData as CheckInVerificationResponse
    } catch (err: any) {
      error.value = err.message || 'Failed to verify check-in'
      lastVerification.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearVerification() {
    lastVerification.value = null
    error.value = null
  }

  return {
    loading,
    error,
    lastVerification,
    verifyCheckIn,
    clearVerification,
  }
})
