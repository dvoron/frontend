import axios from 'axios'

export async function getAllPosts(accessToken) {
    try {
        const response = await axios.get('/api/forum/posts', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response?.data, error.response?.status]
    }
}

export async function createPost(title, content, accessToken) {
    try {
        const response = await axios.post('/api/forum/posts', {
            title,
            content
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response?.data, error.response?.status]
    }
}

export async function createComment(postId, parentCommentId, content, accessToken) {
    try {
        const response = await axios.post('/api/forum/comments', {
            postId,
            parentCommentId,
            content
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response?.data, error.response?.status]
    }
}

export async function getUserPosts(userId, accessToken) {
    try {
        const response = await axios.get(`/api/forum/users/${userId}/posts`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response?.data, error.response?.status]
    }
}

export async function getUserComments(userId, accessToken) {
    try {
        const response = await axios.get(`/api/forum/users/${userId}/comments`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response?.data, error.response?.status]
    }
}
