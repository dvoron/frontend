import apiClient from '@/utils/axios'
import axios from 'axios'

export async function getAllPosts(accessToken: string) {
    try {
        const response = await apiClient.get('/api/forum/posts', {
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

export async function createPost(title: string, content: string, accessToken: string) {
    try {
        const response = await apiClient.post('/api/forum/posts', {
            title,
            content
        }, {
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

export async function createComment(postId: number, parentCommentId: number | null, content: string, accessToken: string) {
    try {
        const response = await apiClient.post('/api/forum/comments', {
            postId,
            parentCommentId,
            content
        }, {
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

export async function getUserPosts(userId: number, accessToken: string) {
    try {
        const response = await apiClient.get(`/api/forum/users/${userId}/posts`, {
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

export async function getUserComments(userId: number, accessToken: string) {
    try {
        const response = await apiClient.get(`/api/forum/users/${userId}/comments`, {
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
