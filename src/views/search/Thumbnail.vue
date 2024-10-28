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

function changeSource(event, source) {
    const img = event.target;
    img.src = `/interop_logos/${source.toLowerCase()}.png`;
}
</script>

<template>
    <div
        v-if="previewImage"
        class="aspect-square overflow-hidden flex"
        :style="`background-image: url(${previewImage}); background-position: center;background-size: contain;background-repeat: no-repeat;`"
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
                class="w-2/3 self-center mx-auto max-h-24"
                :src="`/interop_logos/${source.toLowerCase()}.svg`"
                @error="changeSource($event, source)"
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