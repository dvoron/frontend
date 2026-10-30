import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '@/stores/auth'
import ProfileSettings from '@/components/ProfileSettings.vue'
import ProfileDeleteAccountDialog from '@/components/ProfileDeleteAccountDialog.vue'
import { updateUser } from '@/services/UserService'
import { useRouter } from 'vue-router'

vi.mock('@/services/UserService', () => ({
  updateUser: vi.fn()
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      currentRoute: { value: { fullPath: '/profile' } }
    })),
    useRoute: vi.fn(() => ({ query: {} }))
  }
})

describe('ProfileSettings.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: { auth: { accessToken: 'mock-token' } }
          })
        ],
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
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('toggles edit mode and emits editingChange', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.emitted('editingChange')).toBeTruthy()
    expect(wrapper.emitted('editingChange')![0]).toEqual([true])
  })

  it('cancels edit mode and resets values', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button

    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('newname')
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('newemail')

    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel')
    if (cancelBtn) await cancelBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('editingChange')![1]).toEqual([false])
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('saves profile successfully without changing password', async () => {
    vi.mocked(updateUser).mockResolvedValueOnce({ data: {}, status: 200, ok: true } as any)

    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click') // Edit Profile button

    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('updateduser')
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('updateemail@example.com')

    const oldPasswordInput = wrapper.find('#oldPassword')
    await oldPasswordInput.setValue('oldpass')

    await wrapper.find('form').trigger('submit.prevent')

    expect(updateUser).toHaveBeenCalledWith(1, {
      username: 'updateduser',
      email: 'updateemail@example.com',
      oldPassword: 'oldpass'
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Profile updated successfully!')
    expect(wrapper.emitted('profileUpdated')).toBeTruthy()
    expect(wrapper.emitted('profileUpdated')![0]).toEqual([
      { username: 'updateduser', email: 'updateemail@example.com' }
    ])
  })

  it('shows error if email is changed without old password', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click')

    const emailInput = wrapper.find('#email')
    await emailInput.setValue('newemail@example.com')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Please enter your current password to save these changes.')
  })

  it('shows error if new password is provided without old password', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click')

    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass')

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Please enter your current password to save these changes.')
  })

  it('saves profile successfully with password change', async () => {
    vi.mocked(updateUser).mockResolvedValueOnce({ data: {}, status: 200, ok: true } as any)

    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click')

    const oldPasswordInput = wrapper.find('#oldPassword')
    await oldPasswordInput.setValue('oldpass123')

    const newPasswordInput = wrapper.find('#newPassword')
    await newPasswordInput.setValue('newpass123')

    await wrapper.find('form').trigger('submit.prevent')

    expect(updateUser).toHaveBeenCalledWith(1, {
      username: 'testuser',
      email: 'test@example.com',
      oldPassword: 'oldpass123',
      newPassword: 'newpass123'
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Profile updated successfully!')
  })

  it('shows error if profile update fails', async () => {
    vi.mocked(updateUser).mockResolvedValueOnce({
      data: { message: 'Update failed' },
      status: 400,
      ok: false
    } as any)

    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click')

    await wrapper.find('form').trigger('submit.prevent')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Update failed')
  })

  it('shows error if profile update fails without errorMessage', async () => {
    vi.mocked(updateUser).mockResolvedValueOnce({ data: {}, status: 500, ok: false } as any)

    const wrapper = mountComponent()
    const store = useAuthStore()
    store.setTokens('mock-token')
    store.accessToken =
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) +
      '.' +
      btoa(JSON.stringify({ sub: 1, username: 'testuser' })) +
      '.signature'
    await wrapper.find('button').trigger('click')

    await wrapper.find('form').trigger('submit.prevent')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('Failed to update profile.')
  })

  it('shows error if user is not authenticated when saving', async () => {
    const wrapper = mountComponent()
    const store = useAuthStore()
    store.accessToken = null

    await wrapper.find('button').trigger('click')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('User is not authenticated.')
  })
})
