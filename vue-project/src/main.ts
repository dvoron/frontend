import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Contact from '@/views/Contact.vue'
import { createPinia } from 'pinia'
import LogIn from '@/views/LogIn.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import { useAuthStore } from '@/stores/auth'
import Forum from '@/views/Forum.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
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

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

import logger from '@/utils/logger'

import { sanitizeAxiosError } from '@/utils/axios'

app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue Error:', sanitizeAxiosError(err), info)
}

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection:', sanitizeAxiosError(event.reason))
})

const auth = useAuthStore()
const initialRefresh = auth.tryRefresh().catch(() => false)

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Ensure we wait for the initial refresh before checking auth status
  await initialRefresh

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return {
      name: 'login'
    }
  }

  return true
})

app.use(router)
app.mount('#app')

export default router
