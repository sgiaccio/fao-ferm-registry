<script setup lang="ts">
import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

// import { iucnEcosystems } from '@/components/project/menus';

import TabTemplate from '../TabTemplate.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
// import { getPolygonZonalStats } from '@/firebase/functions';
// import { CalculatorIcon } from '@heroicons/vue/20/solid';


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

// async function getStats(areaUuid: string, stats: string) {
//     const results = await getPolygonZonalStats(areaUuid, stats);
//     console.log(results.statisticResults.years.filter((y: any) => y.data.length));
// }
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
<!--                            <button type="button"-->
<!--                                    @click="getStats(area[Object.keys(area)[0]].uuid, 'IUCN_Ecosystems')"-->
<!--                                    class="bg-gray-100 relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 ml-5">-->
<!--                                <CalculatorIcon class="-ml-0.5 h-5 w-5 text-gray-400"-->
<!--                                                aria-hidden="true" />-->
<!--                                Get stats-->
<!--                            </button>-->
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

