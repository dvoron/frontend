import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register, logout, getUserById, updateUser, deleteUser, refresh } from '@/services/UserService'
import { request } from '@/utils/axios'

vi.mock('@/utils/axios', () => ({
  request: vi.fn()
}))

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockData = { token: '123' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await login({ login: 'user', password: 'password' })

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/auth/login',
        data: {
          login: 'user',
          password: 'password'
        }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })
  
  describe('refresh', () => {
    it('should refresh successfully', async () => {
      const mockData = { token: 'new123' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await refresh()

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/auth/refresh',
        data: {}
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockData = { id: 1 }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 201, ok: true })

      const { data, status, ok } = await register({ username: 'user', email: 'e@e.com', password: 'password' })

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/auth/register',
        data: {
          username: 'user',
          email: 'e@e.com',
          password: 'password'
        }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
      expect(ok).toBe(true)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(request).mockResolvedValueOnce({ data: {}, status: 200, ok: true })

      await logout()

      expect(request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/auth/logout',
        data: {}
      })
    })
  })

  describe('getUserById', () => {
    it('should get user successfully', async () => {
      const mockData = { id: 1, name: 'user' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await getUserById(1)

      expect(request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/users/1'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockData = { id: 1, name: 'updated' }
      vi.mocked(request).mockResolvedValueOnce({ data: mockData, status: 200, ok: true })

      const { data, status, ok } = await updateUser(1, { name: 'updated' })

      expect(request).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/api/users/1',
        data: { name: 'updated' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      vi.mocked(request).mockResolvedValueOnce({ data: null, status: 204, ok: true })

      const { data, status, ok } = await deleteUser(1, 'password123')

      expect(request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/api/users/1',
        data: { password: 'password123' }
      })
      expect(data).toBeNull()
      expect(status).toBe(204)
      expect(ok).toBe(true)
    })
  })
})