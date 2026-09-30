<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { login, deleteUser } from '@/services/UserService'
import { useRouter } from 'vue-router'

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['cancelEdit'])

const authStore = useAuthStore()
const router = useRouter()

const isDeleting = ref(false)
const deleteState = ref('idle') // 'idle', 'password', 'confirm'
const deletePassword = ref('')
const deleteError = ref('')

const startDelete = () => {
  deleteState.value = 'password'
  deletePassword.value = ''
  deleteError.value = ''
}

const cancelDelete = () => {
  deleteState.value = 'idle'
  deletePassword.value = ''
  deleteError.value = ''
}

defineExpose({ cancelDelete })

const verifyDeletePassword = async () => {
  if (!deletePassword.value) {
    deleteError.value = 'Password is required to delete your account.'
    return
  }

  isDeleting.value = true
  deleteError.value = ''
  
  // Verify password using the login endpoint
  const [loginData, loginStatus] = await login({ login: props.email, password: deletePassword.value })
  
  isDeleting.value = false
  
  if (loginStatus !== 200) {
    deleteError.value = 'Incorrect password.'
    return
  }

  deleteState.value = 'confirm'
}

const confirmDeleteAccount = async () => {
  isDeleting.value = true
  deleteError.value = ''
  
  if (!authStore.userId || !authStore.accessToken) {
    deleteError.value = 'User is not authenticated.'
    isDeleting.value = false
    return
  }
  
  const [data, status] = await deleteUser(authStore.userId, authStore.accessToken)
  
  isDeleting.value = false
  
  if (status === 200 || status === 204) {
    authStore.clearTokens()
    router.push({ name: 'login' })
  } else {
    deleteError.value = data?.message || 'Failed to delete account.'
  }
}
</script>

<template>
  <div>
    <!-- Standard Footer -->
    <div v-if="deleteState === 'idle'" class="py-4 sm:py-5 px-6 flex justify-between items-center bg-gray-50 rounded-b-lg">
      <div>
        <button type="button" @click="startDelete" :disabled="isSaving" class="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors">
          Delete Account
        </button>
      </div>
      <div class="flex items-center space-x-4">
        <span v-if="errorMessage" class="text-red-600 text-sm font-medium">{{ errorMessage }}</span>
        <button type="button" @click="$emit('cancelEdit')" :disabled="isSaving"
          class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" :disabled="isSaving"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Delete Password Footer -->
    <div v-else-if="deleteState === 'password'" class="py-4 sm:py-5 px-6 bg-red-50 rounded-b-lg border-t border-red-200">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="flex-1 w-full">
          <label for="deletePassword" class="block text-sm font-medium text-red-800">Enter password to confirm deletion</label>
          <div class="mt-2 flex items-center space-x-2">
            <input type="password" id="deletePassword" v-model="deletePassword" @keyup.enter="verifyDeletePassword" class="block w-full sm:max-w-xs shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="Password" />
            <button type="button" @click="verifyDeletePassword" :disabled="isDeleting" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
              {{ isDeleting ? 'Checking...' : 'Verify' }}
            </button>
          </div>
          <p v-if="deleteError" class="mt-2 text-sm text-red-600">{{ deleteError }}</p>
        </div>
        <button type="button" @click="cancelDelete" :disabled="isDeleting" class="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
          Cancel
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Footer -->
    <div v-else-if="deleteState === 'confirm'" class="py-4 sm:py-5 px-6 bg-red-50 rounded-b-lg border-t border-red-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 class="text-sm font-bold text-red-800">Are you absolutely sure?</h4>
          <p class="text-sm text-red-600 mt-1">This action cannot be undone. This will permanently delete your account.</p>
          <p v-if="deleteError" class="mt-2 text-sm text-red-600 font-medium">{{ deleteError }}</p>
        </div>
        <div class="flex space-x-3 w-full sm:w-auto mt-3 sm:mt-0">
          <button type="button" @click="cancelDelete" :disabled="isDeleting" class="flex-1 sm:flex-none inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
            Cancel
          </button>
          <button type="button" @click="confirmDeleteAccount" :disabled="isDeleting" class="flex-1 sm:flex-none inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
            {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
