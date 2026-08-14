<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-teal-200 mt-auto px-6 py-4 flex flex-col items-center gap-1 text-sm text-teal-900">
    <div class="flex gap-6">
      <router-link to="/home" class="hover:underline">Home</router-link>
      <router-link to="/about" class="hover:underline">About</router-link>
      <router-link to="/contact" class="hover:underline">Contact</router-link>
    </div>
    <p class="text-teal-700">&copy; {{ year }} MyApp. All rights reserved.</p>
  </footer>
</template>

<style scoped></style>
