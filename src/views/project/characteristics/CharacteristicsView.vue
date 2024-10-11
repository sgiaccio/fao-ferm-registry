<script setup lang="ts">
import { ref, computed } from 'vue';

import { useProjectStore } from '../../../stores/project';

import TabTemplate from "../../TabTemplate.vue";

import EarthMapView from '../EarthMapView.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();

const areasWithUuid = computed(() => store.projectAreas
    .map(a => Object.values(a)[0])
    .map((a: any, i) => ({ uuid: a.uuid, siteName: a.siteName || `Area ${i + 1}` }))
    .filter(a => !!a.uuid));

const earthMapView = ref();
</script>

<template>
    <TabTemplate title="Characteristics">
        <template #description>
            <p>
                This section provides spatial and satellite data through <a
                    href="https://ferm.earthmap.org/"
                    target="_blank"
                    class="text-blue-600 underline hover:text-blue-500"
                >EarthMap</a>. EarthMap delivers high-quality, up-to-date satellite imagery and geographic information, enabling you to monitor the restoration progress of your initiatives. It facilitates the tracking of changes in land cover, land degradation, biodiversity, and other key restoration indicators. By integrating this data, the tool enhances your ability to assess progress and make informed decisions, ensuring effective and transparent ecosystem restoration efforts. For more detailed information and example tutorials, please follow: <a
                    href="https://help.earthmap.org/"
                    target="_blank"
                    class="text-blue-600 underline hover:text-blue-500"
                >https://help.earthmap.org/</a>
            </p>
            <h2 class="text-lg font-semibold mt-3">Quick guide</h2>
            <ul class="list-disc list-inside">
                <li>Select your language in the upper right menu (English, Spanish, French, and Portuguese)</li>
                <li>Add one or more layers to the map by opening the left menu and selecting them</li>
                <li>Adjust layer visibility and order through the legend</li>
                <li>Retrieve information on the layers by clicking the "information" button</li>
                <li>Refine your analysis by area selecting an area of interest or boundary in the left drop-down menu and then clicking on the polygon of interest in the map</li>
                <li>In the right menu, you can also perform zonal statistics using several spatial datasets</li>
                <li>Point statistics can be shown by right-clicking on the map at any location</li>
                <li>For extended instructions, please download the FERM guidance and check Section 1: Planning & Assessment - characteristics</li>
            </ul>
        </template>
        <template #default>
            <div class="mt-10">
                <EarthMapView
                    v-if="areasWithUuid.length > 0"
                    ref="earthMapView"
                    :countries="store.project.project.countries"
                    :projectId="store.id!"
                    :areas="areasWithUuid"
                />
            </div>
        </template>
    </TabTemplate>
</template>./BatChart.vue
