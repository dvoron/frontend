<script setup>
import HelloWorld from './components/premadeVueComponents/HelloWorld.vue'
import TheWelcome from './components/premadeVueComponents/TheWelcome.vue'
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import Cookies from "js-cookie";
import {onMounted, ref} from "vue";
import LogIn from "@/components/LogIn.vue";
import { defineStore } from 'pinia'
import {globalVariableStorage} from "@/components/Store.js";


// TODO make this not be false by default when backend will exist
// const globalVariableStorage = defineStore("globalVariableStorage", {
//       state: () => ({
//         authToken: false
//       }),
//   getters: {
//     getAuthTokenState: state => !!state.authToken
//   },
//   actions: {
//         setFalse() {
//           this.authToken = false
//         },
//         setTrue() {
//           this.authToken = true
//         }
//   }
//     }
// )
const store = globalVariableStorage()

// let authToken = ref(false)
function isAuthCookiePresent() {
  if (Cookies.get("tmp_auth_token") !== undefined) {
    store.setTrue()
    // $store.authToken.setTrue()
    // authToken.value = true;
  } else {
    store.setFalse()
    // $store.authToken.setFalse()
    // authToken.value = false;
  }
}
function showAllCookies() {
  // return console.log(document.cookie)
  return console.log(Cookies.get())
}

function addCookie() {
  Cookies.set("tmp_auth_token", "tmp_auth_token_value");
}
function removeCookie() {
  Cookies.remove("tmp_auth_token")
}
onMounted(() => {
  isAuthCookiePresent()
    }

)
// function testFunction() {
//   console.log("test")
// }


</script>

<template>
  <Header/>
  <div>
    <router-view></router-view>
  </div>
  <div>
    <button type="button" class="bg-blue-500" @click="showAllCookies">Button Show cookie</button>
  </div>
  <div>
    <button type="button" class="bg-red-300" @click="addCookie"> Add a cookie </button>
  </div>
  <div>
    <button type="button" class="bg-green-300" @click="removeCookie">Delete a cookie</button>
  </div>
  <div>
    <button type="button" class="bg-yellow-300" @click="isAuthCookiePresent">Check if auth cookie is present or not and modify based on it</button>
  </div>
  <div v-if="store.getAuthTokenState" class="bg-pink-300">
    <LogIn/>
  </div>
  <div>
    <div>Main page content</div>
  </div>

  <Footer/>
</template>

<style scoped>

</style>
