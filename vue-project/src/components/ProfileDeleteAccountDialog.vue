<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { deleteUser } from '@/services/UserService'
import { useRouter } from 'vue-router'

const emit = defineEmits(['cancel'])

const authStore = useAuthStore()
const router = useRouter()

const isDeleting = ref(false)
const deleteState = ref('password') // 'password', 'confirm'
const deletePassword = ref('')
const deleteError = ref('')

const cancelDelete = () => {
  emit('cancel')
}

const promptDeleteConfirmation = async () => {
  if (!deletePassword.value) {
    deleteError.value = 'Password is required to delete your account.'
    return
  }

  deleteError.value = ''
  deleteState.value = 'confirm'
}

const confirmDeleteAccount = async () => {
  isDeleting.value = true
  deleteError.value = ''

  if (!authStore.userId) {
    deleteError.value = 'User is not authenticated.'
    isDeleting.value = false
    return
  }

  const { data, status } = await deleteUser(authStore.userId, deletePassword.value)

  isDeleting.value = false

  if (status === 200 || status === 204) {
    authStore.clearTokens()
    router.push({ name: 'login' })
  } else {
    deleteError.value = data?.message || 'Failed to delete account.'
    if (status === 400 && data?.code === 'INVALID_PASSWORD') {
      deleteState.value = 'password'
    }
  }
}
</script>

<template>
  <div>
    <!-- Delete Password Footer -->
    <div
      v-if="deleteState === 'password'"
      class="py-4 sm:py-5 px-6 bg-red-50 rounded-b-lg border-t border-red-200"
    >
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="flex-1 w-full">
          <label for="deletePassword" class="block text-sm font-medium text-red-800"
            >Enter password to confirm deletion</label
          >
          <div class="mt-2 flex items-center space-x-2">
            <input
              type="password"
              id="deletePassword"
              v-model="deletePassword"
              @keyup.enter="promptDeleteConfirmation"
              class="block w-full sm:max-w-xs shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-300 rounded-md p-2 border"
              placeholder="Password"
            />
            <button
              type="button"
              @click="promptDeleteConfirmation"
              :disabled="isDeleting"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
          <p v-if="deleteError" class="mt-2 text-sm text-red-600">{{ deleteError }}</p>
        </div>
        <button
          type="button"
          @click="cancelDelete"
          :disabled="isDeleting"
          class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Footer -->
    <div
      v-else-if="deleteState === 'confirm'"
      class="py-4 sm:py-5 px-6 bg-red-50 rounded-b-lg border-t border-red-200"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 class="text-sm font-bold text-red-800">Are you absolutely sure?</h4>
          <p class="text-sm text-red-600 mt-1">
            This action cannot be undone. This will permanently delete your account.
          </p>
          <p v-if="deleteError" class="mt-2 text-sm text-red-600 font-medium">{{ deleteError }}</p>
        </div>
        <div class="flex space-x-3 w-full sm:w-auto mt-3 sm:mt-0">
          <button
            type="button"
            @click="cancelDelete"
            :disabled="isDeleting"
            class="flex-1 sm:flex-none inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDeleteAccount"
            :disabled="isDeleting"
            class="flex-1 sm:flex-none inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
