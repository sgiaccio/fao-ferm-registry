<script setup lang="ts">
import FormGroup from "../FormGroup.vue"

defineProps({
    modelValue: { type: String },
    placeholder: { type: String }
});

const emit = defineEmits(['update:modelValue'])

function emitInputEvent(event: Event) {
    const value = (event.target as HTMLInputElement).value || undefined;
    console.log(value);
    emit('update:modelValue', value);
}
</script>

<template>
    <input type="text"
           :value="modelValue"
           :placeholder="placeholder"
           class="max-w-lg_ block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
           @input="emitInputEvent($event)"
           input_="emit('update:modelValue', ($event.target as HTMLInputElement).value)">
</template>