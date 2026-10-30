import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post, Comment } from '@/types/forum'
import {
  getAllPosts,
  createPost as apiCreatePost,
  createComment as apiCreateComment,
  getPostComments,
  getCommentReplies
} from '@/services/ForumService'

export const useForumStore = defineStore('forum', () => {
  const posts = ref<Post[]>([])
  const hasMore = ref(true)
  const loadPostsError = ref('')
  const isLoadingPosts = ref(false)

  const loadPosts = async (loadMore = false) => {
    if (isLoadingPosts.value) return
    isLoadingPosts.value = true
    if (!loadMore) loadPostsError.value = ''

    try {
      const cursor =
        loadMore && posts.value.length > 0 ? posts.value[posts.value.length - 1].id : undefined
      const size = 10
      const { data, status } = await getAllPosts(cursor, size)
      if (status >= 200 && status < 300) {
        data.forEach((post: Post) => {
          post.comments = post.comments || []
        })
        if (loadMore) {
          posts.value.push(...data)
        } else {
          posts.value = data
        }
        hasMore.value = data.length === size
      } else {
        loadPostsError.value = 'Failed to load posts. Please try again.'
      }
    } catch (err) {
      loadPostsError.value = 'An error occurred while loading posts.'
    } finally {
      isLoadingPosts.value = false
    }
  }

  const loadMorePosts = () => {
    if (hasMore.value) {
      loadPosts(true)
    }
  }

  const createPost = async (title: string, content: string) => {
    const { data, status } = await apiCreatePost(title, content)
    if (status >= 200 && status < 300) {
      data.comments = data.comments || []
      posts.value.unshift(data)
      return { success: true }
    }
    return { success: false, error: 'Failed to create post. Please try again.' }
  }

  const addComment = async (postId: number, content: string) => {
    const { data, status } = await apiCreateComment(postId, null, content)
    if (status >= 200 && status < 300) {
      const post = posts.value.find((p) => p.id === postId)
      if (post) {
        post.comments.unshift(data)
        post.commentCount = (post.commentCount || 0) + 1
      }
      return { success: true }
    }
    return { success: false, error: 'Failed to add comment. Please try again.' }
  }

  const addReplyToComment = (
    commentsList: Comment[],
    parentId: number,
    newComment: Comment
  ): boolean => {
    for (const comment of commentsList) {
      if (comment.id === parentId) {
        if (!comment.replies) comment.replies = []
        comment.replies.push(newComment)
        comment.replyCount = (comment.replyCount || 0) + 1
        return true
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = addReplyToComment(comment.replies, parentId, newComment)
        if (found) return true
      }
    }
    return false
  }

  const addReply = async (postId: number, parentCommentId: number, content: string) => {
    const { data, status } = await apiCreateComment(postId, parentCommentId, content)
    if (status >= 200 && status < 300) {
      const post = posts.value.find((p) => p.id === postId)
      if (post) {
        addReplyToComment(post.comments, parentCommentId, data)
      }
      return { success: true }
    }
    return { success: false, error: 'Failed to post reply. Please try again.' }
  }

  return {
    posts,
    hasMore,
    loadPostsError,
    isLoadingPosts,
    loadPosts,
    loadMorePosts,
    createPost,
    addComment,
    addReply
  }
})
