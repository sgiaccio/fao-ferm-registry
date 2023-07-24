<script setup lang="ts">
import { ref } from 'vue';

import { useProjectStore } from '../../stores/project';

import TabTemplate from '../TabTemplate.vue';

import MultiInput from '../../components/inputs/MultiInput.vue';
import MapInput from '../../components/inputs/base/MapInput.vue';
import AdminArea from '../../components/inputs/AdminArea.vue';
import MapUpload from '../../components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from './ShapefileUploadDialog.vue';

import FormGroup from '../../components/inputs/FormGroup.vue';
import NumberInput from '../../components/inputs/base/NumberInput.vue';

import FileUploadInputGroup2 from '@/components/inputs/base/FileUploadFormGroup2.vue';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';

import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import AlertModal from '@/views/AlertModal.vue';


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

const showInfoModal = ref(false);

function numbering(i: number, v: any) {
    const key = Object.keys(v)[0];
    if (key === 'adminArea') {
        return `Area ${i + 1}`;
    } else if (key === 'draw') {
        return `Area ${i + 1}`;
    } else if (key === 'upload') {
        const value = v[key];
        return `Area ${value.shapeId || i + 1}`;
    } else {
        return `Unknown area type: ${key}`;
    }
}

const showDisclaimer = ref(false);
</script>

<template>
    <AlertModal v-if="store.project.reportingLine === 'GEF'"
                type="info"
                :onClose="() => showInfoModal = false"
                :open="showInfoModal"
                title="Upload polygons/vector"
                buttonText="Close">
        <div class="text-left text-sm">
            Please upload a shapefile with the land (in ha) reported in the geographic information system (spatially
            explicit data) if available. Otherwise please include the coordinates of project location.
        </div>
    </AlertModal>
    <TabTemplate title="Area">
        <template #description>
            <p>
                Identification of geographic areas of ecosystem restoration is key for geospatial applications. One
                initiative implements ecosystem restoration in one or more geographic areas. initiatives can identify
                one or more initiative areas. Identification of activities, indicators, characterization and results
                will be provided for each area. Geographic areas can be identified based on different options:
            </p>
            <ul class="list-disc list-inside">
                <li>
                    Select administrative areas
                </li>
                <li v-if="store.project.reportingLine === 'GEF'">
                    Upload polygons/vector
                    <QuestionMarkCircleIcon @click="() => showInfoModal = true"
                                            class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />

                </li>
                <li>Draw directly on the platform</li>
            </ul>
        </template>
        <template #default>
            <div v-if="store.project.reportingLine === 'GEF'"
                 class="text-sm bg-ferm-gray px-6 py-4 my-6 rounded-md">
                <p class="font-semibold">
                    Please find the requirements of geospatial data in <a class="text-ferm-blue-dark-800 underline"
                                                                          href="/gef/Requirements of geospatial data.pdf"
                                                                          target="_blank">this link</a>
                </p>
                <p class="mt-4 font-semibold">
                    Please find the structure of the feature table to be uploaded in the platform in <a
                    class="text-ferm-blue-dark-800 underline"
                    href="/gef/Sample feature table GEF Projects.csv"
                    target="_blank">this link</a>
                </p>

                <p @click="() => showDisclaimer = true"
                   class="mt-4 font-semibold cursor-pointer text-ferm-blue-dark-800 underline uppercase">
                    Disclaimer
                </p>
                <AlertModal v-if="store.project.reportingLine === 'GEF'"
                            type="info"
                            :onClose="() => showDisclaimer = false"
                            :open="showDisclaimer"
                            title="DISCLAIMER"
                            buttonText="Close">
                    <div class="text-left text-sm">
                        Please be aware that data on the FERM platform is internally converted to EPSG:4326 - WGS 84
                        Coordinate System. This geographic coordinate system, representing locations as latitude and
                        longitude, may introduce potential distortions in area calculations, particularly over large
                        spatial extents. These distortions are not errors in the provided data but are inherent
                        characteristics of the EPSG:4326 - WGS 84 system. We advise exercising caution when using this
                        data for precise area calculations or analyses, considering these inherent limitations.
                    </div>
                </AlertModal>
            </div>
            <FileUploadInputGroup2 v-if="store.project.reportingLine === 'GEF'"
                                   label="Please upload Restoration Plans/Management Plans"
                                   :folder="store.id!"
                                   :edit="edit">
                <template v-slot:info>
                    <p>Please upload the Restoration Plans/ Management plans with the description of restoration / land
                        management activities and baseline information of the territory, including pictures.</p>
                </template>
            </FileUploadInputGroup2>
            <FormGroup
                :label="'Total area under restoration (ha)' + (store.project.reportingLine === 'GEF' ? ' (achieved area in tabular format)' : '')">
                <NumberInput :edit="edit"
                             v-model="store.project.project.areaUnderRestoration" />
                <template v-slot:info
                          v-if="store.project.reportingLine === 'GEF'">
                    <p>Please include the land (in ha) reported in the Restoration Plans/Management Plans (tabular
                        data).</p>
                </template>
            </FormGroup>
            <LabelFormGroup v-if="store.project.reportingLine === 'GEF'"
                            label="Total area under restoration (achieved area spatially explicit)"
                            :value="store.polygonsArea()" />
            <div class="py-6">
                <MultiInput :edit="edit"
                            :numbering="(n, v) => numbering(n, v)"
                            :inputComponents="multiInputComponents"
                            v-model="store.projectAreas"
                            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted." />
            </div>
        </template>
    </TabTemplate>
    <!-- <pre>{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
