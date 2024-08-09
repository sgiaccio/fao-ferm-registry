<script setup lang="ts">
defineProps<{
    title?: string,
    description?: string
    titleLink?: string
}>();
</script>

<template>
    <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-0 py-5 sm:p-6">
            <div
                v-if="title || description"
                class="px-4 sm:px-0 mb-2"
            >
                <h3
                    v-if="title"
                    class="text-base font-bold leading-7 text-gray-900"
                >
                    <a
                        v-if="titleLink"
                        :href="titleLink"
                        target="_blank"
                        class="text-blue-800 hover:underline"
                    >
                        {{ title }}
                    </a>
                    <template v-else>{{ title }}</template>
                </h3>
                <p
                    v-if="description"
                    class="mt-1 max-w-2xl text-sm leading-6 text-gray-500"
                >{{ description }}</p>
            </div>
            <slot></slot>
        </div>
    </div>
</template>