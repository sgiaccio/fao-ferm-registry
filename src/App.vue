<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia'

import { useLoadingStore } from '@/stores/loading';

// import { useAuthStore } from './stores/auth';
// import { useUserPrefsStore } from './stores/userPreferences';

import CustomAlert from '@/views/project/CustomAlert.vue';

import LoadingView from '@/views/LoadingView.vue';

// const authStore = useAuthStore();
// const userPrefsStore = useUserPrefsStore();

// const { user } = storeToRefs(authStore);

const customAlert = ref();

provide('customAlert', function (t: string, m: string, ty: string, options: any) {
    customAlert.value.show(t, m, ty, options);
});

// watch(user, async () => {
//     await userPrefsStore.fetchUserPrefs();
// });

const { isLoading } = storeToRefs(useLoadingStore());
</script>

<template>
    <component :is="isLoading ? LoadingView : RouterView"></component>
    <CustomAlert ref="customAlert" />
</template>
