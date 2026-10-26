import { request } from '@/utils/axios'

export async function getAllPosts(cursor?: number, size: number = 10) {
  const url = cursor 
    ? `/api/forum/posts?cursor=${cursor}&size=${size}`
    : `/api/forum/posts?size=${size}`
    
  return request({
    method: 'GET',
    url
  })
}

export async function createPost(title: string, content: string) {
  return request({
    method: 'POST',
    url: '/api/forum/posts',
    data: {
      title,
      content
    }
  })
}

export async function createComment(
  postId: number,
  parentCommentId: number | null,
  content: string
) {
  return request({
    method: 'POST',
    url: '/api/forum/comments',
    data: {
      postId,
      parentCommentId,
      content
    }
  })
}

export async function getUserPosts(userId: number) {
  return request({
    method: 'GET',
    url: `/api/forum/users/${userId}/posts`
  })
}

export async function getUserComments(userId: number) {
  return request({
    method: 'GET',
    url: `/api/forum/users/${userId}/comments`
  })
}

export async function getCommentReplies(commentId: number) {
  return request({
    method: 'GET',
    url: `/api/forum/comments/${commentId}/replies`
  })
}
