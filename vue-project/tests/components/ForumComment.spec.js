import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ForumComment from '@/components/ForumComment.vue'
import { useAuthStore } from '@/stores/auth'

describe('ForumComment.vue', () => {
  const defaultComment = {
    id: 1,
    author: 'testuser',
    timestamp: '2023-01-01',
    content: 'Test content',
    replies: []
  }

  const mountComponent = (comment = defaultComment, isLoggedIn = true) => {
    return mount(ForumComment, {
      props: { comment },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { accessToken: isLoggedIn ? 'token' : null }
            }
          })
        ]
      }
    })
  }

  it('renders comment details correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('u/testuser')
    expect(wrapper.text()).toContain('2023-01-01')
    expect(wrapper.text()).toContain('Test content')
  })

  it('shows Reply button when logged in', () => {
    const wrapper = mountComponent(defaultComment, true)
    expect(wrapper.find('.action-btn').exists()).toBe(true)
    expect(wrapper.find('.action-btn').text()).toBe('Reply')
  })

  it('hides Reply button when logged out', () => {
    const wrapper = mountComponent(defaultComment, false)
    expect(wrapper.find('.action-btn').exists()).toBe(false)
  })

  it('toggles reply input when Reply button is clicked', async () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.reply-input').exists()).toBe(false)

    await wrapper.find('.action-btn').trigger('click')
    expect(wrapper.find('.reply-input').exists()).toBe(true)

    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.find('.reply-input').exists()).toBe(false)
  })

  it('binds v-model on textarea and updates character counter', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.action-btn').trigger('click')

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello')

    expect(wrapper.find('.char-counter').text()).toBe('5/1000')
  })

  it('disables submit button and adds error class if content exceeds 1000 characters', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.action-btn').trigger('click')

    const textarea = wrapper.find('textarea')
    const longText = 'a'.repeat(1001)
    await textarea.setValue(longText)

    expect(wrapper.find('.char-counter').classes()).toContain('error')
    expect(wrapper.find('.btn-submit').attributes('disabled')).toBeDefined()
  })

  it('does not emit reply if content is empty or whitespace', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.action-btn').trigger('click')

    const textarea = wrapper.find('textarea')
    await textarea.setValue('   ')
    await wrapper.find('.btn-submit').trigger('click')

    expect(wrapper.emitted('reply')).toBeFalsy()
  })

  it('does not emit reply if content exceeds 1000 characters', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.action-btn').trigger('click')

    const textarea = wrapper.find('textarea')
    const longText = 'a'.repeat(1001)
    await textarea.setValue(longText)
    
    // Remove disabled attribute to force click for test
    await wrapper.find('.btn-submit').element.removeAttribute('disabled')
    await wrapper.find('.btn-submit').trigger('click')

    expect(wrapper.emitted('reply')).toBeFalsy()
  })

  it('emits reply event with correct payload on submit', async () => {
    const wrapper = mountComponent()
    await wrapper.find('.action-btn').trigger('click')

    const textarea = wrapper.find('textarea')
    await textarea.setValue('My reply')

    await wrapper.find('.btn-submit').trigger('click')

    expect(wrapper.emitted('reply')).toBeTruthy()
    expect(wrapper.emitted('reply')[0]).toEqual([1, 'My reply'])
    expect(wrapper.find('.reply-input').exists()).toBe(false)
  })

  it('recursively renders nested replies', () => {
    const commentWithReplies = {
      ...defaultComment,
      replies: [
        {
          id: 2,
          author: 'replyuser',
          timestamp: '2023-01-02',
          content: 'Nested reply',
          replies: []
        }
      ]
    }
    const wrapper = mountComponent(commentWithReplies)
    
    const nestedComments = wrapper.findAll('.comment')
    // 1 for the root, 1 for the child
    expect(nestedComments.length).toBe(2)
    expect(wrapper.text()).toContain('Nested reply')
  })

  it('emits reply event when a child comment emits reply', async () => {
    const commentWithReplies = {
      ...defaultComment,
      replies: [
        {
          id: 2,
          author: 'replyuser',
          timestamp: '2023-01-02',
          content: 'Nested reply',
          replies: []
        }
      ]
    }
    const wrapper = mountComponent(commentWithReplies)
    
    // Find the reply button inside the nested comment
    const childComment = wrapper.findAll('.comment')[1]
    await childComment.find('.action-btn').trigger('click')
    
    const textarea = childComment.find('textarea')
    await textarea.setValue('Reply to child')
    
    await childComment.find('.btn-submit').trigger('click')
    
    expect(wrapper.emitted('reply')).toBeTruthy()
    expect(wrapper.emitted('reply')[0]).toEqual([2, 'Reply to child'])
  })
})
