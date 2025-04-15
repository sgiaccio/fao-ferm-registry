<script setup lang="ts">
import { ref, watch, provide, onMounted, computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { toast } from 'vue3-toastify';

import { TrashIcon, XCircleIcon } from '@heroicons/vue/20/solid';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';

// import MapInput from '@/components/inputs/base/MapInput.vue';
// import AdminArea from '@/components/inputs/AdminArea.vue';
// import MapUpload from '@/components/inputs/base/MapUpload.vue';
// import ShapefileUploadDialog from './ShapefileUploadDialog.vue';
// import KmlKmzUploadDialog from './KmlKmzUploadDialog.vue';
import FormGroup from '@/components/inputs/FormGroup.vue';
import NumberInput from '@/components/inputs/base/NumberInput.vue';
import SelectInput from '@/components/inputs/base/SelectInput.vue';
import InfoButton from '@/components/InfoButton.vue';
import AoiViewInfo from '@/views/project/AoiViewInfo.vue';
import CountryEcosystemsFormGroup from '@/components/inputs/base/CountryEcosystemsFormGroup.vue';
import paAndTraditionalTerritories from './paAndTraditionalTerritories.vue';
import MultiInputPassive from '@/components/inputs/base/MultiInputPassive.vue';

import ConfirmModal from '@/views/ConfirmModal.vue';

import { getMenuSelectedLabel } from '@/components/project/menus';

import { getGaulLevel0 } from '@/firebase/firestore';

import AreasManager from '@/components/project/AreasManager.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

const store = useProjectStore();
const menus = useMenusStore().menus;

let countries = ref();

onMounted(async () => {
    countries.value = await getGaulLevel0();
});

function getCountryName(iso2: string) {
    const country = countries.value.find(c => c.iso2 === iso2)
    return country?.label || null;
}

// const multiInputComponents = {
//     adminArea: {
//         component: AdminArea,
//         newData: {},
//         addItemLabel: computed(() => t('inputs.aoi.addAdminArea')),
//         calculatedProps: [
//             { key: 'index', f: (area: any, i: number) => i },
//             { key: 'nAreas', f: (areas: any) => areas.length }
//         ],
//     },
//     draw: {
//         component: MapInput,
//         newData: {},
//         addItemLabel: computed(() => t('inputs.aoi.drawPolygon')),
//         calculatedProps: [
//             { key: 'index', f: (area: any, i: number) => i },
//             { key: 'nAreas', f: (areas: any) => areas.length }
//         ],
//     },
//     upload: {
//         component: MapUpload,
//         newData: {},
//         addItemLabel: computed(() => t('inputs.aoi.uploadShapefile')),
//         addDialog: ShapefileUploadDialog,
//         calculatedProps: [
//             { key: 'index', f: (area: any, i: number) => i },
//             { key: 'nAreas', f: (areas: any) => areas.length }
//         ],
//     },
//     uploadKml: {
//         component: MapUpload,
//         newData: {},
//         addItemLabel: computed(() => t('inputs.aoi.uploadGeoJson')),
//         addDialog: KmlKmzUploadDialog,
//         calculatedProps: [
//             { key: 'index', f: (area: any, i: number) => i },
//             { key: 'nAreas', f: (areas: any) => areas.length }
//         ],
//     },
//     ground: {
//         component: MapInput,
//         newData: {},
//         addItemLabel: 'Draw polygon',
//         calculatedProps: [
//             { key: 'index', f: (area: any, i: number) => i },
//             { key: 'nAreas', f: (areas: any) => areas.length }
//         ],
//     },
// };

const paAndTraditionalTerritoriesComponent = {
    component: paAndTraditionalTerritories,
    newData: {
        localCommunities: undefined,
        protectedAreas: undefined
    },
    labelFn: (_i, v) => countries.value.find(c => c.iso2 === v.id)?.label || 'Unknown country',
    // calculatedProps: [
    //     { key: 'country', f: (_: any, i: number) => store.project.project.countries[i] },
    // ],
    // has to be calculated props to be dynamic
    calculatedProps: [{ key: 'units', f: (_: any, i: number) => store.project.project.areaUnits }]
};

// watch store.project.project.areaUnits for changes
// if units change, show alert
watch(() => store.project?.project.areaUnits, (_newVal, oldVal) => {
    if (store.project) {
        if (oldVal) {
            toast.warning(t('areaAndEcosystems.alerts.areaUnitsChanged'), { position: 'top-right', autoClose: false });
        } else {
            toast.warning(t('areaAndEcosystems.alerts.areaUnitsSet'), { position: 'top-right', autoClose: false });
        }
    }
});

function numbering(i: number, v: any) {
    const key = Object.keys(v)[0];
    const localizedArea = t('areaAndEcosystems.area');
    if (key === 'adminArea') {
        return `${localizedArea} ${i + 1}`;
    } else if (key === 'draw') {
        return `${localizedArea} ${i + 1}`;
    } else if (key === 'upload') {
        const value = v[key];
        return `${localizedArea} ${value.shapeId || i + 1}`;
    } else if (key === 'uploadKml') { // this is actually kml, kmz, geojson
        return `${localizedArea} ${i + 1}`;
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
    // if (!confirm('Are you sure you want to apply this ecosystem to all areas? Your current selections will be overwritten.')) return;
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

// const nShow = ref(25);
// const hasMorePages = computed(() => nShow.value && nShow.value < store.projectAreas.length);
// const selectedInputType = ref('adminArea');
</script>

<template>
    <ConfirmModal
        :on-confirm="deleteProjectAreas"
        type="info"
        :open="showDeleteAreasConfirm"
        title="Delete all project areas"
        @cancel="() => { showDeleteAreasConfirm = false }"
    >
        <i18n-t
            keypath="areaAndEcosystems.deleteAllAreasConfirm.main"
            tag="p"
        >
            <template v-slot:saveProject>
                <span class="font-bold">{{ t('areaAndEcosystems.deleteAllAreasConfirm.saveProject') }}</span>
            </template>
        </i18n-t>
    </ConfirmModal>
    <TabTemplate
        :title="t('areaAndEcosystems.title')"
        :edit="edit"
    >
        <template #description>
            <i18n-t
                keypath="areaAndEcosystems.description.main"
                tag="p"
            >
                <template v-slot:target2>
                    <a
                        class="underline text-ferm-blue-dark-800 hover:text-ferm-blue-dark-700"
                        href="https://www.cbd.int/gbf/targets/2/"
                        target="_blank"
                    >
                        {{ t('areaAndEcosystems.description.target2') }}
                    </a>
                </template>
            </i18n-t>
            <ul class="list-disc list-inside">
                <li>
                    {{ t('areaAndEcosystems.description.selectAdminAreas') }}
                </li>
                <li>
                    {{ t('areaAndEcosystems.description.uploadPolygons') }}
                </li>
                <li>
                    {{ t('areaAndEcosystems.description.drawOnPlatform') }}
                </li>
            </ul>
            <p class="pt-4">
                <i18n-t keypath="areaAndEcosystems.description.typology2">
                    <template v-slot:infoButton>
                        <InfoButton :title="t('areaAndEcosystems.description.moreInformation')">
                            <slot>
                                <AoiViewInfo />
                            </slot>
                        </InfoButton>
                    </template>
                </i18n-t>
            </p>
        </template>
        <template #default>
            <FormGroup :label="t('inputs.committedAreaToRestore.title')">
                <div class="flex gap-8">
                    <div class="flex flex-col gap-1">
                        <NumberInput
                            v-model="store.project.project.targetArea"
                            :edit="edit"
                        />
                        <span class="text-gray-300 text-sm">{{ t('inputs.committedAreaToRestore.area') }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <SelectInput
                            v-model="store.project.project.areaUnits"
                            :options="menus.units"
                            :edit="edit"
                        />
                        <span class="text-gray-300 text-sm">{{ t('inputs.committedAreaToRestore.units') }}</span>
                    </div>
                </div>
                <template #info>
                    {{ t('inputs.committedAreaToRestore.info') }}
                </template>
            </FormGroup>
            <FormGroup :label="`${t('inputs.totalAreaUnderRestoration.title')} [${getMenuSelectedLabel(store.project.project.areaUnits, menus.units)}]`">
                <NumberInput
                    :edit="edit"
                    v-model="store.project.project.areaUnderRestoration"
                />
            </FormGroup>
            <div class="py-6">
                <div
                    v-if="edit || store.project.project.countries?.length > 0"
                    class="text-sm italic text-gray-700 mb-1.5"
                >
                    {{ t('areaAndEcosystems.countriesInfo') }}
                </div>
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
                            <option value="">
                                {{ t('inputs.aoi.addCountry') }}
                            </option>
                            <option
                                v-for="country in countries"
                                :value="country.iso2"
                            >
                                {{ country.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <AreasManager
                    v-model="store.projectAreas"
                    :edit="edit"
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
                    :totalArea="store.project.project.areaUnderRestoration"
                    :areaUnits="store.project.project.areaUnits"
                />
                <MultiInputPassive
                    :edit="edit"
                    :numbering="(n, v) => 'n'"
                    :ids="store.project.project.countries"
                    :input-component="paAndTraditionalTerritoriesComponent"
                    v-model="store.project.paAndTraditionalTerritories"
                />
            </div>
        </template>
    </TabTemplate>
    <!-- <pre>{{JSON.stringify(store.projectAreas, null, 2)}}</pre> -->
</template>
