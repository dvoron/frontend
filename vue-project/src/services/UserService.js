import axios from 'axios'

export async function login(dto) {
    try {
        const response = await axios.post('/api/auth/login', {
            login: dto.login,
            password: dto.password,
        })
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function refresh() {
    try {
        const response = await axios.post('/api/auth/refresh', {})
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function register(dto) {
    try {
        const response = await axios.post('/api/auth/register', {
            username: dto.username,
            email: dto.email,
            password: dto.password,
        })
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function logout(accessToken) {
    try {
        await axios.post('/api/auth/logout', {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
    } catch (_) {
        // Errors during logout are ignored — tokens are cleared locally regardless
    }
}

export async function getUserById(id, accessToken) {
    try {
        const response = await axios.get(`/api/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function updateUser(id, user, accessToken) {
    try {
        const response = await axios.put(`/api/${id}`, user, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}

export async function deleteUser(id, accessToken) {
    try {
        const response = await axios.delete(`/api/${id}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        return [response.data, response.status]
    } catch (error) {
        if (error.response) {
            return [error.response.data, error.response.status]
        }
        return [{ message: 'Network error occurred' }, 503]
    }
}
