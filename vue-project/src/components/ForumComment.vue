<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reply'])

const showReplyInput = ref(false)
const replyContent = ref('')

const submitReply = () => {
  if (!replyContent.value.trim()) return;
  if (replyContent.value.length > 1000) return;
  emit('reply', props.comment.id, replyContent.value)
  replyContent.value = ''
  showReplyInput.value = false
}

const handleChildReply = (parentId, content) => {
  emit('reply', parentId, content)
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
    
    <div class="comment-actions" v-if="authStore.isLoggedIn">
      <button class="action-btn" @click="showReplyInput = !showReplyInput">Reply</button>
    </div>

    <div v-if="showReplyInput" class="reply-input">
      <div class="input-wrapper">
        <textarea v-model="replyContent" placeholder="Write a reply..." rows="2"></textarea>
        <span class="char-counter" :class="{ 'error': replyContent.length > 1000 }">{{ replyContent.length }}/1000</span>
      </div>
      <div class="reply-actions">
        <button class="btn-submit" @click="submitReply" :disabled="replyContent.length > 1000">Submit</button>
        <button class="btn-cancel" @click="showReplyInput = false">Cancel</button>
      </div>
    </div>

    <div class="replies" v-if="comment.replies && comment.replies.length > 0">
      <ForumComment 
        v-for="reply in comment.replies" 
        :key="reply.id" 
        :comment="reply" 
        @reply="handleChildReply" 
      />
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

.reply-actions {
  display: flex;
  gap: 10px;
}

.btn-submit, .btn-cancel {
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
