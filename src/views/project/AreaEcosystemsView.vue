<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';

import { ListBulletIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/vue/20/solid';

import ButtonWait from '@/components/ButtonWait.vue';

// import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

// import FormGroup from '@/components/inputs/FormGroup.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';

import { getPolygonZonalStats } from '@/firebase/functions';



const props = withDefaults(defineProps<{
    edit?: boolean,
    area: any
    index: number
    nAreas: number
}>(), {
    edit: true
});

const menus = useMenusStore().menus;

const applyToAll = inject('applyToAll', () => { });


// check what area was changed by the user
function watchEcosystemsChangeInArea() {
    return watch(() => props.area.ecosystems, (newValue, oldValue) => {
        if (newValue !== oldValue) {
            areaBiomesLoadingStatus.value = 'idle';
        }
    });
}

let unwatcher = watchEcosystemsChangeInArea()

function hasUuid(area: any) {
    return !!area.uuid
}
// function getAreaValue(area: any) {
//     return area[getAreaType(area)];
// }

async function getBiomeStats(area: any) {
    const areaValue = area;
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
const areaBiomesLoadingStatus = ref<Status>('idle');


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

const groupedBiomes = computed(() => {
    const areaBiomes = props.area.ecosystems;
    if (areaBiomes && areaBiomes?.length) {
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

async function getAreaBiomeStats() {
    // Stop watching, the watcher is only supposed to watch when it's the user that changes the ecosystems
    unwatcher();

    const areaValue = props.area;
    try {
        // check if there are already ecosystems for that area
        if (!areaValue.ecosystems?.length || confirm('Are you sure you want to overwrite the existing biomes?')) {
            areaBiomesLoadingStatus.value = 'loading';
            const newBiomes = await getBiomeStats(areaValue);
            areaValue.ecosystems = newBiomes;
            // if (confirm(`Are you sure you want to apply this ecosystem to the area?: ${newBiomes.join(', ')}`)) {
            //     store.projectAreas.forEach((area, j) => {
            //         const type = getAreaType(area);
            //         if (j !== i) {
            //             area[type].ecosystems = newBiomes;
            //         }
            //     });
            // }
            areaBiomesLoadingStatus.value = 'success';
        }
    } catch (e) {
        alert('An error occurred while fetching the biomes.');
        console.error(e);
        areaBiomesLoadingStatus.value = 'error';
    } finally {
        // Start watching again for user's changes
        unwatcher = watchEcosystemsChangeInArea;
    }
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

function deleteOption(area: any, biome: string) {
    const areaValue = area;
    areaValue.ecosystems = areaValue.ecosystems?.filter((e: string) => e !== biome);
}

function handleBeforeLeave(el: any) {
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

function handleLeave(el: any, done: () => void) {
    // Start the leave transition by setting opacity to 0
    el.style.opacity = 0;
    // Wait for 3s before calling the 'done' callback
    setTimeout(() => done(), 300);
}

function handleAfterLeave(el: any) {
    // console.log("After leave:", el);
    // No need to check opacity as the element should be gone
}

</script>

<template>
    <div class="flex flex-col pt-6 mb-6">
        <!-- class="border-2 px-3 py-2 rounded-lg border-gray-300"> -->
        <!-- <div class="flex flex-row my-3"> -->
        <template v-if="edit">
            <button v-if="hasUuid(area)"
                    type="button"
                    :disabled="areaBiomesLoadingStatus === 'loading' || areaBiomesLoadingStatus === 'success'"
                    @click="getAreaBiomeStats"
                    :class="[areaBiomesLoadingStatus === 'loading' ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 mb-4 mt-2 text-sm font-semibold ring-1 ring-inset ring-gray-300', ['idle', 'error'].includes(areaBiomesLoadingStatus) ? 'hover:bg-ferm-blue-dark-200' : '']">
                <ListBulletIcon v-if="areaBiomesLoadingStatus === 'idle'"
                                class="-ml-0.5 h-5 w-5 text-gray-400"
                                aria-hidden="true" />
                <ButtonWait v-if="areaBiomesLoadingStatus === 'loading'" />
                <ExclamationTriangleIcon v-if="areaBiomesLoadingStatus === 'error'"
                                         class="-ml-0.5 h-5 w-5 text-red-600"
                                         aria-hidden="true" />
                <CheckCircleIcon v-if="areaBiomesLoadingStatus === 'success'"
                                 class="-ml-0.5 h-5 w-5 text-green-600"
                                 aria-hidden="true" />
                Get biomes in this area
            </button>

            <div class="flex flex-row items-center w-full">
                <div class="flex-grow font-bold text-lg">IUCN Global Ecosystem Typology 2.0 - Biomes</div>
                <button v-if="index === 0 && nAreas > 1"
                        type="button"
                        :disabled="!area.ecosystems?.length && nAreas > 1"
                        :class="[!area.ecosystems?.length ? 'bg-gray-100 text-gray-400' : 'bg-ferm-blue-dark-100 hover:bg-ferm-blue-dark-200 text-gray-900', 'relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ml-4']"
                        @click="applyToAll">
                    Apply to all
                </button>
            </div>
        </template>
        <!-- </div> -->
        <TransitionGroup v-if="area.ecosystems?.length"
                         name="list"
                         tag="div"
                         class="grid grid-cols-3 gap-3 mb-4 text-xs"
                         @before-leave="handleBeforeLeave"
                         @leave="handleLeave"
                         @after-leave="handleAfterLeave">
            <div v-for="realm in groupedBiomes"
                 :key="realm.realm"
                 :style="`background-color: ${realms.find(r => r.value === realm.realm)?.color};border-color: ${realms.find(r => r.value === realm.realm)?.borderColor};`"
                 class="basis-1/3 rounded-lg px-2 py-2 font-sm flex flex-col gap-y-2 border-2">

                <span class="text-xm font-medium text-white">{{ (realms.find(r => r.value === realm.realm))?.label }}</span>
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
                       v-model="area.ecosystems"
                       :options="menus.iucnEcosystems"
                       :expandLevel="0"
                       :showSelection="false" />
    </div>
    <!-- <div v-else-if="edit"
         class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
        <router-link class="text-blue-400 underline hover:text-blue-600"
                     :to="{ path: 'area' }">Area tab
        </router-link>
    </div>
    <div v-else>
        <div class="text-lg italic mt-6 text-gray-600">None selected</div>
    </div> -->
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
