<script
    setup
    lang="ts"
>
withDefaults(defineProps<{
    title?: string;
    previewImage?: string;
    source?: string;
    showTitle?: boolean;
}>(), {
    showTitle: true,
});
</script>

<template>
    <div
        v-if="previewImage"
        class="aspect-square overflow-hidden flex"
        :style="`background-image: url(${previewImage});background-size: cover; background-position: center;`"
    >
        <div
            v-if="title"
            class="h-20 bg-black/50 text-white px-3 p-3 w-full self-end"
        >
            <h3 class="text-sm font-medium line-clamp-3 shadow-black text-shadow-sm">{{ title }}</h3>
        </div>
    </div>
    <div
        v-else
        class="aspect-square overflow-hidden flex-col justify-between flex"
    >
        <div :class="[title? 'border-t border-l border-r rounded-tl-md rounded-tr-md' : 'border-r border-gray-200', 'flex-1 flex items-center bg-white']">
            <img
                class="w-2/3 self-center mx-auto"
                :src="`/interop_logos/${source.toLowerCase()}.svg`"
                :alt="source"
            />
        </div>
        <div
            v-if="title"
            class="h-20 bg-black/50 text-white px-3 p-3 w-full self-end"
        >
            <h3 class="text-sm font-medium line-clamp-3 shadow-black text-shadow-sm">{{ title }}</h3>
        </div>
    </div>
</template>