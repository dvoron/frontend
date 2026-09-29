import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import Register from '@/views/Register.vue'
import { useRouter } from 'vue-router'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import Register from "../../src/views/Register.vue";
import {useAuthStore} from "../../src/stores/auth";
// import { useAuthStore } from '@/stores/auth'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('Register.vue Integration', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    setActivePinia(createPinia())
  })

  const mountComponent = () => {
    return mount(Register, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })
  }

  it('Successful Registration', async () => {
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json({ accessToken: 'real-access', refreshToken: 'real-refresh' })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Username"]').setValue('newuser')
    await wrapper.find('input[placeholder="Email"]').setValue('newuser@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const store = useAuthStore()
    expect(store.accessToken).toBe('real-access')
    
    expect(mockPush).toHaveBeenCalledWith({ name: 'home' })
  })

  it('Username Taken', async () => {
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json({ code: 'USERNAME_ALREADY_TAKEN', message: 'Username is already taken' }, { status: 409 })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Username"]').setValue('existinguser')
    await wrapper.find('input[placeholder="Email"]').setValue('newuser@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Username is already taken')
  })

  it('Email Taken', async () => {
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json({ code: 'EMAIL_ALREADY_TAKEN', message: 'Email is already in use' }, { status: 409 })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Username"]').setValue('newuser')
    await wrapper.find('input[placeholder="Email"]').setValue('existing@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Email is already in use')
  })

  it('Server Error', async () => {
    server.use(
      http.post('/api/auth/register', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Username"]').setValue('newuser')
    await wrapper.find('input[placeholder="Email"]').setValue('newuser@example.com')
    await wrapper.find('input[placeholder="Password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Something went wrong. Please try again.')
  })
})
