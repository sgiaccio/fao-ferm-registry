<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

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

// check what area was changed by the user
function watchEcosystemsChangeInArea(i: number) {
    const area = store.projectAreas[i];
    return watch(() => getAreaValue(area).ecosystems, (newValue, oldValue) => {
        if (newValue !== oldValue) {
            areaBiomesLoadingStatus[i] = 'idle';
        }
    });
}
let unwatchers = store.projectAreas.map((area, i) => {
    return watchEcosystemsChangeInArea(i);
});

//     loadAllAreasBiomesButtonPressed.value = false;
//     areaBiomesLoadingStatus[];
// });

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

// const loadAllAreasBiomesButtonPressed = ref(false);
type Status = 'idle' | 'loading' | 'success' | 'error';
const areaBiomesLoadingStatus = reactive<Status[]>(new Array(store.projectAreas.length).fill('idle'));
// const anyAreaBiomesLoading = computed(() => areaBiomesLoadingStatus.some(l => l === 'loading'));
// const anyAreaBiomesError = computed(() => areaBiomesLoadingStatus.some(l => l === 'error'));
// const allAreaBiomesSuccess = computed(() => areaBiomesLoadingStatus.every(l => l === 'success'));
// const anyPolygonArea = computed(() => store.projectAreas.some(area => ['upload', 'draw'].includes(getAreaType(area))));
// const loadingAllAreasBiomes = ref(false);


const realms = [
    { value: 'T', label: 'Terrestrial realm', color: '#1f77b4', borderColor: '#0d4d8a' },
    { value: 'M', label: 'Marine realm', color: '#ff7f0e', borderColor: '#cc6608' },
    { value: 'F', label: 'Freshwater realm', color: '#2ca02c', borderColor: '#1e6a1e' },
    { value: 'S', label: 'Subterranean realm', color: '#d62728', borderColor: '#9a1c1c' },
    { value: 'MT', label: 'Marine-Terrestrial realm', color: '#9467bd', borderColor: '#6b4c8a' },
    { value: 'SF', label: 'Subterranean-Freshwater realm', color: '#8c564b', borderColor: '#623c34' },
    { value: 'FM', label: 'Freshwater-Marine realm', color: '#e377c2', borderColor: '#b25399' },
    { value: 'MFT', label: 'Marine-Freshwater-Terrestrial realm', color: '#7f7f7f', borderColor: '#595959' },
    { value: 'SM', label: 'Subterranean-Marine realm', color: '#bcbd22', borderColor: '#8a8c16' },
    { value: 'TF', label: 'Terrestrial-Freshwater realm', color: '#17becf', borderColor: '#11a3ac' }
];

const groupedBiomesByArea = computed(() => {
    const biomesByArea = store.projectAreas.map(a => getAreaValue(a).ecosystems);
    return biomesByArea.map(areaBiomes => {
        if (areaBiomes?.length) {
            const areaBiomesByRealm = areaBiomes.reduce((acc: any, curr: string) => {
                // Realm is the first characters before the first digit
                const realm = curr.substring(0, curr.search(/\d/));
                if (!acc[realm]) {
                    acc[realm] = [];
                }
                acc[realm].push(curr);
                return acc;
            }, {});

            const areaBiomesByRealmArr = Object.entries(areaBiomesByRealm).map(([realm, biomes]) => ({ realm, biomes }));

            // Sort according to the order in the realms array
            const sortedAreaBiomesByRealmArr = areaBiomesByRealmArr.sort((a, b) => {
                return realms.findIndex(r => r.value === a.realm) > realms.findIndex(r => r.value === b.realm) ? 1 : -1;
            });

            return sortedAreaBiomesByRealmArr;
        } else {
            return [];
        }
    });
});

