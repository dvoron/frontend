import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useRouter } from 'vue-router'
import Register from '@/views/Register.vue'
import { register } from '@/services/UserService'

vi.mock('@/services/UserService', () => ({
  register: vi.fn()
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: vi.fn(),
    useRoute: vi.fn(() => ({ query: {} }))
  }
})

describe('Register.vue', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
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
    // Note: The backend now returns 201 CREATED for success
    vi.mocked(register).mockResolvedValueOnce({
      data: { accessToken: 'token', refreshToken: 'refresh' },
      status: 201,
      ok: true
    } as any)

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

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'home' })
  })

  it('handles email already taken error (409)', async () => {
    vi.mocked(register).mockResolvedValueOnce({
      data: { code: 'EMAIL_ALREADY_TAKEN', message: 'Email in use' },
      status: 409,
      ok: false
    } as any)

    const wrapper = mountComponent()
    await wrapper.find('input[placeholder="Username"]').setValue('testuser')
    await wrapper.find('input[placeholder="Email"]').setValue('test@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Email in use')
  })

  it('handles username already taken error (409)', async () => {
    vi.mocked(register).mockResolvedValueOnce({
      data: { code: 'USERNAME_ALREADY_TAKEN', message: 'Username in use' },
      status: 409,
      ok: false
    } as any)

    const wrapper = mountComponent()
    await wrapper.find('input[placeholder="Username"]').setValue('testuser')
    await wrapper.find('input[placeholder="Email"]').setValue('test@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Username in use')
  })

  it('handles general error (500)', async () => {
    vi.mocked(register).mockResolvedValueOnce({ data: {}, status: 500, ok: false } as any)

    const wrapper = mountComponent()
    await wrapper.find('input[placeholder="Username"]').setValue('testuser')
    await wrapper.find('input[placeholder="Email"]').setValue('test@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Something went wrong. Please try again.')
  })
})
