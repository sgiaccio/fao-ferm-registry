<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { ListBulletIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/vue/20/solid';

import ButtonWait from '@/components/ButtonWait.vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import TabTemplate from '../TabTemplate.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';

import { getPolygonZonalStats } from '@/firebase/functions';


const store = useProjectStore();
const menus = useMenusStore().menus;

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this ecosystem to all areas? Your current selections will be overwritten.')) return;

    const ecosystems = getAreaValue(store.projectAreas[0]).ecosystems;
    if (!ecosystems?.length) {
        alert('Please select ecosystems for the first area first.');
        return;
    }
    store.projectAreas.forEach((area, i) => {
        const type = getAreaType(area);
        if (i > 0) {
            area[type].ecosystems = ecosystems;
        }
    });
}

function getAreaType(area: any) {
    return Object.keys(area)[0];
}
function getAreaValue(area: any) {
    return area[getAreaType(area)];
}

async function getBiomeStats(area: any) {
    const areaValue = getAreaValue(area);
    const areaUuid = areaValue.uuid;

    const results: any = await getPolygonZonalStats(areaUuid, 'IUCN_Biomes');
    const ecosystems = results.statisticResults.years.filter((y: any) => y.data.length)
        // year is actually the ecosystem
        .map((e: any) => e.year)
        // get the substrings before ' - '
        .map((e: any) => e.substring(0, e.indexOf(' - ')));
    // filter out the ones that are not in the IUCN ecosystems

    // flatten the IUCN ecosystems is calculated each time, optimize this
    const flattenedIucnEcosystems: string[] = [];
    (function flatten(ecosystems_) {
        ecosystems_.forEach((e: any) => {
            if (e.items) {
                flatten(e.items);
            } else if (e.value) {
                flattenedIucnEcosystems.push(e.value);
            }
        });
    })(menus.iucnEcosystems);

    // Filter out the ones that are not in the IUCN ecosystems
    return ecosystems.filter((e: any) => flattenedIucnEcosystems.includes(e));
}

const loadAllAreasBiomesButtonPressed = ref(false);
type Status = 'idle' | 'loading' | 'success' | 'error';
const areaBiomesLoadingStatus = reactive<Status[]>(new Array(store.projectAreas.length).fill('idle'));
const anyAreaBiomesLoading = computed(() => areaBiomesLoadingStatus.some(l => l === 'loading'));
const anyAreaBiomesError = computed(() => areaBiomesLoadingStatus.some(l => l === 'error'));
const allAreaBiomesSuccess = computed(() => areaBiomesLoadingStatus.every(l => l === 'success'));
const anyPolygonArea = computed(() => store.projectAreas.some(area => ['upload', 'draw'].includes(getAreaType(area))));
const loadingAllAreasBiomes = ref(false);


async function getAreaBiomeStats(i: number) {
    const area = store.projectAreas[i];
    const areaValue = getAreaValue(area);
    try {
        // check if there are already ecosystems for that area
        if (!areaValue.ecosystems?.length || confirm('Are you sure you want to overwrite the existing ecosystems?')) {
            areaBiomesLoadingStatus[i] = 'loading';
            areaValue.ecosystems = await getBiomeStats(area);
            areaBiomesLoadingStatus[i] = 'success';
        }
    } catch (e) {
        alert('An error occurred while fetching the ecosystems for this area.');
        console.error(e);
        areaBiomesLoadingStatus[i] = 'error';
    }
}

async function getAllAreasBiomeStats() {
    loadAllAreasBiomesButtonPressed.value = true;
    loadingAllAreasBiomes.value = true;

    const areas = store.projectAreas;

    // Initialize areaEcosystemLoadingStatus with 'idle'
    areaBiomesLoadingStatus.length = areas.length;
    areaBiomesLoadingStatus.fill('loading');

    // Check if any area already has ecosystems
    const askConfirm = areas.some((area) => {
        const areaValue = getAreaValue(area);
        return areaValue.ecosystems?.length;
    });

    if (askConfirm && !confirm('Are you sure you want to overwrite the existing ecosystems?')) return;

    const filteredAreas = areas.filter(area => ['upload', 'draw'].includes(getAreaType(area)));
    const chunkSize = 5; // Number of areas to process at a time
    const errors: string[] = [];

    for (let i = 0; i < filteredAreas.length; i += chunkSize) {
        const chunk = filteredAreas.slice(i, i + chunkSize);
        const promises = chunk.map((area) => getBiomeStats(area));

        await Promise.all(promises.map((p, j) => {
            return new Promise(async (resolve) => {
                const index = i + j;

                try {
                    areaBiomesLoadingStatus[index] = 'loading';
                    const ecosystems = await p;
                    const areaValue = getAreaValue(filteredAreas[index]);
                    areaValue.ecosystems = ecosystems;
                    areaBiomesLoadingStatus[index] = 'success';
                } catch (e) {
                    areaBiomesLoadingStatus[index] = 'error';
                    errors.push(`An error occurred while fetching the ecosystems for area n. ${index + 1}`);
                    console.error(e);
                } finally {
                    resolve(null);
                }
            });
        }));
    }

    // Check if there were any errors
    if (errors.length) {
        alert(errors.join('\n'));
    }
    loadingAllAreasBiomes.value = false;
}

