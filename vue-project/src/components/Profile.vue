<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { getUserById, updateUser } from '@/services/UserService.js'
import { getUserPosts, getUserComments } from '@/services/ForumService.js'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isEditing = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const user = ref({
  username: '',
  email: '',
  oldPassword: '',
  newPassword: ''
})

const originalUser = ref({
  username: '',
  email: ''
})

const userPosts = ref([])
const userComments = ref([])
const activityFilter = ref('both') // 'posts', 'comments', 'both'

const loadUserActivity = async () => {
  const userId = authStore.userId
  
  const [postsData, postsStatus] = await getUserPosts(userId, authStore.accessToken)
  if (postsStatus === 200) {
    userPosts.value = postsData
  }

  const [commentsData, commentsStatus] = await getUserComments(userId, authStore.accessToken)
  if (commentsStatus === 200) {
    userComments.value = commentsData
  }
}

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
    
    originalUser.value.username = user.value.username
    originalUser.value.email = user.value.email
    
    await loadUserActivity()
  } else {
    errorMessage.value = 'Failed to load profile data.'
  }
  isLoading.value = false
})

const toggleEdit = () => {
  isEditing.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

const cancelEdit = () => {
  isEditing.value = false
  user.value.username = originalUser.value.username
  user.value.email = originalUser.value.email
  user.value.oldPassword = ''
  user.value.newPassword = ''
  errorMessage.value = ''
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
    originalUser.value.username = user.value.username
    originalUser.value.email = user.value.email
    user.value.oldPassword = ''
    user.value.newPassword = ''
    isEditing.value = false
    await loadUserActivity()
  } else {
    errorMessage.value = data?.message || 'Failed to update profile.'
  }
  isSaving.value = false
}

const displayedActivity = computed(() => {
  let activity = []
  
  if (activityFilter.value === 'both' || activityFilter.value === 'posts') {
    const mappedPosts = userPosts.value.map(post => ({
      type: 'post',
      id: `post-${post.id}`,
      originalId: post.id,
      title: post.title,
      content: post.content,
      timestamp: post.timestamp
    }))
    activity = [...activity, ...mappedPosts]
  }
  
  if (activityFilter.value === 'both' || activityFilter.value === 'comments') {
    const mappedComments = userComments.value.map(comment => ({
      type: 'comment',
      id: `comment-${comment.id}`,
      originalId: comment.id,
      postTitle: comment.postTitle,
      content: comment.content,
      timestamp: comment.timestamp
    }))
    activity = [...activity, ...mappedComments]
  }
  
  // Sort by timestamp if possible, otherwise just leave as is or sort by originalId
  // Assuming timestamp is a string, we might not be able to sort perfectly without parsing.
  // We'll sort by originalId descending as a proxy for recency.
  return activity.sort((a, b) => b.originalId - a.originalId)
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user.username }}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Email address</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user.email }}</dd>
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

            <div class="py-4 sm:py-5 px-6 flex justify-end items-center space-x-4 bg-gray-50 rounded-b-lg">
              <span v-if="errorMessage" class="text-red-600 text-sm font-medium mr-auto">{{ errorMessage }}</span>
              <button type="button" @click="cancelEdit" :disabled="isSaving"
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- User Activity Section -->
    <div v-if="!isLoading && !isEditing" class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
      <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">My Activity</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Your posts and comments from the forum.</p>
        </div>
        <div class="flex space-x-2">
          <button @click="activityFilter = 'both'" :class="[activityFilter === 'both' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50', 'px-3 py-1.5 border rounded-md text-sm font-medium transition-colors']">
            All Activity
          </button>
          <button @click="activityFilter = 'posts'" :class="[activityFilter === 'posts' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50', 'px-3 py-1.5 border rounded-md text-sm font-medium transition-colors']">
            Posts ({{ userPosts.length }})
          </button>
          <button @click="activityFilter = 'comments'" :class="[activityFilter === 'comments' ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50', 'px-3 py-1.5 border rounded-md text-sm font-medium transition-colors']">
            Comments ({{ userComments.length }})
          </button>
        </div>
      </div>
      
      <div class="px-4 py-5 sm:p-6">
        <div v-if="displayedActivity.length === 0" class="text-center py-8 text-gray-500">
          No activity found.
        </div>
        <ul v-else class="space-y-8">
          <li v-for="item in displayedActivity" :key="item.id" class="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
            <div v-if="item.type === 'post'">
              <div class="flex justify-between items-start mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Post
                </span>
                <span class="text-xs text-gray-500">{{ item.timestamp }}</span>
              </div>
              <h4 class="text-lg font-bold text-gray-900 mb-3 pb-3 border-b border-gray-200">{{ item.title }}</h4>
              <p class="text-base text-gray-700 whitespace-pre-wrap leading-relaxed mt-3">{{ item.content }}</p>
            </div>
            
            <div v-else-if="item.type === 'comment'">
              <div class="flex justify-between items-start mb-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Comment
                </span>
                <span class="text-xs text-gray-500">{{ item.timestamp }}</span>
              </div>
              <p class="text-sm text-gray-600 mb-3 pb-3 border-b border-gray-200">
                Commented on post: <span class="font-semibold text-gray-900">{{ item.postTitle }}</span>
              </p>
              <p class="text-base text-gray-700 whitespace-pre-wrap leading-relaxed mt-3">{{ item.content }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>