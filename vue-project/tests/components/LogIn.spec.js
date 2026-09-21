import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LogIn from '@/views/LogIn.vue'
import { login } from '@/services/UserService'
import { useRouter } from 'vue-router'

vi.mock('@/services/UserService', () => ({
  login: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('LogIn.vue', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useRouter.mockReturnValue({ push: mockPush })
  })

  const mountComponent = () => {
    return mount(LogIn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          RouterLink: true
        }
      }
    })
  }

  it('renders login form correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.find('input[placeholder="Enter username or email"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Enter password"]').exists()).toBe(true)
  })

  it('updates form data on input', async () => {
    const wrapper = mountComponent()
    
    const loginInput = wrapper.find('input[placeholder="Enter username or email"]')
    await loginInput.setValue('testuser')
    
    const passwordInput = wrapper.find('input[placeholder="Enter password"]')
    await passwordInput.setValue('password123')
    
    expect(wrapper.vm.loginFormDto.login).toBe('testuser')
    expect(wrapper.vm.loginFormDto.password).toBe('password123')
  })

  it('toggles password visibility', async () => {
    const wrapper = mountComponent()
    const passwordInput = wrapper.find('input[placeholder="Enter password"]')
    
    expect(passwordInput.attributes('type')).toBe('password')
    
    const checkbox = wrapper.find('input[type="checkbox"]')
    await checkbox.setValue(true)
    
    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('handles successful login', async () => {
    login.mockResolvedValueOnce([{ accessToken: 'token', refreshToken: 'refresh' }, 200])
    
    const wrapper = mountComponent()
    await wrapper.find('input[placeholder="Enter username or email"]').setValue('testuser')
    await wrapper.find('input[placeholder="Enter password"]').setValue('password123')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(login).toHaveBeenCalledWith({ login: 'testuser', password: 'password123' })
    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'home' })
  })

  it('handles login error (401)', async () => {
    login.mockResolvedValueOnce([{}, 401])
    
    const wrapper = mountComponent()
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Username or password is incorrect')
  })
})
