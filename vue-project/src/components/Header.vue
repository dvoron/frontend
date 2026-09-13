<script setup>
import { useAuthStore } from "@/stores/auth.js"
import { logout } from "@/services/UserService.js"
import { useRouter } from "vue-router"

const authStore = useAuthStore()
const router = useRouter()

async function onLogout() {
  await logout(authStore.accessToken)
  authStore.clearTokens()
  router.push({ name: "login" })
}
</script>

<template>
  <nav class="bg-teal-200 flex justify-between items-center px-6 h-12">
    <div>
      <router-link class="px-3 text-lg font-bold" to="/home">Home</router-link>
      <router-link class="px-3" to="/about">About</router-link>
      <router-link class="px-3" to="/contact">Contact</router-link>
      <router-link v-if="authStore.isLoggedIn" class="px-3" to="/profile">Profile</router-link>
    </div>

    <div class="flex items-center gap-3">
      <template v-if="authStore.isLoggedIn">
        <button
          @click="onLogout"
          class="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1 rounded"
        >
          Logout
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
