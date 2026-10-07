<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ForumComment from '@/components/ForumComment.vue'
import { getAllPosts, createPost as apiCreatePost, createComment as apiCreateComment } from '@/services/ForumService'

export interface Comment {
  id: number;
  author: string;
  timestamp: string;
  content: string;
  replies?: Comment[];
}

export interface Post {
  id: number;
  author: string;
  timestamp: string;
  title: string;
  content: string;
  comments: Comment[];
  showComments?: boolean;
  newCommentContent?: string;
}

const authStore = useAuthStore()

// Helper to get current username
const getCurrentUsername = () => {
  return authStore.username || 'Guest'
}

// State for posts
const posts = ref<Post[]>([])

const loadPosts = async () => {
  const [data, status] = await getAllPosts()
  if (status === 200) {
    posts.value = data
  }
}

onMounted(() => {
  loadPosts()
})

const showNewPostForm = ref(false)
const newPost = ref({
  title: '',
  content: ''
})

const createPost = async () => {
  if (!authStore.accessToken) return
  if (!newPost.value.title.trim()) return
  if (newPost.value.title.length > 255 || (newPost.value.content || '').length > 2000) return

  const [data, status] = await apiCreatePost(newPost.value.title, newPost.value.content, authStore.accessToken)
  
  if (status === 200) {
    posts.value.unshift(data)
    newPost.value.title = ''
    newPost.value.content = ''
    showNewPostForm.value = false
  }
}

const addComment = async (post: Post) => {
  if (!authStore.accessToken) return
  if (!post.newCommentContent?.trim()) return
  if ((post.newCommentContent || '').length > 1000) return

  const [data, status] = await apiCreateComment(post.id, null, post.newCommentContent, authStore.accessToken)
  
  if (status === 200) {
    post.comments.push(data)
    post.newCommentContent = ''
  }
}

// Function to recursively find a comment and add a reply
const addReplyToComment = (commentsList: Comment[], parentId: number, newComment: Comment): boolean => {
  for (let comment of commentsList) {
    if (comment.id === parentId) {
      if (!comment.replies) comment.replies = []
      comment.replies.push(newComment)
      return true
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const found = addReplyToComment(comment.replies, parentId, newComment)
      if (found) return true
    }
  }
  return false
}

const handleReply = async (postId: number, parentCommentId: number, content: string) => {
  if (!authStore.accessToken) return
  const [data, status] = await apiCreateComment(postId, parentCommentId, content, authStore.accessToken)
  if (status === 200) {
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      addReplyToComment(post.comments, parentCommentId, data)
    }
  }
}
</script>

<template>
  <div class="forum-container">
    <div class="header">
      <h1>Community Forum</h1>
      <button v-if="authStore.isLoggedIn" class="btn-primary" @click="showNewPostForm = !showNewPostForm">
        {{ showNewPostForm ? 'Cancel' : 'Create Post' }}
      </button>
    </div>

    <!-- New Post Form -->
    <div v-if="showNewPostForm" class="new-post-form card">
      <h2>Create a new post</h2>
      <div class="input-wrapper">
        <input v-model="newPost.title" placeholder="Title" class="form-input" />
        <span class="char-counter" :class="{ 'error': newPost.title.length > 255 }">{{ newPost.title.length }}/255</span>
      </div>
      <div class="input-wrapper">
        <textarea v-model="newPost.content" placeholder="Text (optional)" class="form-input" rows="4"></textarea>
        <span class="char-counter" :class="{ 'error': newPost.content.length > 2000 }">{{ newPost.content.length }}/2000</span>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="createPost" :disabled="newPost.title.length > 255 || newPost.content.length > 2000">Post</button>
      </div>
    </div>

    <!-- Post List -->
    <div class="post-list">
      <div v-for="post in posts" :key="post.id" class="post card">
        <div class="post-header">
          <span class="author">Posted by u/{{ post.author }}</span>
          <span class="timestamp">{{ post.timestamp }}</span>
        </div>
        
        <h2 class="title">{{ post.title }}</h2>
        <p class="content">{{ post.content }}</p>

        <div class="post-actions">
          <button class="action-btn" @click="post.showComments = !post.showComments">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            {{ post.comments.length }} Comments
          </button>
        </div>

        <!-- Comments Section -->
        <div v-if="post.showComments" class="comments-section">
          <!-- Add Comment to Post -->
          <div v-if="authStore.isLoggedIn" class="add-comment">
            <p>Comment as <strong>{{ getCurrentUsername() }}</strong></p>
            <div class="input-wrapper">
              <textarea v-model="post.newCommentContent" placeholder="What are your thoughts?" rows="3" class="form-input"></textarea>
              <span class="char-counter" :class="{ 'error': (post.newCommentContent || '').length > 1000 }">{{ (post.newCommentContent || '').length }}/1000</span>
            </div>
            <div class="comment-btn-container">
               <button class="btn-primary" @click="addComment(post)" :disabled="(post.newCommentContent || '').length > 1000">Comment</button>
            </div>
          </div>

          <hr class="divider" />

          <!-- Recursive Comments List -->
          <div class="comments-list">
             <ForumComment 
               v-for="comment in post.comments" 
               :key="comment.id" 
               :comment="comment" 
               @reply="(parentId, content) => handleReply(post.id, parentId, content)" 
             />
             
             <div v-if="post.comments.length === 0" class="no-comments">
               No comments yet. Be the first to share your thoughts!
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #e0e0e0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 1.8rem;
  color: #000;
  margin: 0;
}

.card {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.card:hover {
  border-color: #444;
}

.new-post-form h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.form-input {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: white;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
}

.input-wrapper {
  margin-bottom: 12px;
}

.input-wrapper .form-input {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #42b883;
  color: #1a1a1a;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #33a06f;
}

.btn-primary:disabled {
  background-color: #2a5a43;
  color: #888;
  cursor: not-allowed;
}

.post-header {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
}

.post .title {
  margin: 0 0 10px 0;
  font-size: 1.4rem;
  color: #fff;
}

.post .content {
  margin-bottom: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 6px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
}

.action-btn:hover {
  background-color: #2a2a2a;
}

.comments-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
}

.add-comment {
  margin-bottom: 20px;
}

.add-comment p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #aaa;
}

.comment-btn-container {
  display: flex;
  justify-content: flex-end;
}

.divider {
  border: 0;
  border-top: 1px solid #333;
  margin: 16px 0;
}

.no-comments {
  text-align: center;
  color: #888;
  padding: 20px 0;
  font-style: italic;
}
</style>
