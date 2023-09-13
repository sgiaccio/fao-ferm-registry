<script setup lang="ts">
import { ref } from 'vue';

import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { TrashIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';

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

import AlertModal from '@/views/AlertModal.vue';
import ConfirmModal from '@/views/ConfirmModal.vue';


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

const showUploadInfoModal = ref(false);
const showDrawInfoModal = ref(false);
const showAdminAreaInfoModal = ref(false);

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

const showDeleteAreasConfirm = ref(false);

function deleteProjectAreas() {
    store.projectAreas = [];
    showDeleteAreasConfirm.value = false;
}
</script>

<template>
    <AlertModal v-if="store.project.reportingLine === 'GEF'"
                type="info"
                :onClose="() => showUploadInfoModal = false"
                :open="showUploadInfoModal"
                title="Upload polygons/vector"
                buttonText="Close">
        <div class="text-left text-sm">
            Please upload a shapefile with the land (in ha) reported in the geographic information system (spatially
            explicit data) if available. Otherwise please include the coordinates of project location.
        </div>
    </AlertModal>
    <AlertModal v-if="store.project.reportingLine === 'GEF'"
                type="info"
                :onClose="() => showDrawInfoModal = false"
                :open="showDrawInfoModal"
                title="Draw directly on the platform"
                buttonText="Close">
        <div class="text-left text-sm">
            Please use the drawer feature to draw the land directly on the platform. The calculator function will calculate the land (in ha).
        </div>
    </AlertModal>
    <AlertModal v-if="store.project.reportingLine === 'GEF'"
                type="info"
                :onClose="() => showAdminAreaInfoModal = false"
                :open="showAdminAreaInfoModal"
                title="Select administrative areas"
                buttonText="Close">
        <div class="text-left text-sm">
            Please select the administrative area where your project is working and enter the full land (in ha) of the administrative area or enter the land (in ha) within an administrative area where your project is working
        </div>
    </AlertModal>
    <ConfirmModal :on-confirm="deleteProjectAreas"
                  type="info"
                  :open="showDeleteAreasConfirm"
                  title="Delete all project areas"
                  @cancel="() => { showDeleteAreasConfirm = false }">
        Are you sure you want to delete all project areas? This action will only remove areas temporarily in your
        current session. <span class="font-bold">To permanently apply this change, you must save the project afterwards</span>. Proceed?
    </ConfirmModal>
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
                    <QuestionMarkCircleIcon v-if="store.project.reportingLine === 'GEF'"
                                            @click="() => { showAdminAreaInfoModal = true }"
                                            class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />
                </li>
                <li>
                    Upload polygons/vector
                    <QuestionMarkCircleIcon v-if="store.project.reportingLine === 'GEF'"
                                            @click="() => { showUploadInfoModal = true }"
                                            class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />

                </li>
                <li>Draw directly on the platform
                    <QuestionMarkCircleIcon v-if="store.project.reportingLine === 'GEF'"
                                            @click="() => { showDrawInfoModal = true }"
                                            class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />
                </li>
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
                    Please find the structure of the feature table to be uploaded in the platform in <a class="text-ferm-blue-dark-800 underline"
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
                        characteristics of the EPSG:4326 - WGS 84 system. We advise exercising caution when using
                        this
                        data for precise area calculations or analyses, considering these inherent limitations.
                    </div>
                </AlertModal>
            </div>

            <template v-if="store.project.reportingLine === 'GEF'">
                <FileUploadInputGroup2 label="Please upload Restoration Plans/Management Plans"
                                       :folder="store.id!"
                                       :edit="edit">
                    <template v-slot:info>
                        <p>Please upload the Restoration Plans/ Management plans with the description of restoration / land
                            management activities and baseline information of the territory, including pictures.</p>
                    </template>
                </FileUploadInputGroup2>

                <FormGroup label="Total area of land achieved (tabular format)">
                    <NumberInput :edit="edit"
                                 v-model="store.project.project.areaAchieved" />
                    <template v-slot:info>
                        <p>Please include the land (in ha) reported in the Restoration Plans/Management Plans (tabular data).</p>
                    </template>
                </FormGroup>
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="store.polygonsArea().toFixed(2)" />
            </template>
            <FormGroup v-else
                       label="Total area under restoration (ha)">
                <NumberInput :edit="edit"
                             v-model="store.project.project.areaUnderRestoration" />
            </FormGroup>

            <div class="py-6">
                <MultiInput :edit="edit"
                            :numbering="(n, v) => numbering(n, v)"
                            :inputComponents="multiInputComponents"
                            v-model="store.projectAreas"
                            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted." />
                <!--                <button v-if="store.projectAreas.length > 0 && edit"-->
                <!--                        @click="deleteProjectAreas()" type="button"-->
                <!--                        class="mt-6 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">-->
                <!--                    <TrashIcon class="-ml-0.5 h-5 w-5" aria-hidden="true" />-->
                <!--                    Delete all areas-->
                <!--                </button>-->
                <button v-if="store.projectAreas.length > 0 && edit"
                        @click="() => { showDeleteAreasConfirm = true }"
                        type="button"
                        class="mt-6 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                    <TrashIcon class="-ml-0.5 h-5 w-5"
                               aria-hidden="true" />
                    Delete all areas
                </button>

            </div>
        </template>
    </TabTemplate>
    <!-- <pre>{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
