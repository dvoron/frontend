import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import LogIn from '@/views/LogIn.vue'
import { useRouter } from 'vue-router'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import LogIn from "../../src/views/LogIn.vue";
import {useAuthStore} from "../../src/stores/auth";
// import { useAuthStore } from '@/stores/auth'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('LogIn.vue Integration', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    setActivePinia(createPinia())
  })

  const mountComponent = () => {
    return mount(LogIn, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })
  }

  it('Successful Login', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ accessToken: 'real-access', refreshToken: 'real-refresh' })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Enter username or email"]').setValue('testuser')
    await wrapper.find('input[placeholder="Enter password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    // Wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const store = useAuthStore()
    expect(store.accessToken).toBe('real-access')
    
    expect(mockPush).toHaveBeenCalledWith({ name: 'home' })
  })

  it('Invalid Credentials', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return new HttpResponse(null, { status: 401 })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Enter username or email"]').setValue('wronguser')
    await wrapper.find('input[placeholder="Enter password"]').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Username or password is incorrect')
  })

  it('Server Error', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const wrapper = mountComponent()
    
    await wrapper.find('input[placeholder="Enter username or email"]').setValue('testuser')
    await wrapper.find('input[placeholder="Enter password"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Something went wrong. Please try again.')
  })
})
