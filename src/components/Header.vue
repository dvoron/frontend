<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { logout } from '@/services/UserService'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isLoggingOut = ref(false)

async function onLogout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    if (authStore.accessToken) {
      await logout()
    }
  } catch (e) {
    // Ignore errors during logout, we want to clear local state anyway
  } finally {
    authStore.clearTokens()
    router.push({ name: 'login' })
    isLoggingOut.value = false
  }
}
</script>

<template>
  <nav class="bg-teal-200 flex justify-between items-center px-6 h-12">
    <div>
      <router-link class="px-3 text-lg font-bold" to="/home">Home</router-link>
      <router-link class="px-3" to="/about">About</router-link>
      <router-link class="px-3" to="/contact">Contact</router-link>
      <router-link v-if="authStore.isLoggedIn" class="px-3" to="/profile">Profile</router-link>
      <router-link class="px-3" to="/forum">Forum</router-link>
    </div>

    <div class="flex items-center gap-3">
      <template v-if="authStore.isLoggedIn">
        <button
          @click="onLogout"
          :disabled="isLoggingOut"
          class="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </template>
      <template v-else>
        <router-link
          to="/home/login"
          class="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-1 rounded"
        >
          Login
        </router-link>
        <router-link
          to="/home/register"
          class="border border-teal-600 text-teal-700 hover:bg-teal-50 text-sm font-semibold px-4 py-1 rounded"
        >
          Register
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped></style>
