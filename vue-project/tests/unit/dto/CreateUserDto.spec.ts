import { describe, it, expect } from 'vitest'
import {createEmptyCreateUserDto} from "../../../src/dto/CreateUserDto";
// import { createEmptyCreateUserDto } from '@/dto/CreateUserDto'

describe('CreateUserDto', () => {
  it('should return an object with empty username, email, and password', () => {
    const dto = createEmptyCreateUserDto()
    expect(dto).toEqual({
      username: '',
      email: '',
      password: ''
    })
  })
})
