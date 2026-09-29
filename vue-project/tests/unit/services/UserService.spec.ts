import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { login, register, logout, getUserById, updateUser, deleteUser } from '../../../src/services/UserService'

vi.mock('axios')
axios.isAxiosError = vi.fn((err) => !!err?.isAxiosError)

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockData = { token: '123' }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await login({ login: 'user', password: 'password' })

      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        login: 'user',
        password: 'password'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle login error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 401 } }
      vi.mocked(axios.post).mockRejectedValueOnce(mockError)

      const [data, status] = await login({ login: 'user', password: 'password' })

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(401)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockData = { id: 1 }
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockData, status: 201 })

      const [data, status] = await register({ username: 'user', email: 'e@e.com', password: 'password' })

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        username: 'user',
        email: 'e@e.com',
        password: 'password'
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(201)
    })

    it('should handle register error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 400 } }
      vi.mocked(axios.post).mockRejectedValueOnce(mockError)

      const [data, status] = await register({ username: 'user', email: 'e@e.com', password: 'password' })

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({})

      await logout('token123')

      expect(axios.post).toHaveBeenCalledWith('/api/auth/logout', {}, {
        headers: { Authorization: 'Bearer token123' }
      })
    })

    it('should ignore logout errors', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'))

      await expect(logout('token123')).resolves.toBeUndefined()
    })
  })

  describe('getUserById', () => {
    it('should get user successfully', async () => {
      const mockData = { id: 1, name: 'user' }
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await getUserById(1, 'token123')

      expect(axios.get).toHaveBeenCalledWith('/api/1', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle get user error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Not found' }, status: 404 } }
      vi.mocked(axios.get).mockRejectedValueOnce(mockError)

      const [data, status] = await getUserById(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(404)
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockData = { id: 1, name: 'updated' }
      vi.mocked(axios.put).mockResolvedValueOnce({ data: mockData, status: 200 })

      const [data, status] = await updateUser(1, { name: 'updated' }, 'token123')

      expect(axios.put).toHaveBeenCalledWith('/api/1', { name: 'updated' }, {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toEqual(mockData)
      expect(status).toBe(200)
    })

    it('should handle update user error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 400 } }
      vi.mocked(axios.put).mockRejectedValueOnce(mockError)

      const [data, status] = await updateUser(1, { name: 'updated' }, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(400)
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({ data: null, status: 204 })

      const [data, status] = await deleteUser(1, 'token123')

      expect(axios.delete).toHaveBeenCalledWith('/api/1', {
        headers: { Authorization: 'Bearer token123' }
      })
      expect(data).toBeNull()
      expect(status).toBe(204)
    })

    it('should handle delete user error', async () => {
      const mockError = { isAxiosError: true, response: { data: { message: 'Error' }, status: 403 } }
      vi.mocked(axios.delete).mockRejectedValueOnce(mockError)

      const [data, status] = await deleteUser(1, 'token123')

      expect(data).toEqual(mockError.response.data)
      expect(status).toBe(403)
    })
  })
})
