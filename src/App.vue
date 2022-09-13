<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";

import { onBeforeMount } from "vue";
import { useAuthStore } from "./stores/auth"

// import HelloWorld from "./components/HelloWorld.vue";

// import "./lib/firestore";


onBeforeMount(() => {
  const { fetchUser } = useAuthStore();
  fetchUser();
})
</script>

<template>
  <div class="dark:bg-slate-900">
    <Navbar></Navbar>
  </div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- <Suspense> -->
      <RouterView />
      <!-- </Suspense> -->
    </div>
  </div>
</template>
