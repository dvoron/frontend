<script setup>


import {reactive, ref} from "vue";
import {createUserDto} from "@/dto/CreateUserDto.js";
import {login} from "@/services/UserService.js";
import {loginUserDto} from "@/dto/LoginUserDto.js";
import {useRouter} from "vue-router";

// let usernameOrEmail = ref(null)
const incorrectUsernameOrPassword = ref("")
let passwordVisibilityType = ref("password")

const loginFormDto = reactive(loginUserDto())
const router = useRouter()
// const baseLoginForm = ref({})
// Creates a copy of baseLoginForm so we can reset this form later without issues
// const form = ref({ ...baseLoginForm })

// AKA LogIn
async function onSignIn() {
  const [responseData, responseStatus] = await login(loginFormDto)
  // console.log(form)
  // form.value = {...baseLoginForm}
  // console.log(form)
  if (responseStatus === 401) {
    console.log(responseData)
    incorrectUsernameOrPassword.value = "Username or password is incorrect";

  } else if (responseStatus === 200) {
    incorrectUsernameOrPassword.value = "";
    setTimeout(() => {
      router.push({name: "home"});
    }, 1000);

  }
  console.log(responseData)
  console.log(responseStatus)
  console.log("Signing in since there is no backend")
  console.log("I should probably redirect to the home page")

}
function changePasswordVisibility() {
  if (passwordVisibilityType.value === "password") {
    passwordVisibilityType.value = "text";
  }
  else {
    passwordVisibilityType.value = "password"
  }
}



</script>

<template>
<div class="w-full grid grid-cols-12 gap-4">
  <div class="col-start-6 col-span-2 text-center">Login</div>


  <p v-if="incorrectUsernameOrPassword">
    {{ incorrectUsernameOrPassword }}
  </p>
  <form @submit.prevent="onSignIn">
  <div class="col-start-6 col-span-2 text-start">
    <div>
      Username or Email
    </div>

    <div class="grid grid-cols-12">
      <div class="col-start-2 col-span-11">
        <input v-model="loginFormDto.login" placeholder="Enter username or email">
      </div>
    </div>
  </div>


  <div class="col-start-6 col-span-2 text-start">
    <div>
      Password
    </div>
    <div class="grid grid-cols-12">
      <div class="col-start-2 col-span-11">
        <input v-model="loginFormDto.password" :type="passwordVisibilityType" placeholder="Enter password">
      </div>
    </div>
    <div class="grid grid-cols-12">
      <div class="col-start-1 col-span-1 flex justify-center items-center">
          <input type="checkbox" id="showPassword"  @change="changePasswordVisibility">
      </div>
      <div class="col-start-2 col-span-11">
        Show password
      </div>
    </div>
  </div>

  <div class="col-start-6 col-span-2 text-center">
    <button type="submit" >Sign in</button>
  </div>
  </form>

  <div class="col-start-6 col-span-2 text-center">
    <div>
      Forgot Username / Password?
    </div>
    <div >
      <router-link to="/home/register">Dont have an account? Sign up</router-link>
    </div>
  </div>

</div>
</template>

<style scoped>

</style>