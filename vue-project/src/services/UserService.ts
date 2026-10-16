import { request } from '@/utils/axios'
import type { LoginUserDto } from '@/dto/LoginUserDto'
import type { CreateUserDto } from '@/dto/CreateUserDto'
import type { UpdateUserDto } from '@/dto/UpdateUserDto'

export async function login(dto: LoginUserDto) {
    return request({
        method: 'POST',
        url: '/api/auth/login',
        data: {
            login: dto.login,
            password: dto.password,
        }
    })
}

export async function refresh() {
    return request({
        method: 'POST',
        url: '/api/auth/refresh',
        data: {}
    })
}

export async function register(dto: CreateUserDto) {
    return request({
        method: 'POST',
        url: '/api/auth/register',
        data: {
            username: dto.username,
            email: dto.email,
            password: dto.password,
        }
    })
}

export async function logout() {
    return request({
        method: 'POST',
        url: '/api/auth/logout',
        data: {}
    })
}

export async function getUserById(id: number) {
    return request({
        method: 'GET',
        url: `/api/users/${id}`
    })
}

export async function updateUser(id: number, user: UpdateUserDto) {
    return request({
        method: 'PUT',
        url: `/api/users/${id}`,
        data: user
    })
}

export async function deleteUser(id: number, password?: string) {
    return request({
        method: 'DELETE',
        url: `/api/users/${id}`,
        data: { password }
    })
}