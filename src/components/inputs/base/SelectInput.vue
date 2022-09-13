<script setup lang="ts">
import type { PropType } from 'vue'

import { ref, computed } from "vue";


const props = defineProps({
    options: { type: Array as PropType<Array<{value: any, label: String}>> },
    placeholder: { type: String },
    modelValue: { type: null },
    required: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue']);

const showValidation = ref(false);

function onInput(event: Event) {
    let value: string | undefined = (event.target as HTMLInputElement).value;
    emit('update:modelValue', value !== "" ? value : undefined);
    
    showValidation.value = true
}

const errorMessages = computed(() => {
    if (props.required && !props.modelValue) {
        return ["This field is mandatory."];
    }
    return [];
});
</script>

<template>
    <select
        class="dark:text-zinc-400 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-black dark:focus:border-black dark:bg-zinc-900 focus:ring-0 rounded-md"
        :value="modelValue"
        @input="onInput">
        <option value="">{{placeholder}}</option>
        <option v-for="option in options"
                :key="option.value"
                :value="option.value">
            {{option.label}}
        </option>
    </select>
    <p v-if="showValidation && errorMessages.length" v-for="message in errorMessages" class="mt-2 text-sm text-red-600" id="email-error">{{message}}</p>
</template>
