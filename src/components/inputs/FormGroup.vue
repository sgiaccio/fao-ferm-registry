<script setup lang="ts">
import baseProps from './formGroupProps';
import { ref, computed } from 'vue';
import AlertModal from '@/views/AlertModal.vue';

import { InformationCircleIcon } from '@heroicons/vue/20/solid';


const props = defineProps(baseProps);

const emit = defineEmits(['focusout']);

const showAlertModal = ref(false);

const labelWithoutLastWord = computed(() => {
    if (!props.label) {
        return '';
    }

    const words = props.label.split(' ');
    words.pop();
    return words.join(' ');
});

const lastWord = computed(() => {
    if (!props.label) {
        return '';
    }

    const words = props.label.split(' ');
    return words[words.length - 1];
});
</script>

<template>
    <div>
        <AlertModal v-if="$slots.info"
                    type="info"
                    :onClose="() => showAlertModal = false"
                    :open="showAlertModal"
                    :title="label"
                    buttonText="Close">
            <div class="text-left text-sm">
                <slot name="info" />
            </div>
        </AlertModal>
        <fieldset @focusout="emit('focusout')">
            <div class="sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start py-5 sm:content-center">
                <legend class="block text-sm font-bold text-gray-700 dark:text-zinc-300 sm:mt-px">
                    {{ labelWithoutLastWord }}
                    <span class="whitespace-nowrap">
                        {{ lastWord }}
                        <template v-if="$slots.info">
                            <InformationCircleIcon @click="() => showAlertModal = true"
                                                    class="w-5 h-5 inline-block text-yellow-500 hover:text-yellow-400 dark:text-yellow-400 dark:hover:text-yellow-300 cursor-pointer" />
                        </template>
                    </span>
                </legend>
                <div class="sm:col-span-3">
                    <p v-if="description"
                       class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400">
                        {{ description }}
                    </p>
                    <p v-else-if="dangerousHtmlDescription"
                       v-html="dangerousHtmlDescription"
                       class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400" />
                    <slot></slot>
                </div>
            </div>
        </fieldset>
    </div>
</template>
