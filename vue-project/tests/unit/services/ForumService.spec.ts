import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { getAllPosts, createPost, createComment, getUserPosts, getUserComments } from '@/services/ForumService'

vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    isAxiosError: vi.fn((err: any) => !!err?.isAxiosError),
    create: vi.fn(function(this: any) { return this; }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
  return { default: mockAxios }
})

describe('ForumService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPosts', () => {
    it('should get all posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData, status: 200 } as any)

      const [data, status] = await getAllPosts()

      expect(axios.get).toHaveBeenCalledWith('/api/forum/posts')
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get all posts error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 500 } }
      vi.mocked(axios.get).mockRejectedValueOnce(mockError as any)

      const [data, status] = await getAllPosts()

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })

    it('should handle get all posts network error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'))

      const [data, status] = await getAllPosts()

      expect(data).toEqual({ message: 'Network error occurred' })
      expect(status).toBe(503)
    })
  })

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const mockData = { id: 1, title: 'New Post' }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockData, status: 201 } as any)

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
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 400 } }
      vi.mocked(axios.post).mockRejectedValueOnce(mockError as any)

      const [data, status] = await createPost('New Post', 'Content', 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })

    it('should handle create post network error', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'))

      const [data, status] = await createPost('New Post', 'Content', 'token123')

      expect(data).toEqual({ message: 'Network error occurred' })
      expect(status).toBe(503)
    })
  })

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      const mockData = { id: 1, content: 'Comment' }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockData, status: 201 } as any)

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
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 400 } }
      vi.mocked(axios.post).mockRejectedValueOnce(mockError as any)

      const [data, status] = await createComment(1, null, 'Comment', 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })

    it('should handle create comment network error', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'))

      const [data, status] = await createComment(1, null, 'Comment', 'token123')

      expect(data).toEqual({ message: 'Network error occurred' })
      expect(status).toBe(503)
    })
  })

  describe('getUserPosts', () => {
    it('should get user posts successfully', async () => {
      const mockData = [{ id: 1, title: 'Post 1' }]
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData, status: 200 } as any)

      const [data, status] = await getUserPosts(1, 'token123')

      expect(axios.get).toHaveBeenCalledWith('/api/forum/users/1/posts', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get user posts error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 500 } }
      vi.mocked(axios.get).mockRejectedValueOnce(mockError as any)

      const [data, status] = await getUserPosts(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })

    it('should handle get user posts network error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'))

      const [data, status] = await getUserPosts(1, 'token123')

      expect(data).toEqual({ message: 'Network error occurred' })
      expect(status).toBe(503)
    })
  })

  describe('getUserComments', () => {
    it('should get user comments successfully', async () => {
      const mockData = [{ id: 1, content: 'Comment 1' }]
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData, status: 200 } as any)

      const [data, status] = await getUserComments(1, 'token123')

      expect(axios.get).toHaveBeenCalledWith('/api/forum/users/1/comments', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get user comments error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 500 } }
      vi.mocked(axios.get).mockRejectedValueOnce(mockError as any)

      const [data, status] = await getUserComments(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(500)
    })

    it('should handle get user comments network error', async () => {
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network Error'))

      const [data, status] = await getUserComments(1, 'token123')

      expect(data).toEqual({ message: 'Network error occurred' })
      expect(status).toBe(503)
    })
  })
})
