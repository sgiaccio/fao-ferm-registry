<script setup lang="ts">
import { ref } from 'vue'

import { useProjectStore } from '../../stores/project'

import MultiInput from '../../components/inputs/MultiInput.vue'
import MapInput from '../../components/inputs/base/MapInput.vue'
import AdminArea from '../../components/inputs/AdminArea.vue'
import MapUpload from '../../components/inputs/base/MapUpload.vue'


const multiInputComponents = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: 'Add admin area'
    },
    draw: {
        component: MapInput,
        newData: {},
        addItemLabel: 'Draw polygon'
    },
    upload: {
        component: MapUpload,
        newData: {},
        addItemLabel: 'Upload shapefile'
    }
};

const store = useProjectStore();
</script>

<template>
    <div class="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
        <h1 class="text-3xl dark:text-zinc-300">Area</h1>
        <p class="dark:text-zinc-200">Identification of geographic areas of ecosystem restoration is key for geospatial applications. One initiative implements ecosystem restoration in one or more geographic areas. initiatives can identify one or more initiative areas. Identification of activities, indicators, characterization and results will be provided for each area. Geographic areas can be identified based on different options:</p>
        <ul class="list-disc ml-10 dark:text-zinc-200">
            <li>Select administrative areas</li>
            <li>Upload polygons/vector</li>
            <li>Draw directly on the platform</li>
        </ul>
        <MultiInput
            :numbering="(n: number) => `Area #${n}`"
            :inputComponents="multiInputComponents"
            v-model="store.projectAreas"
            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics and activities will also be deleted."/>
    </div>
    <!-- <pre class="text-black">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
