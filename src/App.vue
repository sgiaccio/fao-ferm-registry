<script setup lang="ts">
import { onBeforeMount, watch } from "vue";
import { RouterView } from "vue-router";
import { storeToRefs } from 'pinia'

import Navbar from "./components/Navbar.vue";

import { useAuthStore } from "./stores/auth"
import { useUserPrefsStore } from "./stores/userPreferences"

// import HelloWorld from "./components/HelloWorld.vue";

// import "./lib/firestore";


const authStore = useAuthStore();
const userPrefsStore = useUserPrefsStore();

onBeforeMount(async () => {
  await authStore.fetchUser();
})

const { user } = storeToRefs(authStore);

watch(user, async () => {
  userPrefsStore.fetchUserPrefs();
});
</script>

<template>
  <template v-if="authStore.authLoaded">
    <div class="dark:bg-slate-900">
      <Navbar></Navbar>
    </div>
    <!-- <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto"> -->
        <!-- <Suspense> -->
        <RouterView/>
        <!-- </Suspense> -->
      <!-- </div>
    </div> -->
  </template>
  <div v-else>Loading the registry...</div>
</template>
