<script setup lang="ts">

import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: { type: String },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    edit: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true }
});

const inputRef = ref<HTMLInputElement | null>(null);

watch(() => props.enabled, () => {
    if (!props.enabled) {
        emit('update:modelValue', undefined);
    } else {
        // focus on the text input
        inputRef.value?.focus();
        inputRef.value?.select();
    }
});

const emit = defineEmits(['update:modelValue'])

function onInput(event: Event) {
    const value: string | undefined = (event.target as HTMLInputElement).value;
    emit('update:modelValue', value !== "" ? value : undefined);
}

const focusedOut = ref(false);

const errorMessages = computed(() => {
    if (props.required && !props.modelValue) {
        return ["This field is mandatory."];
    }
    return [];
});

const showValidation = computed(() => !!errorMessages.value.length && focusedOut.value);
</script>

<template>
    <template v-if="edit">
        <div class="relative mt-1 rounded-md shadow-sm">
            <input
                type="text"
                class="block w-full rounded-md pr-10 focus:outline-none border-gray-300 sm:text-sm transition ease-in-out duration-270 delay-50"
                :placeholder="placeholder"
                :class="[showValidation ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:ring-0 dark:focus:border-black', enabled ? 'cursor-text' : 'cursor-not-allowed',
                enabled ? 'cursor-text' : 'cursor-not-allowed']"
                :value="modelValue"
                @input="onInput"
                @focusout="focusedOut = true"
                :aria-invalid="showValidation"
                aria-describedby="error"
                :disabled="!enabled"
                ref="inputRef">
            <div v-if="showValidation" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <!-- Heroicon name: mini/exclamation-circle -->
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
            </div>
        </div>  
        <p v-if="showValidation" v-for="message in errorMessages" class="mt-2 text-sm text-red-600" id="email-error">{{message}}</p>
    </template>
    <div v-else-if="modelValue">{{modelValue}}</div>
    <div v-else class="italic text-gray-400">Not available</div>
</template>
