<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllProjectAreasGeoJson } from '@/firebase/functions';

// import LoadingView from '@/views/LoadingView.vue';
import SpinningThing from '@/components/SpinningThing.vue';

import { XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/vue/16/solid';

const props = defineProps<{
    projectId: string
    areas: any[],
    countries: string[]
}>();

defineExpose({
    refresh,
});

const iframeRef = ref<HTMLIFrameElement | null>(null);

const geoJsonLoaded = ref(false);
const iframeLoaded = ref(false);

onMounted(async () => {
    await refresh();

    if (!iframeRef.value) {
        return;
    }
    iframeRef.value.onload = () => {
        iframeLoaded.value = true
    }

});

async function refresh() {
    if (iframeRef.value) {
        const response: any = await getAllProjectAreasGeoJson(props.projectId, props.areas.map(a => a.uuid));

        if (response.geoJson) {
            // replace the name property with the given ones
            response.geoJson.features.forEach((feature: any) => {
                feature.properties.name = props.areas.find(a => a.uuid === feature.properties.uuid)?.siteName;
            });
        }

        geoJsonLoaded.value = true;
    
        const url = new URL('https://dev.ferm.earthmap.org/');
        url.searchParams.append('embed', 'true');
        const nCountries = props.countries.length;
        url.searchParams.append('aoi', nCountries === 0 || nCountries > 1 ? 'global' : props.countries[0].toLowerCase());
        if (response.geoJson) {
            url.searchParams.append('polygon', JSON.stringify(response.geoJson));
        } else {
            url.searchParams.append('fetchJson', response.url);
        }
        iframeRef.value.setAttribute('src', url.toString());
    }
}

const fullScreenEarthMap = ref(false);

function reduceEarthMap() {
    fullScreenEarthMap.value = false;
    document.body.style.overflow = 'auto';
}

function enlargeEarthMap() {
    fullScreenEarthMap.value = true;
    document.body.style.overflow = 'hidden';
}
</script>

<template>
    <div
        v-if="fullScreenEarthMap"
        class="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-70 z-40"
    />
    <div
        :class="{ 'fixed top-0 left-0 w-screen h-screen z-50 p-12 shadow-lg': fullScreenEarthMap, 'rounded-md w-full h-192 shadow-md': !fullScreenEarthMap }"
        @click="reduceEarthMap"
    >
        <div class="relative h-full w-full">
            <div
                class="absolute -top-4 -right-4 rounded-full bg-white hover:bg-gray-300 shadow-md x-50 cursor-pointer"
                v-if="!fullScreenEarthMap"
                @click.stop="enlargeEarthMap"
            >
                <ArrowsPointingOutIcon class="h-4 w-4 text-gray-500 m-2" />
            </div>
            <div
                v-if="fullScreenEarthMap"
                class="absolute -top-4 -right-4 rounded-full bg-white hover:bg-gray-300 cursor-pointer"
                @click.stop="reduceEarthMap"
            >
                <XMarkIcon class="h-4 w-4 text-gray-500 m-2" />
            </div>
            <iframe
                class="w-full h-full rounded-lg overflow-hidden bg-white shadow-md"
                ref="iframeRef"
                v-show="geoJsonLoaded"
            />
            <div
                v-show="!iframeLoaded"
                class="flex items-center justify-center w-full h-full absolute"
            >
                <div class="flex flex-col items-center">
                    <SpinningThing />
                    <div class="mt-4 font-bold text-gray-600">Loading Earth Map...</div>
                </div>
            </div>
        </div>
    </div>
</template>
