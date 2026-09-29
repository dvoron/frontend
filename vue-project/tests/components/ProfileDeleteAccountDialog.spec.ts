import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
// import { useAuthStore } from '@/stores/auth'
import ProfileDeleteAccountDialog from "@/components/ProfileDeleteAccountDialog.vue";
import {useAuthStore} from "@/stores/auth";

vi.mock('@/services/UserService', () => ({
  login: vi.fn(),
  deleteUser: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}))

describe('ProfileDeleteAccountDialog.vue', () => {
  const mountComponent = (props: Record<string, any> = {}) => {
    return mount(ProfileDeleteAccountDialog, {
      props: {
        email: 'test@example.com',
        isSaving: false,
        errorMessage: '',
        ...props
      },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: { auth: { accessToken: 'mock-token' } } })]
      }
    })
  }

  it('renders standard footer initially', () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    expect(wrapper.text()).toContain('Delete Account')
    expect(wrapper.text()).toContain('Save Changes')
  })

  it('transitions to password state when Delete Account is clicked', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700') // Delete Account button
    await deleteBtn.trigger('click')
    
    expect(wrapper.text()).toContain('Enter password to confirm deletion')
  })

  it('cancels deletion and returns to idle state', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    if (cancelBtn) await cancelBtn.trigger('click')
    
    expect(wrapper.text()).not.toContain('Enter password to confirm deletion')
    expect(wrapper.text()).toContain('Delete Account')
  })

  it('emits cancelEdit when cancel button in standard footer is clicked', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    if (cancelBtn) await cancelBtn.trigger('click')
    
    expect(wrapper.emitted('cancelEdit')).toBeTruthy()
  })

  it('verifies password and transitions to confirm state', async () => {
    const { login } = await import('@/services/UserService')
    vi.mocked(login).mockResolvedValueOnce([{}, 200])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    expect(login).toHaveBeenCalledWith({ login: 'test@example.com', password: 'mypassword' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Are you absolutely sure?')
  })

  it('shows error if password verification fails', async () => {
    const { login } = await import('@/services/UserService')
    vi.mocked(login).mockResolvedValueOnce([{}, 401])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('wrongpassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Incorrect password.')
    expect(wrapper.text()).toContain('Enter password to confirm deletion')
  })

  it('shows error if password is empty on verify', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    expect(wrapper.text()).toContain('Password is required to delete your account.')
  })

  it('deletes account successfully and redirects to login', async () => {
    const { deleteUser, login } = await import('@/services/UserService')
    vi.mocked(login).mockResolvedValueOnce([{}, 200])
    vi.mocked(deleteUser).mockResolvedValueOnce([{}, 200])
    
    const { useRouter } = await import('vue-router')
    const mockPush = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any)
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    expect(deleteUser).toHaveBeenCalled()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('shows error if account deletion fails', async () => {
    const { deleteUser, login } = await import('@/services/UserService')
    vi.mocked(login).mockResolvedValueOnce([{}, 200])
    vi.mocked(deleteUser).mockResolvedValueOnce([{ message: 'Delete failed' }, 500])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Delete failed')
  })

  it('shows error if account deletion fails with no message', async () => {
    const { deleteUser, login } = await import('@/services/UserService')
    vi.mocked(login).mockResolvedValueOnce([{}, 200])
    vi.mocked(deleteUser).mockResolvedValueOnce([null, 500])
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Verify')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Failed to delete account.')
  })
})
