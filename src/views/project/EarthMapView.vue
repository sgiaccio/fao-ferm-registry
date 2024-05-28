<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllProjectAreasGeoJson } from '@/firebase/functions';

import LoadingView from '@/views/LoadingView.vue';

const props = defineProps<{
    projectId: string
    areas: any[]
}>();

defineExpose({
    refresh,
});

const iframeRef = ref<HTMLIFrameElement | null>(null);

const geoJsonLoaded = ref(false);

onMounted(async () => {
    await refresh();
});

async function refresh() {
    const geoJson: any = await getAllProjectAreasGeoJson(props.projectId, props.areas.map(a => a.uuid));

    // replace the name property with the given ones
    geoJson.features.forEach((feature: any) => {
        feature.properties.name = props.areas.find(a => a.uuid === feature.properties.uuid)?.siteName;
    });

    geoJsonLoaded.value = true;

    if (iframeRef.value) {

        const url = `https://earthmap.org/?embed=true&polygon=${JSON.stringify(geoJson)}`;
        if (url.length > 8000) {
            alert('The map is too large to be displayed on EarthMap');
            geoJsonLoaded.value = false;
            return;
        }

        iframeRef.value.setAttribute('src', url);
    }
}
</script>

<template>
    <div class="rounded-md w-full h-128 shadow-md">
        <iframe
            ref="iframeRef"
            class="w-full h-full rounded-md"
            v-show="geoJsonLoaded"
        />
        <div
            v-show="!geoJsonLoaded"
            class="flex items-center justify-center w-full h-full"
        >
            <div class="flex flex-col items-center">
                <component
                    is="Spinner"
                    class="h-12 w-12 text-indigo-600"
                />
                <LoadingView />
            </div>
        </div>
    </div>
</template>