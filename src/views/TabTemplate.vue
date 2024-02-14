<script setup lang="ts">
withDefaults(defineProps<{
    title: string
    // divide: boolean
    // border: boolean
}>(), {
    // divide: true,
    // border: true
});
</script>

<template>
    <div class="mb-6">
        <h1 class="bg-ferm-blue-light-200 text-black py-3 md:py-5 rounded-md text-center text-3xl uppercase font-bold tracking-wide">{{ title }}</h1>
        <div v-if="$slots.description"
             class="md:leading-relaxed text-sm bg-ferm-blue-light-100 px-6 py-4 mt-4 md:mt-6 rounded-md shadow-sm">
            <slot name="description"></slot>
        </div>
        <!-- <div :class="[ divide ? 'divide-y divide-dashed' : '', border ? 'border-2 px-4 rounded-md shadow-sm' : '',  'mt-4 mb-6 odd:bg-blue-100 even:bg-red-50' ]"> -->
        <slot></slot>
        <!-- </div> -->
    </div>
</template>
