<script setup lang="ts">
import { ref } from 'vue';

import { useI18n } from 'vue-i18n';

import { InformationCircleIcon } from '@heroicons/vue/20/solid';

import AlertModal from '@/views/AlertModal.vue';

const { t } = useI18n();


defineProps({
    title: String,
});

const show = ref(false);
</script>

<template>
    <AlertModal
        type="info"
        :onClose="() => show = false"
        :open="show"
        :title="title"
        :buttonText="t('close')"
    >
        <div class="text-left text-sm">
            <slot />
        </div>
    </AlertModal>
    <InformationCircleIcon
        @click="() => show = true"
        class="w-5 h-5 inline-block text-yellow-500 hover:text-yellow-400 cursor-pointer"
    />
</template>
