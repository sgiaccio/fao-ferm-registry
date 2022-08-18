<script setup lang="ts">
import FormGroup from "./FormGroup.vue"


defineProps({
    modelValue: { type: String },
    placeholder: { type: String }
});

const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <input type="text"
           :value="modelValue"
           :placeholder="placeholder"
           class="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
           @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
</template>