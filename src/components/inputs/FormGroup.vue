<script setup lang="ts">
import { computed } from 'vue';

import baseProps from './formGroupProps';

import InfoButton from '@/components/InfoButton.vue';


const props = defineProps(baseProps);

const emit = defineEmits(['focusout']);

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
    <!-- <div> -->
        <fieldset @focusout="emit('focusout')">
            <div class="sm:grid sm:grid-cols-4 sm:gap-4 sm:items-start py-5 sm:content-center">
                <legend class="block text-sm font-bold text-gray-700 sm:mt-px">
                    <template v-if="$slots.info">
                        {{ labelWithoutLastWord }}
                        <span class="whitespace-nowrap">
                            {{ lastWord }}
                            <InfoButton
                                v-if="$slots.info"
                                :title="label"
                            >
                                <slot name="info" />
                            </InfoButton>
                        </span>
                    </template>
                    <template v-else>
                        {{ label }}
                    </template>
                </legend>
                <div class="sm:col-span-3">
                    <p
                        v-if="description"
                        class="font-semibold mb-3 text-sm text-gray-500"
                    >
                        {{ description }}
                    </p>
                    <p
                        v-else-if="dangerousHtmlDescription"
                        v-html="dangerousHtmlDescription"
                        class="font-semibold mb-3 text-sm text-gray-500"
                    />
                    <slot></slot>
                </div>
            </div>
        </fieldset>
    <!-- </div> -->
</template>
