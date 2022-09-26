<script setup lang="ts">
import { useProjectStore } from '../../stores/project'

import MultiInput from '../../components/inputs/MultiInput.vue'
import AdminArea from '../../components/inputs/AdminArea.vue'


const multiInputComponents = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: 'admin area'
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
            :numbering="(n) => `Area #${n}`"
            :inputComponents="multiInputComponents"
            v-model="store.projectAreas"
            deleteConfirmMessage="Are you sure you want to delete this area? Related characteristics and activities will also be deleted!"/>
    </div>
    <pre class="text-black">{{JSON.stringify(store.projectAreas, null, 2)}}</pre>
</template>
