<script setup>



import {ref} from "vue";

let email = ref(null)
let password = ref(null)
let passwordVisibilityType = ref("password")
// AKA LogIn
function onSignIn() {
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

  <div class="col-start-6 col-span-2 text-start">
    <div>
      Email
    </div>
    <div class="grid grid-cols-12">
      <div class="col-start-2 col-span-11">
        <input v-model="email" placeholder="Enter email">
      </div>
    </div>
  </div>


  <div class="col-start-6 col-span-2 text-start">
    <div>
      Password
    </div>
    <div class="grid grid-cols-12">
      <div class="col-start-2 col-span-11">
        <input v-model="password" :type="passwordVisibilityType" placeholder="Enter password">
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
    <button type="button" @click="onSignIn" >Sign in</button>
  </div>

  <div class="col-start-6 col-span-2 text-center">
    <div>
      Forgot Username / Password?
    </div>
    <div >
      Dont have an account? Sign up
    </div>
  </div>

</div>
</template>

<style scoped>

</style>