<script setup lang="ts">
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
</script>

<template>
  <Header />
  <div>
    <router-view />
  </div>
  <Footer />
</template>

<style scoped></style>
