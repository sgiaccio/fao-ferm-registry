<script setup lang="ts">

// "area_ha": 2957.93,
//                             "area_percentage": 3.11,
//                             "area_sqm": 29579312.50791973,
//                             "class_name": "Declining",
//                             "class_number": 1,
//                             "class_palette": "f23c46",
//                             "index": 0
const props = defineProps<{
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
