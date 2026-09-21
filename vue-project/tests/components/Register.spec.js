import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import Register from '@/views/Register.vue'
import { register } from '@/services/UserService'
import { useRouter } from 'vue-router'

vi.mock('@/services/UserService', () => ({
  register: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('Register.vue', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useRouter.mockReturnValue({ push: mockPush })
  })

  const mountComponent = () => {
    return mount(Register, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          RouterLink: true
        }
      }
    })
  }

  it('renders register form correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.find('input[placeholder="Username"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Email"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Password"]').exists()).toBe(true)
  })

  it('handles successful registration', async () => {
    // Note: The component checks for status 200 instead of 201 for success
    register.mockResolvedValueOnce([{ accessToken: 'token', refreshToken: 'refresh' }, 200])
    
    const wrapper = mountComponent()
    await wrapper.find('input[placeholder="Username"]').setValue('testuser')
    await wrapper.find('input[placeholder="Email"]').setValue('test@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    })
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'home' })
  })

  it('handles email already taken error (409)', async () => {
    register.mockResolvedValueOnce([{ code: 'EMAIL_ALREADY_TAKEN', message: 'Email in use' }, 409])
    
    const wrapper = mountComponent()
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Email in use')
  })

  it('handles username already taken error (409)', async () => {
    register.mockResolvedValueOnce([{ code: 'USERNAME_ALREADY_TAKEN', message: 'Username in use' }, 409])
    
    const wrapper = mountComponent()
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Username in use')
  })
})
