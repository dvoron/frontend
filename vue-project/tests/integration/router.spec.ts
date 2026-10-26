import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock window.matchMedia if needed by any components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Create #app element for main.ts to mount to
const appDiv = document.createElement('div')
appDiv.id = 'app'
document.body.appendChild(appDiv)

import router from '@/router'
import { useAuthStore } from '@/stores/auth'

describe('Router Navigation Guards', () => {
  beforeEach(() => {
    // main.ts already creates and activates pinia, but we can reset it if needed
    // setActivePinia(createPinia())
  })

  it('redirects to login when accessing profile unauthenticated', async () => {
    const store = useAuthStore()
    store.accessToken = null // Ensure user is unauthenticated

    // Attempt to navigate to the protected route
    await router.push('/profile')
    await router.isReady()

    // Verify the router intercepted the navigation and sent the user to login
    expect(router.currentRoute.value.name).toBe('login')
  })
  
  it('allows access to profile when authenticated', async () => {
    const store = useAuthStore()
    store.accessToken = 'fake-valid-token' // Ensure user is authenticated

    // Attempt to navigate to the protected route
    await router.push('/profile')
    await router.isReady()

    // Verify the router allowed the navigation
    expect(router.currentRoute.value.name).toBe('profile')
  })
})
