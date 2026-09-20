<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { getUserById } from '@/services/UserService.js'
import { useRouter } from 'vue-router'
import ProfileSettings from '@/components/ProfileSettings.vue'
import ProfileActivityList from '@/components/ProfileActivityList.vue'

const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(true)
const isEditing = ref(false)
const errorMessage = ref('')
const activityListRef = ref(null)

const user = ref({
  username: '',
  email: ''
})

onMounted(async () => {
  const userId = authStore.userId
  if (!userId) {
    router.push({ name: 'login' })
    return
  }

  const [data, status] = await getUserById(userId, authStore.accessToken)
  if (status === 200) {
    user.value.username = data.username || data.name
    user.value.email = data.email
  } else {
    errorMessage.value = 'Failed to load profile data.'
  }
  isLoading.value = false
})

const handleProfileUpdated = (updatedUser) => {
  user.value.username = updatedUser.username
  user.value.email = updatedUser.email
  if (activityListRef.value) {
    activityListRef.value.loadUserActivity()
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
    <div v-if="errorMessage" class="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
      {{ errorMessage }}
    </div>
    
    <ProfileSettings 
      :initialUser="user" 
      :isLoading="isLoading"
      @profileUpdated="handleProfileUpdated"
      @editingChange="isEditing = $event"
    />
    
    <ProfileActivityList 
      ref="activityListRef"
      v-show="!isLoading && !isEditing" 
    />
  </div>
</template>

<style scoped>
</style>
