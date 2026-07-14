import axios from 'axios'

export async function login(dto) {
    try {
        const response = await axios.post('/api/auth/login', {
            login: dto.login,
            password: dto.password,
        })
        return [response.data, response.status]
    } catch (error) {
        return [error.response.data, error.response.status]
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
        return [error.response.data, error.response.status]
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
