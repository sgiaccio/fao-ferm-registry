<script setup lang="ts">
defineProps<{
    value: [{
        areaHa: number,
        areaPercentage: number,
        areaSqm: number,
        className: string,
        classNumber: number,
        classPalette: string,
        index: number
    }]
}>()
</script>

<template>
    <!-- info popup -->

    <div class="grid grid-cols-2 gap-x-3 gap-y-2">
        <template v-for="lc in value">
            <div class="group relative cursor-default font-medium"
                 data-tooltip-target="tooltip-default">
                {{ lc.className }}
            </div>
            <div>{{ lc.areaHa }}</div>
        </template>
    </div>
</template>
