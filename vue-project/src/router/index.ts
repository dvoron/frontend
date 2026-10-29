import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import LogIn from '@/views/LogIn.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Forum from '@/views/Forum.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LogIn
        },
        {
          path: 'register',
          name: 'register',
          component: Register
        }
      ]
    },
    { path: '/about', name: 'about', component: About },
    { path: '/contact', name: 'contact', component: Contact },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    { path: '/forum', name: 'forum', component: Forum },
    { path: '/:pathMatch(.*)*', redirect: '/home' }
  ]
})

let initialRefreshPromise: Promise<boolean> | null = null

export const initRouterAuth = () => {
  const auth = useAuthStore()
  initialRefreshPromise = auth.tryRefresh().catch(() => false)
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Ensure we wait for the initial refresh before checking auth status
  if (initialRefreshPromise) {
    await initialRefreshPromise
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }

  // Prevent logged-in users from accessing login/register pages
  if (auth.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'home' }
  }

  return true
})

export default router