</script>

<template>
    <TabTemplate title="Ecosystems">
        <template #description>
            <p>
                It is crucial to identify the ecosystems that your initiative is restoring. If spatially explicit
                information of an area is provided and represents the entirety of the area under restoration (i.e.
                polygons of the areas are provided), the ecosystems can be calculated based on a map overlay. If only
                tabular data of an area is provided, we kindly ask you to select the corresponding ecosystems using
                biomes of the IUCN Global Ecosystem Typology 2.0 (Keith et al., 2022).
            </p>
            <p>
                There are different ecosystem classifications. The IUCN Global Ecosystem Typology 2.0 is the outcome of
                critical review and input by an extensive international network of ecosystem scientists, containing
                profiles for 25 biomes and 108 ecosystem functional groups.
            </p>
        </template>
        <template #default>
            <div v-if="store.projectAreas?.length"
                 class="flex flex-col gap-y-4 pt-6 mb-6">
                <div class="flex-shrink justify-self-end ml-auto">
                    <button v-if="anyPolygonArea && edit"
                            type="button"
                            :disabled="anyAreaBiomesLoading"
                            @click="() => getAllAreasBiomeStats()"
                            :class="[anyAreaBiomesLoading ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 hover:bg-ferm-blue-dark-200 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 flex-shrink']">
                        <ButtonWait v-if="loadingAllAreasBiomes" />
                        <ExclamationTriangleIcon v-else-if="anyAreaBiomesError && loadAllAreasBiomesButtonPressed"
                                                 class="-ml-0.5 h-5 w-5 text-red-600"
                                                 aria-hidden="true" />
                        <CheckCircleIcon v-else-if="allAreaBiomesSuccess"
                                         class="-ml-0.5 h-5 w-5 text-green-600"
                                         aria-hidden="true" />
                        <ListBulletIcon v-else
                                        class="-ml-0.5 h-5 w-5 text-gray-400"
                                        aria-hidden="true" />


                        Get ecosystems in all polygon areas
                    </button>
                </div>
                <div v-for="(area, i) in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                            Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName
                                  }}</span>
                        </div>
                        <template v-if="edit">
                            <button v-if="['upload', 'draw'].includes(getAreaType(area))"
                                    type="button"
                                    :disabled="areaBiomesLoadingStatus[i] === 'loading' || areaBiomesLoadingStatus[i] === 'success'"
                                    @click="() => getAreaBiomeStats(i)"
                                    :class="[areaBiomesLoadingStatus[i] === 'loading' ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300', ['idle', 'error'].includes(areaBiomesLoadingStatus[i]) ? 'hover:bg-ferm-blue-dark-200' : '']">
                                <ListBulletIcon v-if="areaBiomesLoadingStatus[i] === 'idle'"
                                                class="-ml-0.5 h-5 w-5 text-gray-400"
                                                aria-hidden="true" />
                                <ButtonWait v-if="areaBiomesLoadingStatus[i] === 'loading'" />
                                <ExclamationTriangleIcon v-if="areaBiomesLoadingStatus[i] === 'error'"
                                                         class="-ml-0.5 h-5 w-5 text-red-600"
                                                         aria-hidden="true" />
                                <CheckCircleIcon v-if="areaBiomesLoadingStatus[i] === 'success'"
                                                 class="-ml-0.5 h-5 w-5 text-green-600"
                                                 aria-hidden="true" />
                                Get ecosystems in this area
                            </button>
                            <button v-if="i === 0 && store.projectAreas.length > 1"
                                    type="button"
                                    :disabled="!getAreaValue(area).ecosystems?.length"
                                    :class="[!getAreaValue(area).ecosystems?.length ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 hover:bg-ferm-blue-dark-200 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ml-4']"
                                    @click="applyToAll">
                                Apply to all
                            </button>
                        </template>
                    </div>
                    <RecursiveMenu :edit="edit"
                                   v-model="area[Object.keys(area)[0]].ecosystems"
                                   :options="menus.iucnEcosystems"
                                   :expandLevel="0" />
                </div>
            </div>
            <div v-else-if="edit"
                 class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                <router-link class="text-blue-400 underline hover:text-blue-600"
                             :to="{ path: 'area' }">Area tab
                </router-link>
            </div>
            <div v-else>
                <div class="text-lg italic mt-6 text-gray-600 dark:text-gray-400">None selected</div>
            </div>
        </template>
    </TabTemplate>
</template>

