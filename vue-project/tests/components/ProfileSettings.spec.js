import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProfileSettings from '@/components/ProfileSettings.vue'
import ProfileDeleteAccountDialog from '@/components/ProfileDeleteAccountDialog.vue'

describe('ProfileSettings.vue', () => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com'
  }

  const mountComponent = (props = {}) => {
    return mount(ProfileSettings, {
      props: {
        initialUser: defaultUser,
        isLoading: false,
        ...props
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          ProfileDeleteAccountDialog: {
            template: '<div />',
            methods: {
              cancelDelete: vi.fn()
            }
          }
        }
      }
    })
  }

  it('renders user info when not editing', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('toggles edit mode and emits editingChange', async () => {
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.emitted('editingChange')).toBeTruthy()
    expect(wrapper.emitted('editingChange')[0]).toEqual([true])
  })

  it('cancels edit mode and resets values', async () => {
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('newname')
    
    // We mocked the dialog, so we need to mock the cancelEdit method on the ref if it's called
    // But since it's a stub, the ref might not have cancelDelete. We can mock it or just test the emit.
    // Let's just check if cancelEdit method works.
    wrapper.vm.cancelEdit()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('editingChange')[1]).toEqual([false])
    expect(wrapper.vm.user.username).toBe('testuser')
  })
})
