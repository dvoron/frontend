<script setup>


import {reactive, ref} from "vue";
import {createUserDto} from "@/dto/CreateUserDto.js";
import {createUser} from "@/services/UserService.js";
import { useRouter } from 'vue-router'

const usernameError = ref("");
const emailError = ref("");
const successfulRegistration = ref("")

const router = useRouter()

// function changePasswordVisibility() {
//   if (passwordVisibilityType.value === "password") {
//     passwordVisibilityType.value = "text";
//   }
//   else {
//     passwordVisibilityType.value = "password"
//   }
// }

const registerForm = reactive(createUserDto())


// TODO if needed, handle the case when both email and username taken(currently not accounted for visually)
async function submit() {
  const [registrationResponseData, registrationResponseStatus] = await createUser(registerForm)
  if (registrationResponseStatus === 200) {
    console.log("User successfully registered")
    usernameError.value = "";
    emailError.value = "";
    successfulRegistration.value = "Registration successful! Redirecting shortly"
    // Named route
    setTimeout(() => {
      router.push({name: "login"});
    }, 5000);
    // Absolute path
    // setTimeout(() => {
    //   router.push("/home/login");
    // }, 5000);
  } else if (registrationResponseStatus === 409) {
      if (registrationResponseData.code === "EMAIL_ALREADY_TAKEN") {
        console.log("email already taken")
        emailError.value = registrationResponseData.message
        usernameError.value = "";
      } else if (registrationResponseData.code === "USERNAME_ALREADY_TAKEN") {
          console.log("username already taken")
          usernameError.value = registrationResponseData.message
          emailError.value = "";
      }
  }
}
</script>
<template>
  <div class="w-full grid grid-cols-12 gap-4">
    <div class="col-start-6 col-span-2 text-center">Register</div>
    <form @submit.prevent="submit">
      <div>
        Username
      </div>
      <input
          v-model="registerForm.username"
          placeholder="Username"
      />
      <p v-if="usernameError">
        {{ usernameError }}
      </p>
      <div>
        Email
      </div>
      <input
          v-model="registerForm.email"
          type="email"
          placeholder="Email"
      />
      <p v-if="emailError">
        {{ emailError }}
      </p>
      <div>
        Password
      </div>
      <input
          v-model="registerForm.password"
          type="password"
          placeholder="Password"
      />
<!--    <div class="col-start-6 col-span-2 text-start">-->
<!--      <div>-->
<!--        Email-->
<!--      </div>-->
<!--      <div class="grid grid-cols-12">-->
<!--        <div class="col-start-2 col-span-11">-->
<!--          <input v-model="email" placeholder="Enter email">-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="col-start-6 col-span-2 text-start">-->
<!--      <div>-->
<!--        Username-->
<!--      </div>-->
<!--      <div class="grid grid-cols-12">-->
<!--        <div class="col-start-2 col-span-11">-->
<!--          <input v-model="username" placeholder="Enter username">-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->


<!--    <div class="col-start-6 col-span-2 text-start">-->
<!--      <div>-->
<!--        Password-->
<!--      </div>-->
<!--      <div class="grid grid-cols-12">-->
<!--        <div class="col-start-2 col-span-11">-->
<!--          <input v-model="password" placeholder="Enter password">-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div class="col-start-6 col-span-2 text-start">-->
<!--      <div>-->
<!--        Password-->
<!--      </div>-->
<!--      <div class="grid grid-cols-12">-->
<!--        <div class="col-start-2 col-span-11">-->
<!--          <input v-model="password" :type="passwordVisibilityType" placeholder="Enter password">-->
<!--        </div>-->
<!--      </div>-->
<!--      <div class="grid grid-cols-12">-->
<!--        <div class="col-start-1 col-span-1 flex justify-center items-center">-->
<!--          <input type="checkbox" id="showPassword"  @change="changePasswordVisibility">-->
<!--        </div>-->
<!--        <div class="col-start-2 col-span-11">-->
<!--          Show password-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

<!--    <div class="col-start-6 col-span-2 text-center">-->
<!--      <button type="button" @click="onRegister" >Create account</button>-->
<!--    </div>-->
      <button type="submit">
        Create Account 2
      </button>
      <p v-if="successfulRegistration">
        {{ successfulRegistration }}
      </p>
  </form>
    <div class="col-start-6 col-span-2 text-center">
      <div >
        <router-link to="/home/login">Already have an account? Login</router-link>
      </div>
    </div>

  </div>
<div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>
  <div>Hello register</div>


</template>

<style scoped>

</style>