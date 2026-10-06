import apiClient from '@/utils/axios'
import type { LoginUserDto } from '@/dto/LoginUserDto'
import type { CreateUserDto } from '@/dto/CreateUserDto'
import axios from 'axios'

export async function login(dto: LoginUserDto) {
    try {
        const response = await apiClient.post('/api/auth/login', {
            login: dto.login,
            password: dto.password,
        })
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function refresh() {
    try {
        const response = await apiClient.post('/api/auth/refresh', {})
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function register(dto: CreateUserDto) {
    try {
        const response = await apiClient.post('/api/auth/register', {
            username: dto.username,
            email: dto.email,
            password: dto.password,
        })
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function logout(accessToken: string) {
    try {
        await apiClient.post('/api/auth/logout', {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    } catch (_) {
        // Errors during logout are ignored — tokens are cleared locally regardless
    }
}

export async function getUserById(id: number, accessToken: string) {
    try {
        const response = await apiClient.get(`/api/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function updateUser(id: number, user: any, accessToken: string) {
    try {
        const response = await apiClient.put(`/api/${id}`, user, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function deleteUser(id: number, accessToken: string) {
    try {
        const response = await apiClient.delete(`/api/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}
