import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import Forum from '@/views/Forum.vue'
// import ForumComment from '@/components/ForumComment.vue'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import Forum from "../../src/views/Forum.vue";
import ForumComment from "../../src/components/ForumComment.vue";
import {useAuthStore} from "../../src/stores/auth";
// import { useAuthStore } from '@/stores/auth'

describe('Forum.vue Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountComponent = () => {
    return mount(Forum, {
      global: {
        components: {
          ForumComment
        }
      }
    })
  }

  it('Load Posts', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          { id: 1, title: 'First Post', content: 'This is the first post', author: 'user1', timestamp: '1h ago', comments: [] },
          { id: 2, title: 'Second Post', content: 'This is the second post', author: 'user2', timestamp: '2h ago', comments: [] }
        ])
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ username: 'testuser' })) + '.signature'

    const wrapper = mountComponent()
    
    // Wait for onMounted to fetch and render posts
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const posts = wrapper.findAll('.post')
    expect(posts.length).toBe(2)
    expect(posts[0].text()).toContain('First Post')
    expect(posts[1].text()).toContain('Second Post')
  })

  it('Create Post', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          { id: 1, title: 'First Post', content: 'This is the first post', author: 'user1', timestamp: '1h ago', comments: [] }
        ])
      }),
      http.post('/api/forum/posts', async ({ request }) => {
        const data = await request.json()
        return HttpResponse.json({ id: 2, author: 'testuser', timestamp: 'Just now', comments: [], ...data })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token', 'mock-refresh')
    // Mock JWT payload to set username
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ username: 'testuser' })) + '.signature'

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Click Create Post button
    await wrapper.find('button.btn-primary').trigger('click')
    
    // Fill form
    await wrapper.find('input[placeholder="Title"]').setValue('New Integration Post')
    await wrapper.find('textarea[placeholder="Text (optional)"]').setValue('Post content here')
    
    // Submit
    const buttons = wrapper.findAll('button.btn-primary')
    const postButton = buttons.find(b => b.text() === 'Post')
    await postButton.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    const posts = wrapper.findAll('.post')
    expect(posts.length).toBe(2)
    expect(posts[0].text()).toContain('New Integration Post')
    expect(posts[0].text()).toContain('Post content here')
  })

  it('Add Comment', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          { id: 1, title: 'First Post', content: 'This is the first post', author: 'user1', timestamp: '1h ago', comments: [] }
        ])
      }),
      http.post('/api/forum/comments', async ({ request }) => {
        const data = await request.json()
        return HttpResponse.json({ id: 101, author: 'testuser', timestamp: 'Just now', replies: [], ...data })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token', 'mock-refresh')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ username: 'testuser' })) + '.signature'

    const wrapper = mountComponent()
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Open comments
    await wrapper.find('.action-btn').trigger('click')
    
    // Fill comment
    await wrapper.find('textarea[placeholder="What are your thoughts?"]').setValue('This is a test comment')
    
    // Submit comment
    const commentButton = wrapper.find('.comment-btn-container button')
    await commentButton.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Verify comment is rendered
    const commentsList = wrapper.find('.comments-list')
    expect(commentsList.text()).toContain('This is a test comment')
  })
})
