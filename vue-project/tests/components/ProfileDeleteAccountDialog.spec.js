import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProfileDeleteAccountDialog from '@/components/ProfileDeleteAccountDialog.vue'

vi.mock('@/services/UserService', () => ({
  login: vi.fn(),
  deleteUser: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}))

describe('ProfileDeleteAccountDialog.vue', () => {
  const mountComponent = (props = {}) => {
    return mount(ProfileDeleteAccountDialog, {
      props: {
        email: 'test@example.com',
        isSaving: false,
        errorMessage: '',
        ...props
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })]
      }
    })
  }

  it('renders standard footer initially', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Delete Account')
    expect(wrapper.text()).toContain('Save Changes')
  })

  it('transitions to password state when Delete Account is clicked', async () => {
    const wrapper = mountComponent()
    const deleteBtn = wrapper.find('button.text-red-700') // Delete Account button
    await deleteBtn.trigger('click')
    
    expect(wrapper.vm.deleteState).toBe('password')
    expect(wrapper.text()).toContain('Enter password to confirm deletion')
  })

  it('cancels deletion and returns to idle state', async () => {
    const wrapper = mountComponent()
    wrapper.vm.startDelete()
    await wrapper.vm.$nextTick()
    
    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelBtn.trigger('click')
    
    expect(wrapper.vm.deleteState).toBe('idle')
  })

  it('emits cancelEdit when cancel button in standard footer is clicked', async () => {
    const wrapper = mountComponent()
    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelBtn.trigger('click')
    
    expect(wrapper.emitted('cancelEdit')).toBeTruthy()
  })

  it('verifies password and transitions to confirm state', async () => {
    const { login } = await import('@/services/UserService')
    login.mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    wrapper.vm.startDelete()
    await wrapper.vm.$nextTick()
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    await verifyBtn.trigger('click')
    
    expect(login).toHaveBeenCalledWith({ login: 'test@example.com', password: 'mypassword' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.deleteState).toBe('confirm')
  })

  it('shows error if password verification fails', async () => {
    const { login } = await import('@/services/UserService')
    login.mockResolvedValueOnce([{}, 401])
    
    const wrapper = mountComponent()
    wrapper.vm.startDelete()
    await wrapper.vm.$nextTick()
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('wrongpassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    await verifyBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.deleteError).toBe('Incorrect password.')
    expect(wrapper.vm.deleteState).toBe('password')
  })

  it('shows error if password is empty on verify', async () => {
    const wrapper = mountComponent()
    wrapper.vm.startDelete()
    await wrapper.vm.$nextTick()
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    await verifyBtn.trigger('click')
    
    expect(wrapper.vm.deleteError).toBe('Password is required to delete your account.')
  })

  it('deletes account successfully and redirects to login', async () => {
    const { deleteUser } = await import('@/services/UserService')
    deleteUser.mockResolvedValueOnce([{}, 200])
    
    const { useRouter } = await import('vue-router')
    const mockPush = vi.fn()
    useRouter.mockReturnValue({ push: mockPush })
    
    const wrapper = mountComponent()
    wrapper.vm.deleteState = 'confirm'
    await wrapper.vm.$nextTick()
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    await deleteBtn.trigger('click')
    
    expect(deleteUser).toHaveBeenCalled()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('shows error if account deletion fails', async () => {
    const { deleteUser } = await import('@/services/UserService')
    deleteUser.mockResolvedValueOnce([{ message: 'Delete failed' }, 500])
    
    const wrapper = mountComponent()
    wrapper.vm.deleteState = 'confirm'
    await wrapper.vm.$nextTick()
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.deleteError).toBe('Delete failed')
  })

  it('shows error if account deletion fails with no message', async () => {
    const { deleteUser } = await import('@/services/UserService')
    deleteUser.mockResolvedValueOnce([null, 500])
    
    const wrapper = mountComponent()
    wrapper.vm.deleteState = 'confirm'
    await wrapper.vm.$nextTick()
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.vm.deleteError).toBe('Failed to delete account.')
  })
})
