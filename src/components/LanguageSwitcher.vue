<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { setLocale } from '@/lib/i18n';

const { locale } = useI18n();


const languages = ['en', 'es', 'fr', 'pt'];
</script>

<template>
    <div class="flex space-x-2 text-gray-50 font-semibold">
        <button
            v-for="lang in languages"
            :key="lang"
            :class="[locale === lang ? 'underline' : '', 'hover:underline']"
            @click="setLocale(lang)"
        >
            {{ lang.toUpperCase() }}
        </button>
    </div>
</template>