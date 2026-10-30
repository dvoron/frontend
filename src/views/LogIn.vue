<script setup lang="ts">
import { reactive, ref } from 'vue'
import { createEmptyLoginUserDto, type LoginUserDto } from '@/dto/LoginUserDto'
import { login } from '@/services/UserService'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const loginFormDto = reactive<LoginUserDto>(createEmptyLoginUserDto())
const errorMessage = ref('')
const passwordVisibilityType = ref('password')
const isPending = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function onSignIn() {
  if (isPending.value) return
  isPending.value = true
  errorMessage.value = ''

  try {
    const { data, status } = await login(loginFormDto)

    if (status === 200) {
      authStore.setTokens(data.accessToken)
      const redirectQuery = route.query.redirect
      const redirectPath = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery

      if (
        typeof redirectPath === 'string' &&
        redirectPath.startsWith('/') &&
        !redirectPath.startsWith('//')
      ) {
        router.push(redirectPath)
      } else {
        router.push({ name: 'home' })
      }
    } else if (status === 401) {
      errorMessage.value = 'Username or password is incorrect'
    } else if (status === 429) {
      errorMessage.value = data?.message || 'Account locked due to too many failed login attempts'
    } else if (status === 400) {
      errorMessage.value = data?.message || 'Invalid request. Please check your input.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  } finally {
    isPending.value = false
  }
}

function changePasswordVisibility() {
  passwordVisibilityType.value = passwordVisibilityType.value === 'password' ? 'text' : 'password'
}
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-4">
    <div class="col-start-5 col-span-4 text-center text-2xl font-semibold mt-8">Login</div>

    <form @submit.prevent="onSignIn" class="col-start-5 col-span-4 flex flex-col gap-3">
      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

      <div class="flex flex-col gap-1">
        <label for="login-username">Username or Email</label>
        <input
          id="login-username"
          v-model="loginFormDto.login"
          placeholder="Enter username or email"
          class="border rounded px-3 py-2"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="loginFormDto.password"
          :type="passwordVisibilityType"
          placeholder="Enter password"
          class="border rounded px-3 py-2"
        />
        <label class="flex items-center gap-2 text-sm" for="login-show-password">
          <input id="login-show-password" type="checkbox" @change="changePasswordVisibility" />
          Show password
        </label>
      </div>

      <button
        type="submit"
        :disabled="isPending"
        class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isPending ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>

    <div class="col-start-5 col-span-4 text-center text-sm mt-2">
      <router-link to="/home/register" class="text-teal-600 hover:underline">
        Don't have an account? Sign up
      </router-link>
    </div>
  </div>
</template>

<style scoped></style>
