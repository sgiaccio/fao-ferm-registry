<script setup lang="ts">
defineProps<{
    title: string
}>();
</script>

<template>
    <div>
        <h1 class="tracking-wide text-3xl dark:text-zinc-300 font-roboto-slab">{{title}}</h1>
        <div v-if="$slots.description" class="md:leading-relaxed text-sm dark:text-zinc-200 bg-gray-200 dark:bg-zinc-700 px-6 py-4 mt-4 md:mt-6 rounded-md shadow-sm">
            <slot name="description"></slot>
        </div>
        <div class="divide-y divide-stone-200">
            <slot></slot>
        </div>
    </div>
</template>
