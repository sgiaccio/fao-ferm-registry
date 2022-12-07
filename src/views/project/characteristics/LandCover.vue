<script setup lang="ts">
const props = defineProps<{
    value: [key: number, label: string][]
}>()

const landCoverTypes = {
    0: { label: "Unknown", description: "No or not enough satellite data available." },
    20: { label: "Shrubs", description: "Woody perennial plants with persistent and woody stems and without any defined main stem being less than 5: m tall. The shrub foliage can be either evergreen or deciduous." },
    30: { label: "Herbaceous vegetation", description: "Plants without persistent stem or shoots above ground and lacking definite firm structure. Tree and shrub cover is less than 10: %." },
    40: { label: "Cultivated and managed vegetation / agriculture", description: "Lands covered with temporary crops followed by harvest and a bare soil period (e.g., single and multiple cropping systems). Note that perennial woody crops will be classified as the appropriate forest or shrub land cover type." },
    50: { label: "Urban / built up", description: "Land covered by buildings and other man-made structures." },
    60: { label: "Bare / sparse vegetation", description: "Lands with exposed soil, sand, or rocks and never has more than 10: % vegetated cover during any time of the year." },
    70: { label: "Snow and ice", description: "Lands under snow or ice cover throughout the year." },
    80: { label: "Permanent water bodies", description: "Lakes, reservoirs, and rivers. Can be either fresh or salt-water bodies." },
    90: { label: "Herbaceous wetland", description: "Lands with a permanent mixture of water and herbaceous or woody vegetation. The vegetation can be present in either salt, brackish, or fresh water." },
    100: { label: "Moss and lichen" },
    111: { label: "Closed forest, evergreen needle leaf", description: "Tree canopy >70: %, almost all needle leaf trees remain green all year. Canopy is never without green foliage." },
    112: { label: "Closed forest, evergreen broad leaf", description: "Tree canopy >70: %, almost all broadleaf trees remain green year round. Canopy is never without green foliage." },
    113: { label: "Closed forest, deciduous needle leaf", description: "Tree canopy >70: %, consists of seasonal needle leaf tree communities with an annual cycle of leaf-on and leaf-off periods." },
    114: { label: "Closed forest, deciduous broad leaf", description: "Tree canopy >70: %, consists of seasonal broadleaf tree communities with an annual cycle of leaf-on and leaf-off periods." },
    115: { label: "Closed forest, mixed" },
    116: { label: "Closed forest, not matching any of the other definitions."},
    121: { label: "Open forest, evergreen needle leaf", description: "Top layer- trees 15:-70: % and second layer- mixed of shrubs and grassland, almost all needle leaf trees remain green all year. Canopy is never without green foliage." },
    122: { label: "Open forest, evergreen broad leaf", description: "Top layer- trees 15:-70: % and second layer- mixed of shrubs and grassland, almost all broadleaf trees remain green year round. Canopy is never without green foliage." },
    123: { label: "Open forest, deciduous needle leaf", description: "Top layer- trees 15:-70: % and second layer- mixed of shrubs and grassland, consists of seasonal needle leaf tree communities with an annual cycle of leaf-on and leaf-off periods." },
    124: { label: "Open forest, deciduous broad leaf", description: "Top layer- trees 15:-70: % and second layer- mixed of shrubs and grassland, consists of seasonal broadleaf tree communities with an annual cycle of leaf-on and leaf-off periods." },
    125: { label: "Open forest, mixed" },
    126: { label: "Open forest, not matching any of the other definitions" },
    200: { label: "Oceans, seas", description: "Can be either fresh or salt-water bodies." }}
</script>

<template>
    <div class="grid grid-cols-2 gap-x-3 gap-y-2">
        <template class="" v-for="lc in value">
            <div :class="['group relative cursor-default', landCoverTypes[lc[0]].description ? 'text-blue-500' : '']" data-tooltip-target="tooltip-default">
                {{landCoverTypes[lc[0]].label || `Label not found for class ${[lc[0]]}`}}
                <span v-if="landCoverTypes[lc[0]].description"
                    class="absolute hidden group-hover:flex -left-5 -top-2 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm after:content-[''] after:absolute after:left-1/2 after:top-[100%] after:-translate-x-1/2 after:border-8 after:border-x-transparent after:border-b-transparent after:border-t-gray-700">
                    {{landCoverTypes[lc[0]].description}}
                </span>
            </div>
            <div>{{lc[1].toFixed(2)}}</div>
        </template>
    </div>
</template>
