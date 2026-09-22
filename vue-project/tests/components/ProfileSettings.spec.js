import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProfileSettings from '@/components/ProfileSettings.vue'
import ProfileDeleteAccountDialog from '@/components/ProfileDeleteAccountDialog.vue'

vi.mock('@/services/UserService', () => ({
  updateUser: vi.fn()
}))

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
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('newemail')
    
    // We mocked the dialog, so we need to mock the cancelEdit method on the ref if it's called
    // But since it's a stub, the ref might not have cancelDelete. We can mock it or just test the emit.
    // Let's just check if cancelEdit method works.
    wrapper.vm.cancelEdit()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('editingChange')[1]).toEqual([false])
    expect(wrapper.vm.user.username).toBe('testuser')
    expect(wrapper.vm.user.email).toBe('test@example.com')
  })

  it('saves profile successfully without changing password', async () => {
    const { updateUser } = await import('@/services/UserService')
    updateUser.mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click') // Edit Profile button
    
    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('updateduser')
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('updateemail')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(updateUser).toHaveBeenCalledWith(null, { username: 'updateduser', email: 'updateemail' }, null)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.successMessage).toBe('Profile updated successfully!')
    expect(wrapper.emitted('profileUpdated')).toBeTruthy()
    expect(wrapper.emitted('profileUpdated')[0]).toEqual([{ username: 'updateduser', email: 'updateemail' }])
  })

  it('shows error if new password is provided without old password', async () => {
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click')
    
    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.vm.errorMessage).toBe('Please enter your old password to set a new one.')
  })

  it('saves profile successfully with password change', async () => {
    const { updateUser } = await import('@/services/UserService')
    updateUser.mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click')
    
    const oldPasswordInput = wrapper.find('#oldPassword')
    await oldPasswordInput.setValue('oldpass')
    
    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(updateUser).toHaveBeenCalledWith(null, {
      username: 'testuser',
      email: 'test@example.com',
      oldPassword: 'oldpass',
      newPassword: 'newpass'
    }, null)
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.successMessage).toBe('Profile updated successfully!')
  })

  it('shows error if profile update fails', async () => {
    const { updateUser } = await import('@/services/UserService')
    updateUser.mockResolvedValueOnce([{ message: 'Update failed' }, 400])
    
    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.errorMessage).toBe('Update failed')
  })

  it('shows error if profile update fails without errorMessage', async () => {
    const { updateUser } = await import('@/services/UserService')
    updateUser.mockResolvedValueOnce([{}])

    const wrapper = mountComponent()
    await wrapper.find('button').trigger('click')

    await wrapper.find('form').trigger('submit.prevent')

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.errorMessage).toBe('Failed to update profile.')

  })
})
