<script setup lang="ts">
import { watch } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia';

import Navbar from './components/Navbar.vue';

import { useAuthStore } from './stores/auth';
import { useUserPrefsStore } from './stores/userPreferences';


const authStore = useAuthStore();
const userPrefsStore = useUserPrefsStore();

// onBeforeMount(async () => {
//     await authStore.fetchUser();
// });

const { user } = storeToRefs(authStore);

watch(user, async () => {
    userPrefsStore.fetchUserPrefs();
});
</script>

<template>
    <div id="modal" />
    <div class="dark:bg-slate-900">
        <Navbar />
    </div>
    <RouterView />
    <!--
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <Suspense>
                <RouterView />
            </Suspense>
        </div>
    </div>
    -->
</template>
