<script setup lang="ts">
defineProps<{
    title: string
}>();
</script>

<template>
    <div>
        <h1 class="bg-ferm-blue-light-200 text-black py-3 md:py-5 rounded-md text-center tracking-wide text-3xl dark:bg-ferm-blue-dark-900 dark:text-white font-akrobat uppercase font-bold">{{title}}</h1>
        <div v-if="$slots.description" class="md:leading-relaxed text-sm bg-ferm-blue-light-100 dark:bg-ferm-blue-dark-800 dark:text-white px-6 py-4 mt-4 md:mt-6 rounded-md shadow-sm">
            <slot name="description"></slot>
        </div>
        <div class="divide-y divide-stone-200">
            <slot></slot>
        </div>
    </div>
</template>
