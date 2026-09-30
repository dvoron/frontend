import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import Profile from '@/views/Profile.vue'
import { useRouter } from 'vue-router'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import {useAuthStore} from "@/stores/auth";
import Profile from "@/views/Profile.vue";
import ProfileActivityList from '@/components/ProfileActivityList.vue'
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

  it('redirects to login when user is not authenticated', async () => {
    const store = useAuthStore()
    store.accessToken = null
    
    mountComponent()
    
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('uses data.name if data.username is missing', async () => {
    server.use(
      http.get('/api/1', () => {
        return HttpResponse.json({ id: 1, name: 'fallbackname', email: 'fallback@example.com' })
      }),
      http.get('/api/forum/users/1/posts', () => HttpResponse.json([])),
      http.get('/api/forum/users/1/comments', () => HttpResponse.json([]))
    )

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('fallbackname')
    expect(wrapper.text()).toContain('fallback@example.com')
  })

  it('shows error message when failing to load profile data', async () => {
    server.use(
      http.get('/api/1', () => {
        return new HttpResponse(null, { status: 500 })
      }),
      http.get('/api/forum/users/1/posts', () => HttpResponse.json([])),
      http.get('/api/forum/users/1/comments', () => HttpResponse.json([]))
    )

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.text()).toContain('Failed to load profile data.')
  })

  it('ProfileActivityList returns early when no user or token', async () => {
    const store = useAuthStore()
    store.accessToken = null
    
    let fetchCalled = false
    server.use(
      http.get('/api/forum/users/:id/posts', () => {
        fetchCalled = true
        return HttpResponse.json([])
      }),
      http.get('/api/forum/users/:id/comments', () => {
        fetchCalled = true
        return HttpResponse.json([])
      })
    )

    const wrapper = mount(ProfileActivityList, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(fetchCalled).toBe(false)
  })

  it('ProfileActivityList button filtering (posts, comments, both)', async () => {
    server.use(
      http.get('/api/1', () => {
        return HttpResponse.json({ id: 1, username: 'testuser', email: 'test@example.com' })
      }),
      http.get('/api/forum/users/1/posts', () => {
        return HttpResponse.json([
          { id: 1, title: 'My Filter Post', content: 'Post Content', timestamp: '1h ago', comments: [] }
        ])
      }),
      http.get('/api/forum/users/1/comments', () => {
        return HttpResponse.json([
          { id: 1, content: 'My Filter Comment', timestamp: '1h ago', postTitle: 'Some Post' }
        ])
      })
    )

    const wrapper = mountComponent()
    
    // Wait for all fetches
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Find filter buttons
    const buttons = wrapper.findAll('button')
    const allBtn = buttons.find(b => b.text().includes('All Activity'))
    const postsBtn = buttons.find(b => b.text().includes('Posts (1)'))
    const commentsBtn = buttons.find(b => b.text().includes('Comments (1)'))

    expect(allBtn).toBeDefined()
    expect(postsBtn).toBeDefined()
    expect(commentsBtn).toBeDefined()

    // Initially both should be visible
    expect(wrapper.text()).toContain('My Filter Post')
    expect(wrapper.text()).toContain('My Filter Comment')

    // Click 'Posts'
    await postsBtn!.trigger('click')
    expect(wrapper.text()).toContain('My Filter Post')
    expect(wrapper.text()).not.toContain('My Filter Comment')

    // Click 'Comments'
    await commentsBtn!.trigger('click')
    expect(wrapper.text()).not.toContain('My Filter Post')
    expect(wrapper.text()).toContain('My Filter Comment')

    // Click 'All Activity'
    await allBtn!.trigger('click')
    expect(wrapper.text()).toContain('My Filter Post')
    expect(wrapper.text()).toContain('My Filter Comment')
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
