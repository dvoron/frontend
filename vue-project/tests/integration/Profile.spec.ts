import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import Profile from '@/views/Profile.vue'
import { useRouter } from 'vue-router'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import {useAuthStore} from "@/stores/auth";
import Profile from "@/views/Profile.vue";
// import { useAuthStore } from '@/stores/auth'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('Profile.vue Integration', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    setActivePinia(createPinia())
    
    // Setup logged in user
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
  })

  const mountComponent = () => {
    return mount(Profile, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })
  }

  it('Load Profile & Activity', async () => {
    server.use(
      http.get('/api/1', () => {
        return HttpResponse.json({ id: 1, username: 'testuser', email: 'test@example.com' })
      }),
      http.get('/api/forum/users/1/posts', () => {
        return HttpResponse.json([
          { id: 1, title: 'My First Post', content: 'Content', timestamp: '1h ago', comments: [] }
        ])
      }),
      http.get('/api/forum/users/1/comments', () => {
        return HttpResponse.json([
          { id: 1, content: 'My First Comment', timestamp: '1h ago', postTitle: 'Some Post' }
        ])
      })
    )

    const wrapper = mountComponent()
    
    // Wait for all fetches
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Profile settings check
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
    
    // Activity check
    expect(wrapper.text()).toContain('My First Post')
    expect(wrapper.text()).toContain('My First Comment')
  })

  it('Update Profile', async () => {
    server.use(
      http.get('/api/1', () => {
        return HttpResponse.json({ id: 1, username: 'testuser', email: 'test@example.com' })
      }),
      http.get('/api/forum/users/1/posts', () => HttpResponse.json([])),
      http.get('/api/forum/users/1/comments', () => HttpResponse.json([])),
      http.put('/api/1', async ({ request }) => {
        const data = (await request.json()) as Record<string, any>
        return HttpResponse.json({ id: 1, ...data })
      })
    )

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Click Edit Profile
    const buttons = wrapper.findAll('button')
    const editBtn = buttons.find(b => b.text() === 'Edit Profile')
    await editBtn!.trigger('click')
    
    // Change username and email
    await wrapper.find('input#username').setValue('updateduser')
    await wrapper.find('input#email').setValue('updated@example.com')
    
    // Save
    await wrapper.find('form').trigger('submit.prevent')
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Verify DOM updates
    expect(wrapper.text()).toContain('updateduser')
    expect(wrapper.text()).toContain('updated@example.com')
    expect(wrapper.text()).toContain('Profile updated successfully!')
  })

  it('Delete Account', async () => {
    server.use(
      http.get('/api/1', () => {
        return HttpResponse.json({ id: 1, username: 'testuser', email: 'test@example.com' })
      }),
      http.get('/api/forum/users/1/posts', () => HttpResponse.json([])),
      http.get('/api/forum/users/1/comments', () => HttpResponse.json([])),
      http.delete('/api/1', () => {
        return new HttpResponse(null, { status: 200 })
      })
    )

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Click Edit Profile
    const buttons = wrapper.findAll('button')
    const editBtn = buttons.find(b => b.text() === 'Edit Profile')
    await editBtn!.trigger('click')
    
    // Click Delete Account
    const deleteBtns = wrapper.findAll('button')
    const deleteBtn = deleteBtns.find(b => b.text() === 'Delete Account')
    await deleteBtn!.trigger('click')
    
    // Mock login endpoint for password verification
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ accessToken: 'mock', refreshToken: 'mock' })
      })
    )
    
    // Enter password and verify
    await wrapper.find('input#deletePassword').setValue('password123')
    const verifyBtns = wrapper.findAll('button')
    const verifyBtn = verifyBtns.find(b => b.text() === 'Verify')
    await verifyBtn!.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Confirm delete in dialog
    const confirmBtns = wrapper.findAll('button')
    const confirmBtn = confirmBtns.find(b => b.text() === 'Yes, Delete')
    await confirmBtn!.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Verify store is cleared
    const store = useAuthStore()
    expect(store.accessToken).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    
    // Verify router push
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })
})
