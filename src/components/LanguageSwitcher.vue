<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { setI18nLanguage, loadLocaleMessages } from '@/lib/i18n';

const { locale } = useI18n();


function setLocale(locale: string) {
    setI18nLanguage(locale);
    loadLocaleMessages(locale);
}


const languages = [{ lang: 'en', flag: 'gb' }, { lang: 'es', flag: 'es' }, { lang: 'fr', flag: 'fr' }, { lang: 'pt', flag: 'pt' }];
</script>

<template>
    <div class="flex space-x-2 text-gray-50 font-semibold">
        <!-- <button
            :class="[locale === 'en' ? 'underline' : '', 'hover:underline']"
            @click="setLocale('en')"
        >
            EN
        </button>
        <button
            :class="[locale === 'es' ? 'underline' : '', 'hover:underline']"
            @click="setLocale('es')"
        >
            ES
        </button>
        <button
            :class="[locale === 'fr' ? 'underline' : '', 'hover:underline']"
            @click="setLocale('fr')"
        >
            FR
        </button>
        <button
            :class="[locale === 'fr' ? 'underline' : '', 'hover:underline']"
            @click="setLocale('pt')"
        >
            PT
        </button> -->
        <button
            v-for="lang in languages"
            :key="lang.lang"
            :class="[locale === lang.lang ? 'underline' : '', 'hover:underline']"
            @click="setLocale(lang.lang)"
        >
            <img
                :src="`/flags/iso2/${lang.flag}.svg`"
                alt="lang"
                class="h-5 w-5 hover:opacity-100"
                :class="[locale === lang.lang ? 'opacity-100' : 'opacity-70']"
            />
        </button>
    </div>
</template>