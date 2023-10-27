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
import KmlKmzUploadDialog from './KmlKmzUploadDialog.vue';
import FormGroup from '../../components/inputs/FormGroup.vue';
import NumberInput from '../../components/inputs/base/NumberInput.vue';
import FileUploadInputGroup2 from '@/components/inputs/base/FileUploadFormGroup2.vue';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import RecursiveRadioFormGroup from '@/components/inputs/base/RecursiveRadioFormGroup.vue';

import AlertModal from '@/views/AlertModal.vue';
import ConfirmModal from '@/views/ConfirmModal.vue';

import { useMenusStore } from '@/stores/menus';
const menus = useMenusStore().menus;

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
    },
    uploadKml: {
        component: MapUpload,
        newData: {},
        addItemLabel: 'Upload KML/KMZ/geojson',
        addDialog: KmlKmzUploadDialog
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
    } else if (key === 'uploadKml') { // this is actually kml, kmz, geojson
        return `Area ${i + 1}`;
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
    <AlertModal type="info"
                :onClose="() => showUploadInfoModal = false"
                :open="showUploadInfoModal"
                title="Upload polygons/vector"
                buttonText="Close">
        <div class="text-left text-sm">
            Please upload a shapefile with the land (in ha) reported in the geographic information system (spatially
            explicit data) if available. Otherwise please include the coordinates of project location.
        </div>
    </AlertModal>
    <AlertModal type="info"
                :onClose="() => showDrawInfoModal = false"
                :open="showDrawInfoModal"
                title="Draw directly on the platform"
                buttonText="Close">
        <div class="text-left text-sm">
            Please use the drawer feature to draw the land directly on the platform. The calculator function will calculate the land (in ha).
        </div>
    </AlertModal>
    <AlertModal type="info"
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
    <TabTemplate title="Area & Ecosystems">
        <template #description>
            <p>
                In this tab information on the project areas and ecosystems is needed in tabular and in geospatial form. You will need to provide details on committed land under GEF Core Indicators 1-5, and information on Restoration Plans/Management Plans with the extension of the area of intervention as well as the geospatial information of the areas including ecosystems covered.
            </p>
        </template>
        <template #default>
            <div v-if="false"
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
                <AlertModal type="info"
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

            <!-- Enable this when the reporting line is GEF -->
            <div class="border-2 rounded-xl my-4 px-5 bg-yellow-100 dark:bg-amber-900 shadow-md border-gray-300">
                <p class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm"><span class="font-bold">Information on Land committed in GEF Core Indicators (tabular data).</span>
                    The sum of committed land in GEF Core Indicators 1-5 shall be included
                    in project design phase, at mid-term review phase (MT) and at
                    terminal evaluation (TE) phase.</p>

                <FormGroup :edit="edit"
                           label="Target area in design phase [Hectares]"
                           description="Area of land committed in design phase">
                    <NumberInput :edit="edit"
                                 v-model="store.project.project.targetAreaDesignPhase" />
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in <span class="font-bold">project design phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </FormGroup>
                <!-- <NumberFormGroup :edit="edit"
                                 label="Target area in design phase"
                                 v-model="store.project.project.targetAreaDesignPhase"
                                 description="Area of land committed in design phase">
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in <span class="font-bold">project design phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </NumberFormGroup> -->
                <FormGroup :edit="edit || store.project.project.targetAreaReviewPhase"
                           label="Target area in mid-term review phase [Hectares]"
                           description="Area of land committed in mid-term review phase">
                    <NumberInput :edit="edit"
                                 v-model="store.project.project.targetAreaReviewPhase" />
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in project <span class="font-bold">mid-term review phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </FormGroup>
                <!-- <AreaFormGroup v-if="edit || store.project.project.targetAreaReviewPhase"
                               :edit="edit"
                               label="Target area in mid-term review phase"
                               v-model="store.project.project.targetAreaReviewPhase"
                               description="Area of land committed in mid-term review phase">
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in project <span class="font-bold">mid-term review phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </AreaFormGroup> -->

                <FormGroup :edit="edit || store.project.project.targetAreaEvaluationPhase"
                           label="Target area in terminal evaluation phase [Hectares]"
                           description="Area of land committed in terminal evaluation phase">
                    <NumberInput :edit="edit"
                                 v-model="store.project.project.targetAreaEvaluationPhase" />
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in project <span class="font-bold">terminal evaluation phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </FormGroup>
                <!-- <AreaFormGroup v-if="edit || store.project.project.targetAreaEvaluationPhase"
                               :edit="edit"
                               label="Target area in terminal evaluation phase"
                               v-model="store.project.project.targetAreaEvaluationPhase"
                               description="Area of land committed in terminal evaluation phase">
                    <template v-slot:info>
                        <p>Please include the land (in ha) committed in project <span class="font-bold">terminal evaluation phase</span>
                            (sum of GEF Core Indicators 1-5). Restoration target will fall under GEF Core Indicator 3.</p>
                    </template>
                </AreaFormGroup> -->
            </div>

            <div class="border-2 rounded-xl my-4 px-5 bg-teal-50 dark:bg-teal-900 shadow-md border-gray-300">
                <p class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm"><span class="font-bold">Information on Restoration Plans/Management Plans (tabular data).</span> The
                    plan should at least include a description of restoration or land management
                    activities and the extension of the area of intervention.</p>
                <FormGroup label="Total area of land achieved (tabular format)">
                    <NumberInput :edit="edit"
                                 v-model="store.project.project.areaAchieved" />
                    <template v-slot:info>
                        <p>Please include the land (in ha) reported in the Restoration Plans/Management Plans (tabular data).</p>
                    </template>
                </FormGroup>
                <FileUploadInputGroup2 label="Please upload Restoration Plans/Management Plans"
                                       :folder="store.id!"
                                       :edit="edit">
                    <template v-slot:info>
                        <p>Please upload the Restoration Plans/ Management plans with the description of restoration / land
                            management activities and baseline information of the territory, including pictures.</p>
                    </template>
                </FileUploadInputGroup2>
                <RecursiveRadioFormGroup :edit="edit"
                                         dangerousHtmlDescription="Do the areas of intervention described in the Restoration Plans/Management Plans coincide with the areas of intervention uploaded in the <span class='text-black'>Geographic Areas?</span>"
                                         :options="menus.boolean"
                                         :show-search-input="false"
                                         v-model="store.project.project.areaAchievedMatch"
                                         :show-selection="false" />
            </div>

            <div class="border-2 rounded-xl my-4 px-5 pb-5 bg-red-50 dark:bg-red-900 shadow-md border-gray-300">
                <div class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm">
                    <p><span class="font-bold">Information on Geographic Areas (spatially explicit data).</span>
                        The data should
                        have the following <a class="text-ferm-blue-dark-800 underline"
                           href="/gef/Requirements of geospatial data.pdf"
                           target="_blank">requirements</a> and the feature table to be uploaded
                        the following <a class="text-ferm-blue-dark-800 underline"
                           href="/gef/Sample feature table GEF Projects.csv"
                           target="_blank">structure</a>
                    </p>
                    <p @click="() => showDisclaimer = true"
                       class="mt-4 font-semibold cursor-pointer text-ferm-blue-dark-800 underline uppercase">
                        Disclaimer
                    </p>
                    <p class="mt-4">Areas can be identified based on different options:
                    <ul class="list-disc list-inside">

                        <li>
                            Select administrative areas
                            <QuestionMarkCircleIcon @click="() => { showAdminAreaInfoModal = true }"
                                                    class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />
                        </li>
                        <li>
                            Upload polygons/vector
                            <QuestionMarkCircleIcon @click="() => { showUploadInfoModal = true }"
                                                    class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />

                        </li>
                        <li>Draw directly on the platform
                            <QuestionMarkCircleIcon @click="() => { showDrawInfoModal = true }"
                                                    class="w-6 h-6 inline-block ml-1 text-yellow-600 dark:text-yellow-400 cursor-pointer" />
                        </li>
                    </ul>
                    </p>
                </div>
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="store.polygonsArea().toFixed(2)">
                    <template v-slot:info>
                        <p>The total of the land (in ha) will be computed by the
                            plattorm based on spatially explicit information provided.</p>
                    </template>

                </LabelFormGroup>

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
