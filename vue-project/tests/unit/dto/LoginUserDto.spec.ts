import { describe, it, expect } from 'vitest'
import { createEmptyLoginUserDto } from '@/dto/LoginUserDto'

describe('LoginUserDto', () => {
  it('should return an object with empty login and password', () => {
    const dto = createEmptyLoginUserDto()
    expect(dto).toEqual({
      login: '',
      password: ''
    })
  })
})
