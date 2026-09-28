<script setup>
import { reactive, ref } from "vue"
import { loginUserDto } from "@/dto/LoginUserDto.js"
import { login } from "@/services/UserService.js"
import { useAuthStore } from "@/stores/auth.js"
import { useRouter } from "vue-router"

const loginFormDto = reactive(loginUserDto())
const errorMessage = ref("")
let passwordVisibilityType = ref("password")

const authStore = useAuthStore()
const router = useRouter()

async function onSignIn() {
  errorMessage.value = ""
  const [data, status] = await login(loginFormDto)

  if (status === 200) {
    authStore.setTokens(data.accessToken)
    router.push({ name: "home" })
  } else if (status === 401) {
    errorMessage.value = "Username or password is incorrect"
  } else {
    errorMessage.value = "Something went wrong. Please try again."
  }
}

function changePasswordVisibility() {
  passwordVisibilityType.value = passwordVisibilityType.value === "password" ? "text" : "password"
}
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-4">
    <div class="col-start-5 col-span-4 text-center text-2xl font-semibold mt-8">Login</div>

    <form @submit.prevent="onSignIn" class="col-start-5 col-span-4 flex flex-col gap-3">
      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

      <div class="flex flex-col gap-1">
        <label>Username or Email</label>
        <input
          v-model="loginFormDto.login"
          placeholder="Enter username or email"
          class="border rounded px-3 py-2"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label>Password</label>
        <input
          v-model="loginFormDto.password"
          :type="passwordVisibilityType"
          placeholder="Enter password"
          class="border rounded px-3 py-2"
        />
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" @change="changePasswordVisibility" />
          Show password
        </label>
      </div>

      <button
        type="submit"
        class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded"
      >
        Sign In
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
