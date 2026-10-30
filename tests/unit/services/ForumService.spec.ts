import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllPosts,
  createPost,
  createComment,
  getUserPosts,
  getUserComments,
  getPostComments,
  getCommentReplies
} from '@/services/ForumService'
import { request } from '@/utils/axios'

vi.mock('@/utils/axios', () => ({
  request: vi.fn()
}))

describe('ForumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('should get all posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getAllPosts()

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/forum/posts?size=10'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockData = { id: 1, title: 'New Post' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 201, ok: true })

      const { data, status, ok } = await createPost('New Post', 'Content')

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/forum/posts',
        data: {
          title: 'New Post',
          content: 'Content'
        }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
      expect(ok).toBe(true)
    })
  })

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      const mockData = { id: 1, content: 'Comment' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 201, ok: true })

      const { data, status, ok } = await createComment(1, null, 'Comment')

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/forum/comments',
        data: {
          postId: 1,
          parentCommentId: null,
          content: 'Comment'
        }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
      expect(ok).toBe(true)
    })
  })

  describe('getUserPosts', () => {
    it('should get user posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getUserPosts(1)

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/forum/users/1/posts'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('getUserComments', () => {
    it('should get user comments successfully', async () => {
      const mockData = [{ id: 1, content: 'Comment 1' }]
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getUserComments(1)

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/forum/users/1/comments'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('getPostComments', () => {
    it('should get post comments successfully', async () => {
      const mockData = [{ id: 1, content: 'Comment 1' }]
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getPostComments(1, 0, 10)

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/forum/posts/1/comments?page=0&size=10'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('getCommentReplies', () => {
    it('should get comment replies successfully', async () => {
      const mockData = [{ id: 2, content: 'Reply 1' }]
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getCommentReplies(1, 0, 10)

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/forum/comments/1/replies?page=0&size=10'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })
})
