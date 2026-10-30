import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
// import Forum from '@/views/Forum.vue'
// import ForumComment from '@/components/ForumComment.vue'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import Forum from '@/views/Forum.vue'
import ForumComment from '@/components/ForumComment.vue'
import { useAuthStore } from '@/stores/auth'
import { useForumStore } from '@/stores/forum'

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
          {
            id: 1,
            title: 'First Post',
            content: 'This is the first post',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          },
          {
            id: 2,
            title: 'Second Post',
            content: 'This is the second post',
            author: 'user2',
            timestamp: '2h ago',
            comments: []
          }
        ])
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()

    // Wait for onMounted to fetch and render posts
    await new Promise((resolve) => setTimeout(resolve, 50))

    const posts = wrapper.findAll('.post')
    expect(posts.length).toBe(2)
    expect(posts[0].text()).toContain('First Post')
    expect(posts[1].text()).toContain('Second Post')
  })

  it('Create Post', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'First Post',
            content: 'This is the first post',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          }
        ])
      }),
      http.post('/api/forum/posts', async ({ request }) => {
        const data = (await request.json()) as Record<string, any>
        return HttpResponse.json({
          id: 2,
          author: 'testuser',
          timestamp: 'Just now',
          comments: [],
          ...data
        })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    // Mock JWT payload to set username
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Click Create Post button
    await wrapper.find('button.btn-primary').trigger('click')

    // Fill form
    await wrapper.find('input[placeholder="Title"]').setValue('New Integration Post')
    await wrapper.find('textarea[placeholder="Text (optional)"]').setValue('Post content here')

    // Submit
    const buttons = wrapper.findAll('button.btn-primary')
    const postButton = buttons.find((b) => b.text() === 'Post')
    await postButton!.trigger('click')

    await new Promise((resolve) => setTimeout(resolve, 50))

    const posts = wrapper.findAll('.post')
    expect(posts.length).toBe(2)
    expect(posts[0].text()).toContain('New Integration Post')
    expect(posts[0].text()).toContain('Post content here')
  })

  it('Add Comment', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'First Post',
            content: 'This is the first post',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          }
        ])
      }),
      http.post('/api/forum/comments', async ({ request }) => {
        const data = (await request.json()) as Record<string, any>
        return HttpResponse.json({
          id: 101,
          author: 'testuser',
          timestamp: 'Just now',
          replies: [],
          ...data
        })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Open comments
    await wrapper.find('.action-btn').trigger('click')

    // Fill comment
    await wrapper
      .find('textarea[placeholder="What are your thoughts?"]')
      .setValue('This is a test comment')

    // Submit comment
    const commentButton = wrapper.find('.comment-btn-container button')
    await commentButton.trigger('click')

    await new Promise((resolve) => setTimeout(resolve, 50))

    // Verify comment is rendered
    const commentsList = wrapper.find('.comments-list')
    expect(commentsList.text()).toContain('This is a test comment')
  })

  it('displays Guest when username is not in token', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'First Post',
            content: 'This is the first post',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          }
        ])
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    // Token without username
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1 })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Open comments to see the "Comment as Guest" text
    await wrapper.find('.action-btn').trigger('click')

    expect(wrapper.find('.add-comment p').text()).toContain('Comment as Guest')
  })

  it('loads posts even if not logged in', async () => {
    const getPostsMock = vi.fn()
    server.use(
      http.get('/api/forum/posts', () => {
        getPostsMock()
        return HttpResponse.json([
          {
            id: 1,
            title: 'Public Post',
            content: 'Public content',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          }
        ])
      })
    )

    const store = useAuthStore()
    store.clearTokens() // No access token

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(getPostsMock).toHaveBeenCalled()
    const posts = wrapper.findAll('.post')
    expect(posts.length).toBe(1)
    expect(posts[0].text()).toContain('Public Post')
  })

  it('createPost early returns on invalid inputs or missing token', async () => {
    const createPostMock = vi.fn()
    server.use(
      http.get('/api/forum/posts', () => HttpResponse.json([])),
      http.post('/api/forum/posts', () => {
        createPostMock()
        return HttpResponse.json({})
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 1. Empty title
    const vm = wrapper.vm as any
    vm.newPost.title = '   '
    await vm.createPost()
    expect(createPostMock).not.toHaveBeenCalled()

    // 2. Title too long
    vm.newPost.title = 'a'.repeat(256)
    await vm.createPost()
    expect(createPostMock).not.toHaveBeenCalled()

    // 3. Content too long
    vm.newPost.title = 'Valid Title'
    vm.newPost.content = 'a'.repeat(2001)
    await vm.createPost()
    expect(createPostMock).not.toHaveBeenCalled()

    // 4. Missing token
    vm.newPost.content = 'Valid content'
    store.clearTokens()
    await vm.createPost()
    expect(createPostMock).not.toHaveBeenCalled()
  })

  it('addComment early returns on invalid inputs or missing token', async () => {
    const createCommentMock = vi.fn()
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'First Post',
            content: 'This is the first post',
            author: 'user1',
            timestamp: '1h ago',
            comments: []
          }
        ])
      }),
      http.post('/api/forum/comments', () => {
        createCommentMock()
        return HttpResponse.json({})
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Open comments
    await wrapper.find('.action-btn').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    const textarea = wrapper.find('textarea[placeholder="What are your thoughts?"]')
    const commentButton = wrapper.find('.comment-btn-container button')

    // 1. Empty comment
    await textarea.setValue('   ')
    await commentButton.trigger('click')
    expect(createCommentMock).not.toHaveBeenCalled()

    // 2. Comment too long
    await textarea.setValue('a'.repeat(1001))
    await commentButton.trigger('click')
    expect(createCommentMock).not.toHaveBeenCalled()

    // 3. Missing token
    await textarea.setValue('Valid comment')
    store.clearTokens()
    await commentButton.trigger('click')
    expect(createCommentMock).not.toHaveBeenCalled()
  })

  it('store addReply and recursive addReplyToComment', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'Post with Comments',
            content: 'Content',
            author: 'user1',
            timestamp: '1h ago',
            comments: [
              {
                id: 10,
                author: 'user2',
                timestamp: '30m ago',
                content: 'Top level comment',
                replies: []
              },
              {
                id: 11,
                author: 'user3',
                timestamp: '20m ago',
                content: 'Another top level',
                replies: [
                  {
                    id: 12,
                    author: 'user4',
                    timestamp: '10m ago',
                    content: 'Nested comment',
                    replies: []
                  }
                ]
              }
            ]
          }
        ])
      }),
      http.post('/api/forum/comments', async ({ request }) => {
        const data = (await request.json()) as Record<string, any>
        return HttpResponse.json({
          id: 999,
          author: 'testuser',
          timestamp: 'Just now',
          replies: [],
          ...data
        })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    const forumStore = useForumStore()

    // 1. Test addReply for a top-level comment (id: 10)
    await forumStore.addReply(1, 10, 'Reply to top level')
    expect(forumStore.posts[0].comments[0].replies!.length).toBe(1)
    expect(forumStore.posts[0].comments[0].replies![0].content).toBe('Reply to top level')

    // 2. Test addReply for a nested comment (id: 12) - tests recursive addReplyToComment
    await forumStore.addReply(1, 12, 'Reply to nested')
    expect(forumStore.posts[0].comments[1].replies![0].replies!.length).toBe(1)
    expect(forumStore.posts[0].comments[1].replies![0].replies![0].content).toBe('Reply to nested')
  })

  it('loading replies and then replying', async () => {
    server.use(
      http.get('/api/forum/posts', () => {
        return HttpResponse.json([
          {
            id: 1,
            title: 'Post with Replies',
            content: 'Content',
            author: 'user1',
            timestamp: '1h ago',
            comments: [
              {
                id: 10,
                author: 'user2',
                timestamp: '30m ago',
                content: 'Top level comment',
                replyCount: 2,
                replies: []
              }
            ]
          }
        ])
      }),
      http.get('/api/forum/comments/:id/replies', ({ params }) => {
        if (params.id === '10') {
          return HttpResponse.json([
            {
              id: 11,
              author: 'user3',
              timestamp: '20m ago',
              content: 'Loaded reply 1',
              replies: []
            },
            {
              id: 12,
              author: 'user4',
              timestamp: '10m ago',
              content: 'Loaded reply 2',
              replies: []
            }
          ])
        }
        return HttpResponse.json([])
      }),
      http.post('/api/forum/comments', async ({ request }) => {
        const data = (await request.json()) as Record<string, any>
        return HttpResponse.json({
          id: 999,
          author: 'testuser',
          timestamp: 'Just now',
          replies: [],
          ...data
        })
      })
    )

    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ username: 'testuser' })) +
      '.signature'

    const wrapper = mountComponent()
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Expand comments section
    await wrapper.find('.action-btn').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    const topComment = wrapper.find('.comments-list > .comment')

    // Click "Load Replies"
    const loadRepliesBtn = topComment
      .findAll('.action-btn')
      .find((b) => b.text() === 'Load Replies')
    expect(loadRepliesBtn).toBeDefined()
    await loadRepliesBtn!.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Assert that the loaded replies are visible
    expect(topComment.text()).toContain('Loaded reply 1')
    expect(topComment.text()).toContain('Loaded reply 2')

    // Click "Reply" on the top level comment
    const replyBtn = topComment.findAll('.action-btn').find((b) => b.text() === 'Reply')
    await replyBtn!.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    // Fill and submit reply
    const replyInput = topComment.find('.reply-input textarea')
    await replyInput.setValue('My new reply to the top level comment')

    const submitBtn = topComment.find('.btn-submit')
    await submitBtn.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))
    await wrapper.vm.$nextTick() // Ensure reactivity is completely flushed

    // The loaded replies should not disappear
    expect(topComment.text()).toContain('Loaded reply 1')
    expect(topComment.text()).toContain('Loaded reply 2')

    // The new reply should be visible in the UI
    expect(topComment.text()).toContain('My new reply to the top level comment')
  })
})
