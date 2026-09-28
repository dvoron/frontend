<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { updateUser } from '@/services/UserService'
import ProfileDeleteAccountDialog from './ProfileDeleteAccountDialog.vue'

const props = defineProps({
  initialUser: {
    type: Object,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['profileUpdated', 'editingChange'])

const authStore = useAuthStore()

const isEditing = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const deleteDialogRef = ref(null)

const user = ref({
  username: '',
  email: '',
  oldPassword: '',
  newPassword: ''
})

watch(() => props.initialUser, (newVal) => {
  if (newVal) {
    user.value.username = newVal.username
    user.value.email = newVal.email
    user.value.oldPassword = ''
    user.value.newPassword = ''
  }
}, { immediate: true, deep: true })

const toggleEdit = () => {
  isEditing.value = true
  errorMessage.value = ''
  successMessage.value = ''
  emit('editingChange', true)
}

const cancelEdit = () => {
  isEditing.value = false
  user.value.username = props.initialUser.username
  user.value.email = props.initialUser.email
  user.value.oldPassword = ''
  user.value.newPassword = ''
  errorMessage.value = ''
  
  if (deleteDialogRef.value) {
    deleteDialogRef.value.cancelDelete()
  }
  
  emit('editingChange', false)
}

const handleSave = async () => {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const userId = authStore.userId
  const updateData = {
    username: user.value.username,
    email: user.value.email,
  }
  
  if (user.value.newPassword) {
    if (!user.value.oldPassword) {
      errorMessage.value = 'Please enter your old password to set a new one.'
      isSaving.value = false
      return
    }
    updateData.oldPassword = user.value.oldPassword
    updateData.newPassword = user.value.newPassword
  }

  const [data, status] = await updateUser(userId, updateData, authStore.accessToken)
  if (status === 200) {
    successMessage.value = 'Profile updated successfully!'
    user.value.oldPassword = ''
    user.value.newPassword = ''
    isEditing.value = false
    emit('editingChange', false)
    emit('profileUpdated', { username: user.value.username, email: user.value.email })
  } else {
    errorMessage.value = data?.message || 'Failed to update profile.'
  }
  isSaving.value = false
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
      <div class="flex items-center space-x-5">
        <div class="flex-shrink-0">
          <!-- Default Profile Icon (SVG) -->
          <svg class="h-20 w-20 text-gray-400 bg-white rounded-full p-2 border border-gray-200 shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl leading-6 font-bold text-gray-900 pl-2">User Profile</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 pl-2">Manage your personal information and account settings.</p>
        </div>
      </div>
      <div v-if="!isEditing && !isLoading">
        <button @click="toggleEdit" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
          Edit Profile
        </button>
      </div>
    </div>

    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <div v-if="isLoading" class="p-8 text-center text-gray-500 font-medium">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading profile...
      </div>
      
      <div v-else>
        <!-- Read-only View -->
        <div v-if="!isEditing" class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Username</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ initialUser.username }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Email address</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ initialUser.email }}</dd>
          </div>
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Password</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">********</dd>
          </div>
          <div v-if="successMessage" class="py-4 sm:py-5 px-6 bg-green-50 text-green-700 text-sm font-medium rounded-b-lg">
            {{ successMessage }}
          </div>
        </div>

        <!-- Edit Form -->
        <form v-else @submit.prevent="handleSave" class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <label for="username" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Username</label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input type="text" id="username" v-model="user.username" required
                class="max-w-lg block w-full shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
            </div>
          </div>

          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <label for="email" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Email address</label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input type="email" id="email" v-model="user.email" required
                class="max-w-lg block w-full shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
            </div>
          </div>

          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <label for="oldPassword" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Old Password
            </label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input type="password" id="oldPassword" v-model="user.oldPassword"
                class="max-w-lg block w-full shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
            </div>
          </div>

          <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <label for="newPassword" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              New Password
              <span class="block text-xs text-gray-500 font-normal mt-1">(Leave blank to keep current)</span>
            </label>
            <div class="mt-1 sm:mt-0 sm:col-span-2">
              <input type="password" id="newPassword" v-model="user.newPassword"
                class="max-w-lg block w-full shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 border" />
            </div>
          </div>

          <ProfileDeleteAccountDialog 
            ref="deleteDialogRef"
            :email="props.initialUser.email"
            :isSaving="isSaving"
            :errorMessage="errorMessage"
            @cancelEdit="cancelEdit"
          />
        </form>
      </div>
    </div>
  </div>
</template>
