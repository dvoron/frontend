import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProfileDeleteAccountDialog from '@/components/ProfileDeleteAccountDialog.vue'

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
})
