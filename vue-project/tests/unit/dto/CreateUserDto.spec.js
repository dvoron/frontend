import { describe, it, expect } from 'vitest'
import { createUserDto } from '@/dto/CreateUserDto'

describe('CreateUserDto', () => {
  it('should return an object with empty username, email, and password', () => {
    const dto = createUserDto()
    expect(dto).toEqual({
      username: '',
      email: '',
      password: ''
    })
  })
})