async function getAreaBiomeStats(i: number) {
    // Stop watching, the watcher is only supposed to watch when it's the user that changes the ecosystems
    unwatchers[i]();

    const area = store.projectAreas[i];
    const areaValue = getAreaValue(area);
    try {
        // check if there are already ecosystems for that area
        if (!areaValue.ecosystems?.length || confirm('Are you sure you want to overwrite the existing biomes?')) {
            areaBiomesLoadingStatus[i] = 'loading';
            await new Promise(r => setTimeout(r, 10000));
            const newBiomes = await getBiomeStats(area);
            areaValue.ecosystems = newBiomes;
            if (confirm(`Are you sure you want to apply this ecosystem to the area?: ${newBiomes.join(', ')}`)) {
                store.projectAreas.forEach((area, j) => {
                    const type = getAreaType(area);
                    if (j !== i) {
                        area[type].ecosystems = newBiomes;
                    }
                });
            }
            areaBiomesLoadingStatus[i] = 'success';
        }
    } catch (e) {
        alert('An error occurred while fetching the biomes.');
        console.error(e);
        areaBiomesLoadingStatus[i] = 'error';
    }

    // Start watching again for user's changes
    unwatchers[i] = watchEcosystemsChangeInArea(i);
}

function findBiomeLabel(biome: string, biomes: any = menus.iucnEcosystems): string | null {
    for (const item of biomes) {
        if (item.value === biome) {
            return item.label;
        }
        if (item.items) {
            const foundLabel = findBiomeLabel(biome, item.items);
            if (foundLabel) {
                return foundLabel;
            }
        }
    }
    return null;  // Return null if the biome is not found
}

// async function getAllAreasBiomeStats() {
//     // Stop watching, the watcher is only supposed to watch when it's the user that changes the ecosystems
//     unwatchers.forEach(u => u());

//     const areas = store.projectAreas;

//     // Check if any area already has ecosystems
//     const askConfirm = areas.some((area) => {
//         const areaValue = getAreaValue(area);
//         return areaValue.ecosystems?.length;
//     });

//     if (askConfirm && !confirm('Are you sure you want to overwrite the existing ecosystems?')) return;

//     loadAllAreasBiomesButtonPressed.value = true;
//     loadingAllAreasBiomes.value = true;
//     areaBiomesLoadingStatus.fill('loading');

//     const filteredAreas = areas.filter(area => ['upload', 'draw'].includes(getAreaType(area)));
//     const chunkSize = 5; // Number of areas to process at a time
//     const errors: string[] = [];

//     for (let i = 0; i < filteredAreas.length; i += chunkSize) {
//         const chunk = filteredAreas.slice(i, i + chunkSize);
//         const promises = chunk.map((area) => getBiomeStats(area));

//         await Promise.all(promises.map((p, j) => {
//             return new Promise(async (resolve) => {
//                 const index = i + j;

//                 try {
//                     areaBiomesLoadingStatus[index] = 'loading';
//                     const ecosystems = await p;
//                     const areaValue = getAreaValue(filteredAreas[index]);
//                     areaValue.ecosystems = ecosystems;
//                     areaBiomesLoadingStatus[index] = 'success';
//                 } catch (e) {
//                     areaBiomesLoadingStatus[index] = 'error';
//                     errors.push(`An error occurred while fetching the ecosystems for area n. ${index + 1}`);
//                     console.error(e);
//                 } finally {
//                     resolve(null);
//                 }
//             });
//         }));
//     }

//     // Check if there were any errors
//     if (errors.length) {
//         alert(errors.join('\n'));
//     }
//     loadingAllAreasBiomes.value = false;

//     // Start watching again for user's changes
//     unwatchers = store.projectAreas.map((area, i) => {
//         return watchEcosystemsChangeInArea(i);
//     });
// }

function deleteOption(area: any, biome: string) {
    const areaValue = getAreaValue(area);
    areaValue.ecosystems = areaValue.ecosystems?.filter((e: string) => e !== biome);
}


