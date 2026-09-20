<script setup>
import { useAuthStore } from "@/stores/auth.js"

const authStore = useAuthStore()
</script>

<template>
  <div class="p-8">
    <div v-if="authStore.isLoggedIn">
      <h1 class="text-2xl font-semibold">Welcome back!</h1>
      <p class="text-gray-600 mt-2">You are logged in.</p>
    </div>
    <div v-else>
      <h1 class="text-2xl font-semibold">Welcome!</h1>
      <p class="text-gray-600 mt-2">
        Please
        <router-link to="/home/login" class="text-teal-600 hover:underline">login</router-link>
        or
        <router-link to="/home/register" class="text-teal-600 hover:underline">register</router-link>
        to continue.
      </p>
    </div>

    <router-view />
  </div>
</template>

<style scoped></style>
