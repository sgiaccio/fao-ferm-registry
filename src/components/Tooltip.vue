<template>
    <div class="group relative inline-block text-blue-500">
        <slot />
        <span class="tooltip absolute left-1/2 transform -translate-x-1/2 -top-2 -translate-y-full max-w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm after:content-[''] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700 whitespace-nowrap">
            <slot name="description"></slot>
        </span>
    </div>
</template>


<style scoped>
.group:hover .tooltip {
    opacity: 1;
    visibility: visible;
}

.tooltip {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-out, visibility 0.3s ease-out;
}
</style>