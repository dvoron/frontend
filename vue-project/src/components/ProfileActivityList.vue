<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getUserPosts, getUserComments } from '@/services/ForumService'

export interface UserPost {
  id: number;
  title: string;
  content: string;
  timestamp: string;
}

export interface UserComment {
  id: number;
  postTitle: string;
  content: string;
  timestamp: string;
}

const authStore = useAuthStore()

const userPosts = ref<UserPost[]>([])
const userComments = ref<UserComment[]>([])
const activityFilter = ref('both') // 'posts', 'comments', 'both'

const loadUserActivity = async () => {
  const userId = authStore.userId
  
  if (!userId || !authStore.accessToken) return

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
  await loadUserActivity()
})

defineExpose({ loadUserActivity })

const displayedActivity = computed(() => {
  let activity: any[] = []
  
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
  <div class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
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
</template>

<style scoped>
</style>
