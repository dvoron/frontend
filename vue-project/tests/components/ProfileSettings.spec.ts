import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import ProfileSettings from "@/components/ProfileSettings.vue";
import ProfileDeleteAccountDialog from "@/components/ProfileDeleteAccountDialog.vue";

vi.mock('@/services/UserService', () => ({
  updateUser: vi.fn()
}))

describe('ProfileSettings.vue', () => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com'
  }

  const mountComponent = (props: Record<string, any> = {}) => {
    return mount(ProfileSettings, {
      props: {
        initialUser: defaultUser,
        isLoading: false,
        ...props
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { auth: { accessToken: 'mock-token' } } })],
        stubs: {
          ProfileDeleteAccountDialog: {
            template: '<div>{{ errorMessage }}</div>',
            props: ['errorMessage'],
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
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('toggles edit mode and emits editingChange', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.emitted('editingChange')).toBeTruthy()
    expect(wrapper.emitted('editingChange')![0]).toEqual([true])
  })

  it('cancels edit mode and resets values', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('newname')
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('newemail')
    
    // We mocked the dialog, so we need to mock the cancelEdit method on the ref if it's called
    // But since it's a stub, the ref might not have cancelDelete. We can mock it or just test the emit.
    // Let's just check if cancelEdit method works.
    wrapper.findComponent(ProfileDeleteAccountDialog).vm.$emit('cancelEdit')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('editingChange')![1]).toEqual([false])
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('saves profile successfully without changing password', async () => {
    const { updateUser } = await import('@/services/UserService')
    vi.mocked(updateUser).mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('updateduser')
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('updateemail')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(updateUser).toHaveBeenCalledWith(1, { username: 'updateduser', email: 'updateemail' }, expect.any(String))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Profile updated successfully!')
    expect(wrapper.emitted('profileUpdated')).toBeTruthy()
    expect(wrapper.emitted('profileUpdated')![0]).toEqual([{ username: 'updateduser', email: 'updateemail' }])
  })

  it('shows error if new password is provided without old password', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click')
    
    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.text()).toContain('Please enter your old password to set a new one.')
  })

  it('saves profile successfully with password change', async () => {
    const { updateUser } = await import('@/services/UserService')
    vi.mocked(updateUser).mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click')
    
    const oldPasswordInput = wrapper.find('#oldPassword')
    await oldPasswordInput.setValue('oldpass')
    
    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(updateUser).toHaveBeenCalledWith(1, {
      username: 'testuser',
      email: 'test@example.com',
      oldPassword: 'oldpass',
      newPassword: 'newpass'
    }, expect.any(String))
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Profile updated successfully!')
  })

  it('shows error if profile update fails', async () => {
    const { updateUser } = await import('@/services/UserService')
    vi.mocked(updateUser).mockResolvedValueOnce([{ message: 'Update failed' }, 400])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Update failed')
  })

  it('shows error if profile update fails without errorMessage', async () => {
    const { updateUser } = await import('@/services/UserService')
    vi.mocked(updateUser).mockResolvedValueOnce([{}])

    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    await wrapper.find('button').trigger('click')

    await wrapper.find('form').trigger('submit.prevent')

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Failed to update profile.')

  })
})
