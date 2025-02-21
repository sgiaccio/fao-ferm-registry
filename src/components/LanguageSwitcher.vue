<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { SUPPORT_LOCALES } from '@/lib/i18n';


const { locale } = useI18n();

// get the router
import { useRouter } from 'vue-router';
const router = useRouter();

function forwardToLanguage(lang: string) {
    const currentRoute = router.currentRoute.value;
    const currentName = currentRoute.name;
    const currentQuery = currentRoute.query;
    const currentHash = currentRoute.hash;

    if (currentName) {
        router.push({ name: currentName, query: currentQuery, hash: currentHash, params: { locale: lang } });
    } else {
        // fallback in case the current route has no name - all routes should have a name anyway
        router.push({ name: 'home', query: currentQuery, hash: currentHash, params: { locale: lang } });
    }
}
</script>

<template>
    <div
        v-if="SUPPORT_LOCALES.length > 1"
        class="flex space-x-2 text-gray-50 font-semibold"
    >
        <button
            v-for="lang in SUPPORT_LOCALES"
            :key="lang"
            :class="[locale === lang ? 'underline' : '', 'hover:underline']"
            @click="forwardToLanguage(lang)"
        >
            {{ lang.toUpperCase() }}
        </button>
    </div>
</template>