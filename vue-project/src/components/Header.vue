<script setup>






</script>

<template>
<!--  <header>-->
<!--  <div class="container w-screen">-->
    <nav class="bg-teal-200 flex justify-between margin-left-10-percent margin-right-10-percent header-max-height">

      <div class="text-5xl">
<!--        <div class="inline h-full flex justify-start">-->
<!--          <img src="/src/assets/images/TestLogo.png" alt="Website logo" class="">-->
<!--        </div>-->
<!--        <div class="container inline">-->
          <img src="/src/assets/images/TestLogo.png" alt="logo" class="inline h-full pb-2.5" />
<!--        </div>-->
<!--        <img src="/src/assets/images/TestLogo.png" alt="logo" class="inline object-contain h-full " />-->
<!--        <img src="/src/assets/images/TestLogo.png" alt="Website logo" class="w-full h-full object-contain" />-->
<!--        <router-link class="px-3 bg-[url('C:\Users\N0ns3ns\WebstormProjects\frontend\vue-project\src\assets\images\TestLogo.png')]" to="/home">test</router-link>-->
      </div>
      <div class="text-5xl">
        <router-link class="px-3" to="/home">Home</router-link>
        <router-link class="px-3" to="/about">About</router-link>
        <router-link class="px-3" to="/contact">Contact</router-link>
      </div>
    </nav>
    <div>
      Text size should be big
    </div>
<!--  </div>-->
<!--  <nav class="w-screen">-->
<!--      <div class="text-5xl">-->
<!--        <router-link class="px-3" to="/home">Home</router-link>-->
<!--        <router-link class="px-3" to="/about">About</router-link>-->
<!--        <router-link class="px-3" to="/contact">Contact</router-link>-->
<!--      </div>-->
<!--  </nav>-->
<!--  <div class="text">-->
<!--    Text size should be big-->
<!--  </div>-->
</template>

<style scoped>
.margin-left-10-percent {
  margin-left: 10%
}
.margin-right-10-percent {
  margin-right: 10%
}
.header-max-height {
  max-height: 3rem;
}
</style>