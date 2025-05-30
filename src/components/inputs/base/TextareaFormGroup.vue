<script setup lang="ts">
import { watch, ref, computed } from "vue";

import baseProps from "../formGroupProps"
import FormGroup from "../FormGroup.vue"


const props = defineProps({
    ...baseProps,
    ...{
        modelValue: { type: String },
        placeholder: String,
        required: { type: Boolean, default: false },
        edit: { type: Boolean, default: true }
    }
});

const emit = defineEmits(['update:modelValue']);

watch(() => props.enabled(), e => {
    if (!e) {
        emit('update:modelValue', undefined);
    }
});

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
    <FormGroup
        :label="label"
        :description="description"
        :dangerousHtmlDescription="dangerousHtmlDescription"
    >
        <textarea
            v-if="edit"
            rows="3"
            :disabled="!props.enabled()"
            :placeholder="placeholder"
            @focusout="focusedOut = true"
            class="block w-full rounded-md pr-10 focus:outline-none border-gray-300 sm:text-sm"
            :class="{ 'border-red-400 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': showValidation, 'focus:ring-0': !showValidation }"
            @input="onInput"
            :value="modelValue"
        ></textarea>
        <div
            v-else-if="modelValue"
            class="whitespace-pre-wrap"
        >{{ modelValue }}</div>
        <div
            v-else
            class="italic text-gray-400"
        >{{ $t('notAvailable') }}</div>
        <p
            v-if="showValidation"
            v-for="message in errorMessages"
            class="mt-2 text-sm text-red-600"
            id="email-error"
        >{{ message }}</p>
        <template
            #info
            v-if="$slots.info"
        >
            <slot name="info" />
        </template>
    </FormGroup>
</template>
