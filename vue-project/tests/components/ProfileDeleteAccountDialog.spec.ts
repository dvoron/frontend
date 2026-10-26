import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
// import { useAuthStore } from '@/stores/auth'
import ProfileDeleteAccountDialog from "@/components/ProfileDeleteAccountDialog.vue";
import {useAuthStore} from "@/stores/auth";
import { login, deleteUser } from '@/services/UserService'
import { useRouter } from 'vue-router'

vi.mock('@/services/UserService', () => ({
  login: vi.fn(),
  deleteUser: vi.fn()
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: vi.fn(() => ({ push: vi.fn() })),
    useRoute: vi.fn(() => ({ query: {} }))
  }
})

describe('ProfileDeleteAccountDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = (props: Record<string, any> = {}) => {
    return mount(ProfileDeleteAccountDialog, {
      props: {
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
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Are you absolutely sure?')
  })

  it('shows error if password verification fails', async () => {
    vi.mocked(deleteUser).mockResolvedValueOnce({ data: { message: 'Invalid password' }, status: 400, ok: false } as any)
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('wrongpassword')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const confirmDeleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (confirmDeleteBtn) await confirmDeleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Invalid password')
    expect(wrapper.text()).toContain('Enter password to confirm deletion')
  })

  it('shows error if password is empty on verify', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const deleteBtn = wrapper.find('button.text-red-700')
    await deleteBtn.trigger('click')
    
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    
    expect(wrapper.text()).toContain('Password is required to delete your account.')
  })

  it('deletes account successfully and redirects to login', async () => {
    vi.mocked(deleteUser).mockResolvedValueOnce({ data: {}, status: 200, ok: true } as any)
    
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
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    expect(deleteUser).toHaveBeenCalled()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mockPush).toHaveBeenCalledWith({ name: 'login' })
  })

  it('shows error if account deletion fails', async () => {
    vi.mocked(deleteUser).mockResolvedValueOnce({ data: { message: 'Delete failed' }, status: 500, ok: false } as any)
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Delete failed')
  })

  it('shows error if account deletion fails with no message', async () => {
    vi.mocked(deleteUser).mockResolvedValueOnce({ data: null, status: 500, ok: false } as any)
    
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Failed to delete account.')
  })

  it('shows error if user is not authenticated on confirm delete', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + btoa(JSON.stringify({ sub: 1, username: 'testuser' })) + '.signature'
    
    const startDeleteBtn = wrapper.find('button.text-red-700')
    await startDeleteBtn.trigger('click')
    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('mypassword')
    const verifyBtn = wrapper.findAll('button').find(b => b.text() === 'Continue')
    if (verifyBtn) await verifyBtn.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))
    
    // Simulate unauthenticated state
    store.accessToken = ''
    
    const deleteBtn = wrapper.findAll('button').find(b => b.text() === 'Yes, Delete')
    if (deleteBtn) await deleteBtn.trigger('click')
    
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('User is not authenticated.')
  })
})
