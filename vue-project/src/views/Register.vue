<script setup lang="ts">
import { reactive, ref } from "vue"
import { createEmptyCreateUserDto, type CreateUserDto } from "@/dto/CreateUserDto";
import { register } from "@/services/UserService"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"

const registerForm = reactive<CreateUserDto>(createEmptyCreateUserDto())
const usernameError = ref("")
const emailError = ref("")
const passwordError = ref("")
const generalError = ref("")
const isPending = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function submit() {
  if (isPending.value) return
  isPending.value = true
  usernameError.value = ""
  emailError.value = ""
  passwordError.value = ""
  generalError.value = ""

  let hasError = false

  if (!registerForm.username) {
    usernameError.value = "Username is required"
    hasError = true
  } else if (registerForm.username.includes("@")) {
    usernameError.value = "Username cannot contain '@'"
    hasError = true
  }

  if (!registerForm.email) {
    emailError.value = "Email is required"
    hasError = true
  }

  if (!registerForm.password) {
    passwordError.value = "Password is required"
    hasError = true
  }

  if (hasError) {
    isPending.value = false
    return
  }

  try {
    const { data, status } = await register(registerForm)

    if (status === 200) {
      authStore.setTokens(data.accessToken)
      router.push({ name: "home" })
    } else if (status === 409) {
      if (data.code === "EMAIL_ALREADY_TAKEN") {
        emailError.value = data.message
      } else if (data.code === "USERNAME_ALREADY_TAKEN") {
        usernameError.value = data.message
      } else {
        generalError.value = data.message || "Something went wrong. Please try again."
      }
    } else {
      generalError.value = "Something went wrong. Please try again."
    }
  } finally {
    isPending.value = false
  }
}
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-4">
    <div class="col-start-5 col-span-4 text-center text-2xl font-semibold mt-8">Register</div>

    <form @submit.prevent="submit" class="col-start-5 col-span-4 flex flex-col gap-3">
      <p v-if="generalError" class="text-red-600 text-sm">{{ generalError }}</p>

      <div class="flex flex-col gap-1">
        <label for="register-username">Username</label>
        <input
          id="register-username"
          v-model="registerForm.username"
          placeholder="Username"
          class="border rounded px-3 py-2"
        />
        <p v-if="usernameError" class="text-red-600 text-sm">{{ usernameError }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label for="register-email">Email</label>
        <input
          id="register-email"
          v-model="registerForm.email"
          type="email"
          placeholder="Email"
          class="border rounded px-3 py-2"
        />
        <p v-if="emailError" class="text-red-600 text-sm">{{ emailError }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label for="register-password">Password</label>
        <input
          id="register-password"
          v-model="registerForm.password"
          type="password"
          placeholder="Password"
          class="border rounded px-3 py-2"
        />
        <p v-if="passwordError" class="text-red-600 text-sm">{{ passwordError }}</p>
      </div>

      <button
        type="submit"
        :disabled="isPending"
        class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isPending ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <div class="col-start-5 col-span-4 text-center text-sm mt-2">
      <router-link to="/home/login" class="text-teal-600 hover:underline">
        Already have an account? Login
      </router-link>
    </div>
  </div>
</template>

<style scoped></style>
