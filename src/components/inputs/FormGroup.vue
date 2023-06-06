<script setup lang="ts">
import baseProps from "./formGroupProps";
import { ref } from "vue";
import AlertModal from "@/views/AlertModal.vue";

import { QuestionMarkCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps(baseProps);

const emit = defineEmits(["focusout"]);

const showAlertModal = ref(false);
</script>

<template>
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
                {{ label }}
                <template v-if="$slots.info">
                    <QuestionMarkCircleIcon @click="() => showAlertModal = true" class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />
                </template>
            </legend>
            <div class="sm:col-span-3">
                <p
                    v-if="description"
                    class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400">
                    {{ description }}
                </p>
                <p
                    v-else-if="dangerousHtmlDescription"
                    v-html="dangerousHtmlDescription"
                    class="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400" />
                <slot></slot>
            </div>
        </div>
    </fieldset>

</template>
