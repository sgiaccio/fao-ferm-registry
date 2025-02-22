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
        class="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 focus:ring-0 rounded-md"
        @input="onInput">
    <div v-else-if="modelValue !== undefined && modelValue !== null">{{ modelValue }}</div>
    <div v-else class="italic text-gray-400">{{ $t('notAvailable') }}</div>
</template>