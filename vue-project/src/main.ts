import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router, { initRouterAuth } from '@/router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

import logger from '@/utils/logger'
import { sanitizeAxiosError, setAuthFailCallback } from '@/utils/axios'

setAuthFailCallback(() => {
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

app.config.errorHandler = (err, instance, info) => {
  logger.error('Vue Error:', sanitizeAxiosError(err), info)
}

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection:', sanitizeAxiosError(event.reason))
})

initRouterAuth()

app.use(router)
app.mount('#app')
