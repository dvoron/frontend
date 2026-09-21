import { describe, it, expect } from 'vitest'
import { loginUserDto } from '@/dto/LoginUserDto'

describe('LoginUserDto', () => {
  it('should return an object with empty login and password', () => {
    const dto = loginUserDto()
    expect(dto).toEqual({
      login: '',
      password: ''
    })
  })
})
