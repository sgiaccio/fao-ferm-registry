<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue"
// import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <div class="dark:bg-slate-900">
    <Navbar></Navbar>
  </div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <RouterView />
    </div>
  </div>
</template>
