import { request } from '@/utils/axios'

export async function getAllPosts(page: number = 0, size: number = 10) {
    return request({
        method: 'GET',
        url: `/api/forum/posts?page=${page}&size=${size}`
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

export async function createComment(postId: number, parentCommentId: number | null, content: string) {
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