// function handleBeforeLeave(el) {
//   console.log("Before leave:", el);
//   console.log("Opacity before leave:", window.getComputedStyle(el).opacity);
// }
// function handleLeave(el, done) {
//   console.log('handleLeave called');
//   console.log('done:', done);
//   setTimeout(() => {
//     console.log('Calling done after 0.5s');
//     done();
//   }, 500);
// }
function handleBeforeLeave(el) {
    // Ensure the parent is relative
    el.parentNode.style.position = 'relative';

    const rect = el.getBoundingClientRect();
    const parentRect = el.parentNode.getBoundingClientRect();

    // Adjust for any scrolling and parent's position
    const top = rect.top - parentRect.top + el.parentNode.scrollTop;
    const left = rect.left - parentRect.left + el.parentNode.scrollLeft;

    el.style.width = `${rect.width}px`; // set the width explicitly
    el.style.height = `${rect.height}px`; // set the height explicitly
    el.style.position = "absolute";
    el.style.top = top + 'px';
    el.style.left = left + 'px';
}

function handleLeave(el, done) {
    // Start the leave transition by setting opacity to 0
    el.style.opacity = 0;
    // Wait for 3s before calling the 'done' callback
    setTimeout(() => done(), 300);
}

function handleAfterLeave(el) {
    // console.log("After leave:", el);
    // No need to check opacity as the element should be gone
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
            <div v-if="true"
                 class="flex flex-col gap-y-4 pt-6 mb-6">
                <!-- <div class="flex-shrink justify-self-end ml-auto">
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


                        Get biomes in all polygon areas
                    </button>
                </div> -->
                <div v-for="(area, i) in store.projectAreas"
                     class="border-2 px-3 py-2 rounded-lg border-gray-300 dark:border-gray-500">
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                            Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
                                  v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName
                                  }}</span>
                        </div>
                        <template v-if="edit">
                            <button v-if="['upload', 'draw', 'uploadKml'].includes(getAreaType(area))"
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
                                Get biomes in this area
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
                    <TransitionGroup v-if="getAreaValue(area).ecosystems?.length"
                                     name="list"
                                     tag="div"
                                     class="grid grid-cols-3 gap-3 mb-4 text-xs"
                                     @before-leave="handleBeforeLeave"
                                     @leave="handleLeave"
                                     @after-leave="handleAfterLeave">
                        <div v-for="realm in groupedBiomesByArea[i]"
                             :key="realm.realm"
                             :style="`background-color: ${realms.find(r => r.value === realm.realm)?.color};border-color: ${realms.find(r => r.value === realm.realm)?.borderColor};`"
                             class="basis-1/3 rounded-lg px-3 py-3 font-sm flex flex-col gap-y-2 border-2">

                            <span class="text-sm font-bold text-white">{{ (realms.find(r => r.value === realm.realm))?.label }}</span>
                            <div class="flex flex-col gap-y-2">
                                <div v-for="biome in (realm.biomes)"
                                     class="text-gray-800 m-0 flex rounded-md pl-2.5 pr-1 bg-white min-h-7 p-1 border border-stone-800 justify-between items-center">
                                    {{ findBiomeLabel(biome) }}
                                    <div v-if="edit">
                                        <svg @click="deleteOption(area, biome)"
                                             class="ml-0.5 w-5 h-5 text-gray-300 hover:text-gray-400 cursor-pointer"
                                             xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 20 20"
                                             fill="currentColor">
                                            <path fill-rule="evenodd"
                                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                                  clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                    <RecursiveMenu :edit="edit"
                                   v-model="area[Object.keys(area)[0]].ecosystems"
                                   :options="menus.iucnEcosystems"
                                   :expandLevel="0"
                                   :showSelection="false" />
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


<style scoped>
/* For moving elements */
.list-move {
    transition: transform 0.3s ease-in-out;
}

/* For entering elements */
.list-enter-active {
    transition: opacity 0.3s ease-in-out;
}

.list-enter-from {
    opacity: 0;
}

.list-enter-to {
    opacity: 1;
}

/* For leaving elements */
.list-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.list-leave-from {
    opacity: 1;
}

.list-leave-to {
    opacity: 0;
}
</style>
