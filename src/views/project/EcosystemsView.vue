<script setup lang="ts">
import { computed, reactive } from 'vue';

import { ListBulletIcon } from '@heroicons/vue/20/solid';

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

    const key = Object.keys(store.projectAreas[0])[0];
    const ecosystems = store.projectAreas[0][key].ecosystems;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            area[key].ecosystems = ecosystems;
        }
    });
}

function getAreaValue(area: any) {
    return area[Object.keys(area)[0]];
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

const areaEcosystemLoading = reactive<boolean[]>([]);
const anyAreaEcosystemLoading = computed(() => areaEcosystemLoading.some((l) => l));

async function getAreaBiomeStats(i: number) {
    const area = store.projectAreas[i];
    const areaValue = getAreaValue(area);
    try {
        // check if there are already ecosystems for that area
        if (!areaValue.ecosystems?.length || confirm('Are you sure you want to overwrite the existing ecosystems?')) {
            areaEcosystemLoading[i] = true;
            areaValue.ecosystems = await getBiomeStats(area);
        }
    } catch (e) {
        alert('An error occurred while fetching the ecosystems for this area.');
        console.error(e);
    } finally {
        areaEcosystemLoading[i] = false;
    }
}

async function getAllAreasBiomeStats() {
    const areas = store.projectAreas;

    // check if any area already has ecosystems
    const askConfirm = areas.some((area) => {
        const areaValue = getAreaValue(area);
        return areaValue.ecosystems?.length;
    });

    if (askConfirm && !confirm('Are you sure you want to overwrite the existing ecosystems?')) return;

    const promises = areas.map((area) => getBiomeStats(area));

    const errors: string[] = [];
    let completedPromises = 0;

    promises.forEach(async (p, i) => {
        try {
            areaEcosystemLoading[i] = true;
            const ecosystems = await p;
            const areaValue = getAreaValue(areas[i]);
            areaValue.ecosystems = ecosystems;
        } catch (e) {
            errors.push(`An error occurred while fetching the ecosystems for area n. ${i + 1}`);
            console.error(e);
        } finally {
            areaEcosystemLoading[i] = false;
            completedPromises++;
            
            // Check if all promises are completed
            if (completedPromises === promises.length) {
                if (errors.length) {
                    alert(errors.join('\n'));
                }
            }
        }
    });
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
                 class="flex flex-col gap-y-4 pt-6">
                <button type="button"
                        :disabled="anyAreaEcosystemLoading"
                        @click="() => getAllAreasBiomeStats()"
                        :class="[anyAreaEcosystemLoading ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 hover:bg-ferm-blue-dark-200 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300']">
                    <ListBulletIcon class="-ml-0.5 h-5 w-5 text-gray-400"
                                    aria-hidden="true" />
                    Get ecosystems for all areas
                </button>
                <div v-for="(area, i) in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                            Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName
                                  }}</span>
                        </div>
                        <div v-if="edit">
                            <button v-if="i === 0 && store.projectAreas.length > 1"
                                    type="button"
                                    class="rounded bg-indigo-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    @click="applyToAll">
                                Apply to all
                            </button>
                            <button type="button"
                                    :disabled="areaEcosystemLoading[i]"
                                    @click="() => getAreaBiomeStats(i)"
                                    :class="[areaEcosystemLoading[i] ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 hover:bg-ferm-blue-dark-200 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300']">
                                <ListBulletIcon v-if="!areaEcosystemLoading[i]"
                                                class="-ml-0.5 h-5 w-5 text-gray-400"
                                                aria-hidden="true" />
                                <ButtonWait v-else />
                                Get ecosystems in this area
                            </button>
                        </div>
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

