// services/userService.js

import axios from 'axios'

export async function createUser(dto) {
    try {
        const response = await axios.post('/api/users', {
            username: dto.username,
            email: dto.email,
            password: dto.password,
        })

        return [response.data, response.status]
    } catch (error) {
        // return error.response
        return [error.response.data, error.response.status]
    }

}

export async function login(dto) {
    try {
        const response = await axios.post('/api/login', {
            login: dto.login,
            password: dto.password,
        })
        // return await axios.post('/api/login', {
        //     login: dto.login,
        //     password: dto.password,
        // })
        return [response, response.status]
        // return [response.data, response.status]
    } catch (error) {
        return [error.response.data, error.response.status]
        // return error.response
        // return [error.response.data, error.response.status]
    }
}