<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-chatgpt-text">Checkpoint Types</h2>
        <button
          v-if="canManageTypes"
          @click="openCreateModal"
          class="px-4 py-2 bg-chatgpt-text text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
        >
          Add New Type
        </button>
      </div>

      <div v-if="checkpointTypeStore.loading" class="text-center py-12">
        <p class="text-chatgpt-text-light">Loading checkpoint types...</p>
      </div>

      <div v-else-if="checkpointTypeStore.checkpointTypes.length === 0" class="bg-white rounded-lg border border-chatgpt-border p-12 text-center">
        <p class="text-chatgpt-text-light mb-4">No checkpoint types found</p>
        <button
          v-if="canManageTypes"
          @click="openCreateModal"
          class="text-chatgpt-text hover:underline"
        >
          Create your first checkpoint type
        </button>
      </div>

      <div v-else class="bg-white rounded-lg border border-chatgpt-border overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-chatgpt-border">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-chatgpt-text-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-chatgpt-border">
            <tr
              v-for="type in checkpointTypeStore.checkpointTypes"
              :key="type.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-chatgpt-text">{{ type.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-chatgpt-text-light">
                  {{ type.description || '—' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button
                    v-if="canManageTypes"
                    @click="openEditModal(type)"
                    class="text-chatgpt-text hover:text-chatgpt-text-light transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    v-if="canManageTypes"
                    @click="openDeleteModal(type)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Checkpoint Type Modal -->
      <BaseModal
        v-model="isTypeModalOpen"
        :title="typeModalTitle"
        @close="closeTypeModal"
      >
        <CheckpointTypeForm
          ref="typeFormRef"
          :checkpoint-type="selectedType"
          :loading="checkpointTypeStore.loading"
          @submit="handleTypeFormSubmit"
          @cancel="closeTypeModal"
        />
      </BaseModal>

      <!-- Delete Confirmation Modal -->
      <BaseModal
        v-model="isDeleteModalOpen"
        title="Delete Checkpoint Type"
        @close="closeDeleteModal"
      >
        <div class="space-y-4">
          <p class="text-chatgpt-text">
            Are you sure you want to delete "<strong>{{ typeToDelete?.name }}</strong>"?
          </p>
          <p class="text-sm text-chatgpt-text-light">
            This action cannot be undone. If this type is in use by any checkpoints, deletion will be prevented.
          </p>
          <div v-if="deleteError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ deleteError }}
          </div>
          <div class="flex items-center justify-end space-x-4 pt-4">
            <button
              @click="closeDeleteModal"
              class="px-6 py-2 border border-chatgpt-border rounded-lg hover:bg-gray-50 transition-colors font-medium text-chatgpt-text"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="deleting">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '@/app/layouts/AdminLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CheckpointTypeForm from '@/components/common/CheckpointTypeForm.vue'
import { useCheckpointTypeStore, type CheckpointType, type CreateCheckpointTypeDto } from '@/app/store/checkpointType'
import { usePermissions } from '@/app/composables/usePermissions'

const checkpointTypeStore = useCheckpointTypeStore()
const { canCreateCheckpointTypes, canUpdateCheckpointTypes, canDeleteCheckpointTypes, hasRole } = usePermissions()

const isTypeModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedType = ref<CheckpointType | null>(null)
const typeToDelete = ref<CheckpointType | null>(null)
const typeFormRef = ref<InstanceType<typeof CheckpointTypeForm> | null>(null)
const deleting = ref(false)
const deleteError = ref('')

// Check if user is admin or has checkpoint types permissions
const isAdmin = computed(() => hasRole('super-admin'))
const canManageTypes = computed(() => isAdmin.value || canCreateCheckpointTypes.value || canUpdateCheckpointTypes.value || canDeleteCheckpointTypes.value)

const typeModalTitle = computed(() => {
  return selectedType.value ? 'Edit Checkpoint Type' : 'Add New Checkpoint Type'
})

function openCreateModal() {
  selectedType.value = null
  isTypeModalOpen.value = true
}

function openEditModal(type: CheckpointType) {
  selectedType.value = type
  isTypeModalOpen.value = true
}

function openDeleteModal(type: CheckpointType) {
  typeToDelete.value = type
  deleteError.value = ''
  isDeleteModalOpen.value = true
}

function closeTypeModal() {
  isTypeModalOpen.value = false
  selectedType.value = null
  if (typeFormRef.value) {
    typeFormRef.value.setError('')
  }
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  typeToDelete.value = null
  deleteError.value = ''
}

async function handleTypeFormSubmit(data: CreateCheckpointTypeDto | (CreateCheckpointTypeDto & { id: string | number })) {
  try {
    if ('id' in data) {
      // Edit mode
      await checkpointTypeStore.updateCheckpointType(data.id, data)
    } else {
      // Create mode
      await checkpointTypeStore.createCheckpointType(data)
    }
    await checkpointTypeStore.fetchCheckpointTypes() // Refresh list
    closeTypeModal()
  } catch (err: any) {
    const errorMessage = err.message || err.response?.data?.message || 'Failed to save checkpoint type. Please try again.'
    if (typeFormRef.value) {
      typeFormRef.value.setError(errorMessage)
    }
  }
}

async function confirmDelete() {
  if (!typeToDelete.value) return
  
  deleting.value = true
  deleteError.value = ''
  
  try {
    await checkpointTypeStore.deleteCheckpointType(typeToDelete.value.id)
    await checkpointTypeStore.fetchCheckpointTypes() // Refresh list
    closeDeleteModal()
  } catch (err: any) {
    deleteError.value = err.message || err.response?.data?.message || 'Failed to delete checkpoint type. It may be in use by existing checkpoints.'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  checkpointTypeStore.fetchCheckpointTypes()
})
</script>
