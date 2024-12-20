<script setup lang="ts">
import { ref, provide, onMounted, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { toast } from 'vue3-toastify';

import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import { TrashIcon, XCircleIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';
import { useAuthStore } from '@/stores/auth';

import TabTemplate from '../TabTemplate.vue';

import MultiInput from '../../components/inputs/MultiInput.vue';
import MapInput from '../../components/inputs/base/MapInput.vue';
import AdminArea from '../../components/inputs/AdminArea.vue';
import MapUpload from '../../components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from './ShapefileUploadDialog.vue';
import KmlKmzUploadDialog from './KmlKmzUploadDialog.vue';
import FormGroup from '../../components/inputs/FormGroup.vue';
import NumberInput from '../../components/inputs/base/NumberInput.vue';
import FileUploadFormGroup2 from '@/components/inputs/base/FileUploadFormGroup2.vue';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import countryEcosystemsFormGroup from '@/components/inputs/base/CountryEcosystemsFormGroup.vue';
import paAndTraditionalTerritories from './paAndTraditionalTerritories.vue';
import MultiInputPassive from '@/components/inputs/base/MultiInputPassive.vue';

import InfoButton from '@/components/InfoButton.vue';
import AoiViewInfo from '@/views/project/AoiViewInfo.vue';

import AlertModal from '@/views/AlertModal.vue';
import ConfirmModal from '@/views/ConfirmModal.vue';

import { roundToPrecisionAsString } from '@/lib/util';

import { getGaulLevel0 } from '@/firebase/firestore';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useProjectStore();
const authStore = useAuthStore();

let countries = ref();

onMounted(async () => {
    countries.value = await getGaulLevel0();
});

function getCountryName(iso2: string) {
    const country = countries.value.find(c => c.iso2 === iso2)
    return country?.label || null;
}

const multiInputComponents = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.addAdminArea')),
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    draw: {
        component: MapInput,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.drawPolygon')),
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    upload: {
        component: MapUpload,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.uploadShapefile')),
        addDialog: ShapefileUploadDialog,
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    uploadKml: {
        component: MapUpload,
        newData: {},
        addItemLabel: computed(() => t('inputs.aoi.uploadGeoJson')),
        addDialog: KmlKmzUploadDialog,
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    }
};

const paAndTraditionalTerritoriesComponent = {
    component: paAndTraditionalTerritories,
    newData: {
        localCommunities: undefined,
        protectedAreas: undefined
    },
    addItemLabel: 'Add admin area',
    labelFn: (_i, v) => countries.value.find(c => c.iso2 === v.id)?.label || 'Unknown country',
    // calculatedProps: [
    //     { key: 'country', f: (_: any, i: number) => store.project.project.countries[i] },
    // ],
    // has to be calculated props to be dynamic
    calculatedProps: [{ key: 'units', f: (_: any, i: number) => store.project.project.areaUnits }]
};

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

function deleteCountry(i: number) {
    store.project.project.countries.splice(i, 1);
}

const newCountry = ref('');
function addCountry(event: Event) {
    const country = newCountry.value;
    if (country) {
        const newCountries = new Set(store.project.project.countries).add(country);
        store.project.project.countries = [...newCountries];
        newCountry.value = '';
    }
}

function getAreaType(area: any) {
    return Object.keys(area)[0];
}
function getAreaValue(area: any) {
    return area[getAreaType(area)];
}

provide('applyToAll', () => {
    if (!confirm(t('areaAndEcosystems.alerts.applyEcosystemsToAll'))) {
        return;
    }

    const ecosystems = getAreaValue(store.projectAreas[0]).ecosystems;
    if (!ecosystems?.length) {
        toast.info(t('areaAndEcosystems.alerts.selectEcosystems'), { position: 'top-right' });
        return;
    }
    store.projectAreas.forEach((area, i) => {
        const type = getAreaType(area);
        if (i > 0) {
            area[type].ecosystems = [...ecosystems];
        }
    });
});

// function onUploadProgress({ loaded, total }: { loaded: number, total: number }) {
// TODO
// }

const uniqueEcosystems = computed(() => {
    if (!countries.value) return [];
    const ecosystems = new Set<string>();
    store.projectAreas.forEach(area => {
        const areaEcosystems = getAreaValue(area).ecosystems;
        if (areaEcosystems) {
            areaEcosystems.forEach((ecosystem: string) => ecosystems.add(ecosystem));
        }
    });
    return [...ecosystems];
});
</script>

<template>
    <AlertModal
        type="info"
        :onClose="() => showUploadInfoModal = false"
        :open="showUploadInfoModal"
        title="Upload polygons/vector"
        buttonText="Close"
    >
        <div class="text-left text-sm">
            <!-- Please upload a shapefile with the land (in ha) reported in the geographic information system (spatially explicit data) if available. Otherwise please include the coordinates of project location. -->
            {{ t('areaAndEcosystems.alerts.gef.uploadPolygons') }}
        </div>
    </AlertModal>
    <AlertModal
        type="info"
        :onClose="() => showDrawInfoModal = false"
        :open="showDrawInfoModal"
        title="Draw directly on the platform"
        buttonText="Close"
    >
        <div class="text-left text-sm">
            <!-- Please use the drawer feature to draw the land directly on the platform. The calculator function will calculate the land (in ha). -->
            {{ t('areaAndEcosystems.alerts.gef.drawOnPlatform') }}
        </div>
    </AlertModal>
    <AlertModal
        type="info"
        :onClose="() => showAdminAreaInfoModal = false"
        :open="showAdminAreaInfoModal"
        title="Select administrative areas"
        buttonText="Close"
    >
        <div class="text-left text-sm">
            <!-- Please select the administrative area where your project is working and enter the full land (in ha) of the administrative area or enter the land (in ha) within an administrative area where your project is working -->
            {{ t('areaAndEcosystems.alerts.gef.selectAdminArea') }}
        </div>
    </AlertModal>
    <ConfirmModal
        :on-confirm="deleteProjectAreas"
        type="info"
        :open="showDeleteAreasConfirm"
        title="Delete all project areas"
        @cancel="() => { showDeleteAreasConfirm = false }"
    >
        Are you sure you want to delete all project areas? This action will only remove areas temporarily in your
        current session. <span class="font-bold">To permanently apply this change, you must save the project afterwards</span>. Proceed?
    </ConfirmModal>
    <TabTemplate :title="t('areaAndEcosystems.title')">
        <template #description>
            {{ t('areaAndEcosystems.description.gef.main') }}
            <i18n-t
                keypath="areaAndEcosystems.description.gef.ecosystems"
                tag="p"
                class="pt-4"
            >
                <template v-slot:infoButton>
                    <InfoButton :title="t('areaAndEcosystems.description.moreInformation')">
                        <slot>
                            <AoiViewInfo />
                        </slot>
                    </InfoButton>
                </template>
            </i18n-t>
        </template>
        <template #default>
            <div class="border-2 rounded-xl my-4 px-5 bg-yellow-100 shadow-md border-gray-300">
                <!-- <p class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm"><span class="font-bold">Information on Land committed in GEF Core Indicators (tabular data):</span> The land committed in GEF Core Indicators includes the ha committed in GEF Core Indicators 1-5 and LDCF Indicator 2.</p> -->

                <i18n-t
                    keypath="areaAndEcosystems.gef.landCommitted.info.text"
                    tag="p"
                    class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm"
                >
                    <template #title>
                        <span class="font-bold">
                            {{ $t('areaAndEcosystems.gef.landCommitted.info.title') }}:
                        </span>
                    </template>
                </i18n-t>
                <FormGroup
                    :edit="edit"
                    label="Breakdown of commitment by core indicator [Hectares]"
                    description="Area of land committed by core indicator"
                >
                    <div class="grid _grid-flow-row gap-x-6 gap-y-4 grid-cols-2 items-start _grid-cols-[min-content_minmax(0px,_200px)]">
                        <label
                            for="targetAreaCoreIndicator1"
                            class="block text-sm font-medium text-gray-700"
                        >Core Indicator 1
                            -
                            <span class="font-normal">
                                Terrestrial protected areas created or under improved Management
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator1"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator1"
                            min="0"
                        />
                        <!-- </div>
                        <div class="flex flex-row md:flex-col items-center md:items-start gap-x-3"> -->
                        <label
                            for="targetAreaCoreIndicator2"
                            class="block text-sm font-medium text-gray-700"
                        >Core Indicator 2
                            -
                            <span class="font-normal">
                                Marine protected areas created or under improved management
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator2"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator2"
                            min="0"
                        />
                        <!-- </div>
                        <div class="flex flex-row md:flex-col items-center md:items-start gap-x-3"> -->
                        <label
                            for="targetAreaCoreIndicator3"
                            class="block text-sm font-medium text-gray-700"
                        >Core Indicator 3
                            -
                            <span class="font-normal">
                                Area of land and ecosystems under restoration
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator3"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator3"
                            min="0"
                        />
                        <!-- </div>
                        <div class="flex flex-row md:flex-col items-center md:items-start gap-x-3"> -->
                        <label
                            for="targetAreaCoreIndicator4"
                            class="block text-sm font-medium text-gray-700"
                        >Core Indicator 4
                            -
                            <span class="font-normal">
                                Area of landscapes under improved practices
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator4"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator4"
                            min="0"
                        />
                        <!-- </div> -->
                        <!-- <div class="flex flex-row md:flex-col items-center md:items-start gap-x-3"> -->
                        <label
                            for="targetAreaCoreIndicator5"
                            class="block text-sm font-medium text-gray-700"
                        >Core Indicator 5
                            -
                            <span class="font-normal">
                                Area of marine habitat under improved practices to benefit biodiversity
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator5"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator5"
                            min="0"
                        />
                        <!-- </div> -->
                        <!-- <div class="flex flex-row md:flex-col items-center md:items-start gap-x-3"> -->
                        <label
                            for="targetAreaCoreIndicator2LDCF"
                            class="block text-sm font-medium text-gray-700"
                        >LDCF CI 2
                            -
                            <span class="font-normal">
                                Area of land managed for climate resilience
                            </span>
                        </label>
                        <NumberInput
                            class="flex-1"
                            id="targetAreaCoreIndicator2LDCF"
                            :edit="edit"
                            v-model="store.project.project.targetAreaCoreIndicator2LDCF"
                            min="0"
                        />
                    </div>
                </FormGroup>
            </div>

            <div class="border-2 rounded-xl my-4 px-5 bg-teal-50 shadow-md border-gray-300">
                <p class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm"><span class="font-bold">Information on Restoration Plans/Management Plans (tabular data).</span>
                    The plan should at least include a description of restoration or land management activities and the extension of the area of intervention.</p>
                <FileUploadFormGroup2
                    label="Please upload Restoration Plans/Management Plans"
                    :projectId="store.id!"
                    folder="documents/gef/plans"
                    :multiple="true"
                    :getAccessTokenFn="authStore!.getIdToken"
                    :edit="edit"
                >

                    <template #info>
                        <p>Please upload the Restoration Plans/ Management plans with the description of restoration / land management activities and baseline information of the territory, including pictures.</p>
                    </template>
                </FileUploadFormGroup2>
            </div>

            <div class="border-2 rounded-xl my-4 px-5 pb-5 bg-red-50 shadow-md border-gray-300">
                <div class="mt-5 border border-gray-300 rounded-lg px-4 py-3 bg-stone-50 text-sm">
                    <p><span class="font-bold">Information on Geographic Areas (spatially explicit data).</span>
                        The data should have the following <a
                            class="text-ferm-blue-dark-800 underline"
                            href="/gef/Requirements of geospatial data.pdf"
                            target="_blank"
                        >requirements</a> and the feature table to be uploaded the following <a
                            class="text-ferm-blue-dark-800 underline"
                            href="/gef/Sample feature table GEF Projects.csv"
                            target="_blank"
                        >structure</a>
                    </p>
                    <p
                        @click="() => showDisclaimer = true"
                        class="mt-4 font-semibold cursor-pointer text-ferm-blue-dark-800 underline uppercase"
                    >
                        Disclaimer
                    </p>
                    <p class="mt-4">Areas can be identified based on different options:
                    <ul class="list-disc list-inside">
                        <li>
                            Select administrative areas
                            <InformationCircleIcon
                                @click="() => { showAdminAreaInfoModal = true }"
                                class="w-6 h-6 inline-block ml-1 text-yellow-600 cursor-pointer"
                            />
                        </li>
                        <li>
                            Upload polygons/vector
                            <InformationCircleIcon
                                @click="() => { showUploadInfoModal = true }"
                                class="w-6 h-6 inline-block ml-1 text-yellow-600 cursor-pointer"
                            />

                        </li>
                        <li>Draw directly on the platform
                            <InformationCircleIcon
                                @click="() => { showDrawInfoModal = true }"
                                class="w-6 h-6 inline-block ml-1 text-yellow-600 cursor-pointer"
                            />
                        </li>
                    </ul>
                    </p>
                </div>
                <LabelFormGroup
                    label="Total area of land achieved (spatially explicit format)"
                    :value="roundToPrecisionAsString(store.polygonsArea(), 2)"
                >

                    <template #info>
                        <p>The total of the land (in ha) will be computed by the plattorm based on spatially explicit information provided.</p>
                    </template>
                </LabelFormGroup>
                <div
                    v-if="countries"
                    class="flex flex-wrap w-full gap-2 mb-4 whitespace-nowrap"
                >
                    <div
                        class="border rounded-md px-4 py-1 flex flex-row gap-x-1 items-center bg-white"
                        v-for="(area, i) in (store.project.project.countries || []).map(getCountryName)"
                    >
                        <div>{{ area }}</div>
                        <XCircleIcon
                            v-if="edit"
                            class="self-center h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer"
                            aria-hidden="true"
                            @click="() => deleteCountry(i)"
                        />
                    </div>
                    <div>
                        <select
                            v-model="newCountry"
                            v-if="edit"
                            @change="addCountry"
                            class="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Add country</option>
                            <option
                                v-for="country in countries"
                                :value="country.iso2"
                            >
                                {{ country.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <MultiInput
                    :edit="edit"
                    :numbering="(n, v) => numbering(n, v)"
                    :input-components="multiInputComponents"
                    v-model="store.projectAreas"
                    :paging-size="25"
                    delete-confirm-message="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted."
                />
                <button
                    v-if="store.projectAreas.length > 0 && edit"
                    @click="() => { showDeleteAreasConfirm = true }"
                    type="button"
                    class="mt-6 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                    <TrashIcon
                        class="-ml-0.5 h-5 w-5"
                        aria-hidden="true"
                    />
                    {{ t('areaAndEcosystems.deleteAllAreas') }}
                </button>
            </div>
            <div
                v-if="countries"
                class="my-4 "
            >
                <countryEcosystemsFormGroup
                    v-model="store.project.project.ecosystems"
                    :edit="edit"
                    :countries="store.project.project.countries"
                    :ecosystems="uniqueEcosystems"
                    :totalArea="store.project.project.targetAreaCoreIndicator3"
                    :areaUnits="store.project.project.areaUnits"
                />
                <div class="mt-4 text-lg text-gray-700 font-bold mb-2">
                    Protected Area (PA), Other Effective Area-based Conservation Measures (OECM) and Indigenous and Traditional Territory (ITT)
                </div>
                <MultiInputPassive
                    :edit="edit"
                    :ids="store.project.project.countries"
                    :input-component="paAndTraditionalTerritoriesComponent"
                    v-model="store.project.paAndTraditionalTerritories"
                />
            </div>
        </template>
    </TabTemplate>
</template>
