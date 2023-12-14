<script setup lang="ts">
import { ref, watch, provide, onMounted } from 'vue';

import { TrashIcon, XCircleIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';

import MultiInput from '@/components/inputs/MultiInput.vue';
import MapInput from '@/components/inputs/base/MapInput.vue';
import AdminArea from '@/components/inputs/AdminArea.vue';
import MapUpload from '@/components/inputs/base/MapUpload.vue';
import ShapefileUploadDialog from './ShapefileUploadDialog.vue';
import KmlKmzUploadDialog from './KmlKmzUploadDialog.vue';
import FormGroup from '@/components/inputs/FormGroup.vue';
import NumberInput from '@/components/inputs/base/NumberInput.vue';
// import AreaFormGroup from '@/components/inputs/AreaFormGroup.vue';
import SelectInput from '@/components/inputs/base/SelectInput.vue';
// import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';

import ConfirmModal from '@/views/ConfirmModal.vue';

import { getMenuSelectedLabel } from '@/components/project/menus';

// import { getIso2Name, countries as iso2countries } from '@/lib/gaul2iso';
import { getGaulLevel0 } from '@/firebase/firestore';


const store = useProjectStore();
const menus = useMenusStore().menus;
let countries = ref();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

onMounted(async () => {
    countries.value = await getGaulLevel0();
});

function getCountryName(iso2: string) {
    const country = countries.value.find(c => console.log(c) || c.iso2 === iso2)
    return country?.label || null;
}

const multiInputComponents = {
    adminArea: {
        component: AdminArea,
        newData: {},
        addItemLabel: 'Add admin area',
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    draw: {
        component: MapInput,
        newData: {},
        addItemLabel: 'Draw polygon',
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    upload: {
        component: MapUpload,
        newData: {},
        addItemLabel: 'Upload shapefile',
        addDialog: ShapefileUploadDialog,
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    },
    uploadKml: {
        component: MapUpload,
        newData: {},
        addItemLabel: 'Upload KML/KMZ/GeoJSON',
        addDialog: KmlKmzUploadDialog,
        calculatedProps: [
            { key: 'index', f: (area: any, i: number) => i },
            { key: 'nAreas', f: (areas: any) => areas.length }
        ],
    }
};


// watch store.project.project.areaUnits for changes
// if units change, show alert
watch(() => store.project?.project.areaUnits, (_newVal, oldVal) => {
    if (store.project) {
        if (oldVal) {
            alert('You have changed the units of the target area. Please note that the areas you have defined will be not be converted to the new units. Please review all the areas you have defined.');
        } else {
            alert('You have set the units of the target area for the whole project. Please note that all the areas will have to be entered in the same units.');
        }
    }
});

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
    if (!confirm('Are you sure you want to apply this ecosystem to all areas? Your current selections will be overwritten.')) return;

    const ecosystems = getAreaValue(store.projectAreas[0]).ecosystems;
    if (!ecosystems?.length) {
        alert('Please select ecosystems for the first area first.');
        return;
    }
    store.projectAreas.forEach((area, i) => {
        const type = getAreaType(area);
        if (i > 0) {
            area[type].ecosystems = [...ecosystems];
        }
    });
});
</script>

<template>
    <ConfirmModal :on-confirm="deleteProjectAreas"
                  type="info"
                  :open="showDeleteAreasConfirm"
                  title="Delete all project areas"
                  @cancel="() => { showDeleteAreasConfirm = false }">
        Are you sure you want to delete all project areas? This action will only remove areas temporarily in your
        current session. <span class="font-bold">To permanently apply this change, you must save the project afterwards</span>. Proceed?
    </ConfirmModal>
    <TabTemplate title="Area & ecosystems">
        <template #description>
            <p>
                Identification of geographic areas under ecosystem restoration is key for geospatial applications and is essential to keep track of effective restoration, being the main objective of Target 2 of the Kunming-Montreal Global Biodiversity Framework (<a class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 dark:hover:text-ferm-blue-dark-200"
                   href="https://www.cbd.int/gbf/targets/2/"
                   target="_blank">Target 2</a>). One initiative can implement ecosystem restoration in one or more geographic areas. Activities, indicators, ecosystem characterization and results will be provided for each area. Geographic areas can be identified based on different options:
            </p>
            <ul class="list-disc list-inside">
                <li>
                    Select administrative areas
                </li>
                <li>
                    Upload polygons/vector
                </li>
                <li>
                    Draw directly on the platform
                </li>
            </ul>
            <p class="pt-4">
                It is crucial to identify the ecosystems that your initiative is restoring. The IUCN Global Ecosystem Typology 2.0 is the outcome of critical review and input by an extensive international network of ecosystem scientists, containing profiles for 5 realms and their combinations, 25 biomes and 108 ecosystem functional groups (Keith et al.2022).
            </p>
            <p class="pt-4">
                <span class="font-bold">Realms</span> are the five major components of the biosphere that differ fundamentally in ecosystem organization and function: terrestrial, freshwater, marine, subterranean and atmospheric.
            </p>
            <p class="pt-4">
                <span class="font-bold">Biomes</span> are components of a realm united by one or a few common major ecological drivers that regulate major ecosystem functions and ecological processes.
            </p>
            <p class="pt-4">
                <span class="font-bold">Ecosystem functional groups</span> are a group of related ecosystems within a biome that share common ecological drivers promoting convergence of ecosystem properties that characterize the group.
            </p>
            <p class="pt-4">
                If spatially explicit information about an area is provided and represents the entirety of the area under restoration (i.e. points or polygons of the areas are provided, the button “get biomes in this area” can be used to automatically generate a map overlay to indicate potential biomes that may be under restoration in the area. The user will need to review the automatically selected biomes and ensure that the biomes selected are truly those under restoration. If only tabular data of an area is provided, we kindly ask you to select the corresponding ecosystems using biomes of the IUCN Global Ecosystem Typology 2.0 (Keith et al., 2022).
            </p>
        </template>
        <template #default>
            <FormGroup label="Committed area to restore">
                <div class="flex gap-8">
                    <div class="flex flex-col gap-1">
                        <NumberInput v-model="store.project.project.targetArea"
                                     :edit="edit" />
                        <span class="text-gray-300 text-sm">Area</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <SelectInput v-model="store.project.project.areaUnits"
                                     :options="menus.units"
                                     :edit="edit" />
                        <span class="text-gray-300 text-sm">Units</span>
                    </div>
                </div>
                <template v-slot:info>
                    Includes pledges, targets, aspirations, or commitments of area to restore. This parameter will not be counted as area under restoration but will serve as a reference to monitor restoration progress.
                </template>
            </FormGroup>
            <FormGroup :label="`Total area under restoration [${getMenuSelectedLabel(store.project.project.areaUnits, menus.units)}]`">
                <NumberInput :edit="edit"
                             v-model="store.project.project.areaUnderRestoration" />
            </FormGroup>
            <div class="py-6">
                <div v-if="edit || store.project.project.countries?.length > 0"
                     class="text-sm italic text-gray-700 mb-1.5">Countries are automatically set based on your uploaded polygons and selected admin areas. You can also edit them manually.</div>
                <div v-if="countries"
                     class="flex gap-x-2 mb-4">
                    <div class="border rounded-md px-2 py-1 flex flex-row gap-x-1 items-center"
                         v-for="(area, i) in (store.project.project.countries || []).map(getCountryName)">
                        <div>{{ area }}</div>
                        <XCircleIcon v-if="edit"
                                     class="self-center h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer"
                                     aria-hidden="true"
                                     @click="() => deleteCountry(i)" />
                    </div>
                    <select v-model="newCountry"
                            v-if="edit"
                            @change="addCountry"
                            class="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">Add country</option>
                        <option v-for="country in countries"
                                :value="country.iso2">
                            {{ country.label }}
                        </option>
                    </select>
                </div>

                <MultiInput :edit="edit"
                            :numbering="(n, v) => numbering(n, v)"
                            :inputComponents="multiInputComponents"
                            v-model="store.projectAreas"
                            deleteConfirmMessage="Are you sure you want to delete this area? The related characteristics, activities and ecosystems will also be deleted." />
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
