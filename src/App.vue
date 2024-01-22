<script setup lang="ts">
import { watch, ref, provide } from 'vue';
import { RouterView } from 'vue-router';

import { storeToRefs } from 'pinia';

import { useAuthStore } from './stores/auth';
import { useUserPrefsStore } from './stores/userPreferences';

import CustomAlert from '@/views/project/CustomAlert.vue';


const authStore = useAuthStore();
const userPrefsStore = useUserPrefsStore();

const { user } = storeToRefs(authStore);

const customAlert = ref();

provide('customAlert', function (t: string, m: string, ty: string, options: any) {
    customAlert.value.show(t, m, ty, options);
});

watch(user, async () => {
    await userPrefsStore.fetchUserPrefs();
});
</script>

<template>
    <div id="modal" />
    <CustomAlert ref="customAlert"></CustomAlert>
    <RouterView />
</template>
