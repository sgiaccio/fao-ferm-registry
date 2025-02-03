<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { RouterView } from 'vue-router';
import { storeToRefs } from 'pinia'

import { useLoadingStore } from '@/stores/loading';

import { useI18n } from 'vue-i18n';
import { useMenusStore } from '@/stores/menus';

// import { useAuthStore } from './stores/auth';
// import { useUserPrefsStore } from './stores/userPreferences';

// import { setI18nLanguage, loadLocaleMessages } from '@/lib/i18n';

import CustomAlert from '@/views/project/CustomAlert.vue';

import LoadingView from '@/views/LoadingView.vue';


const { locale } = useI18n();

// const authStore = useAuthStore();
// const userPrefsStore = useUserPrefsStore();

// const { user } = storeToRefs(authStore);

const customAlert = ref();

provide('customAlert', function (title: string, message: string, type: string | null, options: any) {
    customAlert.value.show(title, message, type, options);
});

// watch(user, async () => {
//     await userPrefsStore.fetchUserPrefs();
// });

const { isLoading } = storeToRefs(useLoadingStore());

watch(locale, async () => {
    const menuStore = useMenusStore();
    // Only fetch menus if they are already loaded
    // This is because if they have been loaded it means that they are needed
    // Will change this to a more elegant solution in the future
    if (menuStore.loaded) {
        // setI18nLanguage(locale.value);
        await Promise.all([
            // loadLocaleMessages(locale.value),
            menuStore.fetchMenus(locale.value),
        ]);
    }
});
</script>

<template>
    <component :is="isLoading ? LoadingView : RouterView"></component>
    <CustomAlert ref="customAlert" />
</template>
