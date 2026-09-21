import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getAllPosts, createPost, createComment, getUserPosts, getUserComments } from '@/services/ForumService'

vi.mock('axios')

describe('ForumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('should get all posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      axios.get.mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await getAllPosts('token123')

      expect(axios.get).toHaveBeenCalledWith('/api/forum/posts', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get all posts error', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 500 } }
      axios.get.mockRejectedValueOnce(mockError)

      const [data, status] = await getAllPosts('token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })
  })

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockData = { id: 1, title: 'New Post' }
      axios.post.mockResolvedValueOnce({ data: mockData, status: 201 })

      const [data, status] = await createPost('New Post', 'Content', 'token123')

      expect(axios.post).toHaveBeenCalledWith('/api/forum/posts', {
        title: 'New Post',
        content: 'Content'
      }, {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
    })

    it('should handle create post error', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } }
      axios.post.mockRejectedValueOnce(mockError)

      const [data, status] = await createPost('New Post', 'Content', 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })
  })

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      const mockData = { id: 1, content: 'Comment' }
      axios.post.mockResolvedValueOnce({ data: mockData, status: 201 })

      const [data, status] = await createComment(1, null, 'Comment', 'token123')

      expect(axios.post).toHaveBeenCalledWith('/api/forum/comments', {
        postId: 1,
        parentCommentId: null,
        content: 'Comment'
      }, {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
    })

    it('should handle create comment error', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } }
      axios.post.mockRejectedValueOnce(mockError)

      const [data, status] = await createComment(1, null, 'Comment', 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })
  })

  describe('getUserPosts', () => {
    it('should get user posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      axios.get.mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await getUserPosts(1, 'token123')

      expect(axios.get).toHaveBeenCalledWith('/api/forum/users/1/posts', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get user posts error', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 500 } }
      axios.get.mockRejectedValueOnce(mockError)

      const [data, status] = await getUserPosts(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })
  })

  describe('getUserComments', () => {
    it('should get user comments successfully', async () => {
      const mockData = [{ id: 1, content: 'Comment 1' }]
      axios.get.mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await getUserComments(1, 'token123')

      expect(axios.get).toHaveBeenCalledWith('/api/forum/users/1/comments', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get user comments error', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 500 } }
      axios.get.mockRejectedValueOnce(mockError)

      const [data, status] = await getUserComments(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })
  })
})
