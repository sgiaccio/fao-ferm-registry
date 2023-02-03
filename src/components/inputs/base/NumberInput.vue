<script setup lang="ts">
defineProps({
    modelValue: { type: Number },
    placeholder: { type: String },
    edit: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue'])

function onInput(event: Event) {
    const value: string | undefined = (event.target as HTMLInputElement).value;
    emit('update:modelValue', value !== "" ? +value : undefined);
}
</script>

<template>
    <input
        v-if="edit"
        type="number"
        :value="modelValue"
        :placeholder="placeholder"
        class="dark:text-zinc-400 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:border-black dark:focus:border-black dark:bg-zinc-900 focus:ring-0 rounded-md"
        @input="onInput">
    <div v-else-if="modelValue">{{modelValue}}</div>
    <div v-else class="italic text-gray-400">Not available</div>
</template>