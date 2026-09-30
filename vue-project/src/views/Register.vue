<script setup lang="ts">
import { reactive, ref } from "vue"
import { createEmptyCreateUserDto, type CreateUserDto } from "@/dto/CreateUserDto";
import { register } from "@/services/UserService"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"

const registerForm = reactive<CreateUserDto>(createEmptyCreateUserDto())
const usernameError = ref("")
const emailError = ref("")
const generalError = ref("")

const authStore = useAuthStore()
const router = useRouter()

async function submit() {
  usernameError.value = ""
  emailError.value = ""
  generalError.value = ""

  const [data, status] = await register(registerForm)

  if (status === 200) {
    authStore.setTokens(data.accessToken)
    router.push({ name: "home" })
  } else if (status === 409) {
    if (data.code === "EMAIL_ALREADY_TAKEN") {
      emailError.value = data.message
    } else if (data.code === "USERNAME_ALREADY_TAKEN") {
      usernameError.value = data.message
    }
  } else {
    generalError.value = "Something went wrong. Please try again."
  }
}
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-4">
    <div class="col-start-5 col-span-4 text-center text-2xl font-semibold mt-8">Register</div>

    <form @submit.prevent="submit" class="col-start-5 col-span-4 flex flex-col gap-3">
      <p v-if="generalError" class="text-red-600 text-sm">{{ generalError }}</p>

      <div class="flex flex-col gap-1">
        <label>Username</label>
        <input
          v-model="registerForm.username"
          placeholder="Username"
          class="border rounded px-3 py-2"
        />
        <p v-if="usernameError" class="text-red-600 text-sm">{{ usernameError }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label>Email</label>
        <input
          v-model="registerForm.email"
          type="email"
          placeholder="Email"
          class="border rounded px-3 py-2"
        />
        <p v-if="emailError" class="text-red-600 text-sm">{{ emailError }}</p>
      </div>

      <div class="flex flex-col gap-1">
        <label>Password</label>
        <input
          v-model="registerForm.password"
          type="password"
          placeholder="Password"
          class="border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        class="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded"
      >
        Create Account
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
