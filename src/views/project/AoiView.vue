<script setup lang="ts">
// import { ref } from 'vue'

import { useProjectStore } from '../../stores/project'

import TabTemplate from "../TabTemplate.vue";

import MultiInput from '../../components/inputs/MultiInput.vue'
import MapInput from '../../components/inputs/base/MapInput.vue'
import AdminArea from '../../components/inputs/AdminArea.vue'
import MapUpload from '../../components/inputs/base/MapUpload.vue'
import ShapefileUploadDialog from './ShapefileUploadDialog.vue'

import FormGroup from '../../components/inputs/FormGroup.vue';
import NumberInput from '../../components/inputs/base/NumberInput.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

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
        addItemLabel: 'Upload shapefile',
        addDialog: ShapefileUploadDialog
    }
};

const store = useProjectStore();
</script>

<template>
    <TabTemplate title="Area">
        <template #description>
            <p>Identification of geographic areas of ecosystem restoration is key for geospatial applications. One initiative implements ecosystem restoration in one or more geographic areas. initiatives can identify one or more initiative areas. Identification of activities, indicators, characterization and results will be provided for each area. Geographic areas can be identified based on different options:</p>
            <ul class="list-disc list-inside">
                <li>Select administrative areas</li>
                <li>Upload polygons/vector</li>
                <li>Draw directly on the platform</li>
            </ul>
        </template>
        <template #default>
            <FormGroup label="Total area under restoration (ha)">
                <NumberInput :edit="edit"
                             v-model="store.project.project.areaUnderRestoration" />
            </FormGroup>
            <div>
                <MultiInput :edit="edit"
                            :numbering="(n: number) => `Area #${n}`"
                            :inputComponents="multiInputComponents"
                            v-model="store.projectAreas"
                            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted." />
            </div>
        </template>
    </TabTemplate>
    <!-- <pre class="text-white">{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
