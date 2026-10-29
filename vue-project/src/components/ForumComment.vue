<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getCommentReplies } from '@/services/ForumService'
import type { Comment } from '@/types/forum'

const authStore = useAuthStore()

const props = defineProps<{
  comment: Comment
}>()

const emit = defineEmits<{
  (e: 'reply', parentId: number, content: string, onComplete: (success: boolean) => void): void
}>()

const showReplyInput = ref(false)
const replyContent = ref('')
const replyError = ref('')
const isLoadingReplies = ref(false)
const isSubmitting = ref(false)

const showReplies = ref(!!(props.comment.replies && props.comment.replies.length > 0))
const repliesLoaded = ref(
  !!(props.comment.replies && props.comment.replies.length > 0 && props.comment.replies.length >= (props.comment.replyCount || 0))
)
const repliesPage = ref(0)
const hasMoreReplies = ref(
  props.comment.replyCount ? (!props.comment.replies || props.comment.replies.length < props.comment.replyCount) : false
)

const toggleReplies = async () => {
  showReplies.value = !showReplies.value
  if (showReplies.value && !repliesLoaded.value) {
    await loadMoreReplies()
  }
}

const loadMoreReplies = async () => {
  if (isLoadingReplies.value || !hasMoreReplies.value) return

  isLoadingReplies.value = true
  try {
    const { data, status } = await getCommentReplies(props.comment.id, repliesPage.value, 10)
    if (status >= 200 && status < 300) {
      if (!props.comment.replies) {
        props.comment.replies = []
      }
      
      const existingIds = new Set(props.comment.replies.map(r => r.id))
      const newReplies = data.filter((r: Comment) => !existingIds.has(r.id))
      
      if (repliesPage.value === 0) {
        props.comment.replies.unshift(...newReplies)
      } else {
        props.comment.replies.push(...newReplies)
      }
      
      repliesLoaded.value = true
      repliesPage.value++
      hasMoreReplies.value = data.length === 10
    }
  } finally {
    isLoadingReplies.value = false
  }
}

const submitReply = () => {
  if (isSubmitting.value) return
  if (!replyContent.value.trim()) return
  if (replyContent.value.length > 1000) return

  isSubmitting.value = true
  replyError.value = ''
  emit('reply', props.comment.id, replyContent.value, (success: boolean) => {
    isSubmitting.value = false
    if (success) {
      replyContent.value = ''
      showReplyInput.value = false
    } else {
      replyError.value = 'Failed to post reply. Please try again.'
    }
  })
}

const handleChildReply = (
  parentId: number,
  content: string,
  onComplete: (success: boolean) => void
) => {
  emit('reply', parentId, content, onComplete)
}
</script>

<template>
  <div class="comment">
    <div class="comment-header">
      <span class="author">u/{{ comment.author }}</span>
      <span class="timestamp">{{ comment.timestamp }}</span>
    </div>
    <div class="comment-content">
      {{ comment.content }}
    </div>

    <div class="comment-actions">
      <button
        v-if="authStore.isLoggedIn"
        class="action-btn"
        @click="showReplyInput = !showReplyInput"
      >
        Reply
      </button>
      <button
        v-if="comment.replyCount && comment.replyCount > 0"
        class="action-btn"
        @click="toggleReplies"
        :disabled="isLoadingReplies"
      >
        {{ isLoadingReplies ? 'Loading...' : showReplies ? 'Hide Replies' : 'Load Replies' }}
      </button>
    </div>

    <div v-if="showReplyInput" class="reply-input">
      <div class="input-wrapper">
        <textarea
          v-model="replyContent"
          placeholder="Write a reply..."
          aria-label="Write a reply"
          rows="2"
        ></textarea>
        <span class="char-counter" :class="{ error: replyContent.length > 1000 }"
          >{{ replyContent.length }}/1000</span
        >
      </div>
      <div v-if="replyError" class="error-message">{{ replyError }}</div>
      <div class="reply-actions">
        <button
          class="btn-submit"
          @click="submitReply"
          :disabled="isSubmitting || replyContent.length > 1000"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
        <button class="btn-cancel" @click="showReplyInput = false" :disabled="isSubmitting">
          Cancel
        </button>
      </div>
    </div>

    <div class="replies" v-if="showReplies && comment.replies && comment.replies.length > 0">
      <ForumComment
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        @reply="handleChildReply"
      />
      
      <div v-if="hasMoreReplies" style="margin-top: 8px;">
        <button class="action-btn" @click="loadMoreReplies" :disabled="isLoadingReplies">
          {{ isLoadingReplies ? 'Loading...' : 'Load More Replies' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment {
  border-left: 2px solid #333;
  padding-left: 1rem;
  margin-top: 1rem;
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 10px 10px 10px 15px;
}

.comment-header {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.author {
  font-weight: bold;
  color: #42b883;
  margin-right: 10px;
}

.comment-content {
  margin-bottom: 0.5rem;
  color: #e0e0e0;
  line-height: 1.4;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}

.action-btn:hover {
  text-decoration: underline;
  color: #fff;
}

.reply-input {
  margin-top: 0.5rem;
}

textarea {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 8px;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 0.5rem;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #42b883;
}

.input-wrapper {
  margin-bottom: 0.5rem;
}

.input-wrapper textarea {
  margin-bottom: 0;
}

.char-counter {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: #888;
  margin-top: 4px;
}

.char-counter.error {
  color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.reply-actions {
  display: flex;
  gap: 10px;
}

.btn-submit,
.btn-cancel {
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-submit {
  background-color: #42b883;
  color: #1a1a1a;
}

.btn-submit:disabled {
  background-color: #2a5a43;
  color: #888;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #444;
  color: white;
}

.replies {
  margin-left: 0.5rem;
}
</style>
