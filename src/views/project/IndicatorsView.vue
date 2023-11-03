<script setup lang="ts">
import { watch } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

// import { indicators, gefIndicators } from '@/components/project/menus';
import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';
import RecursiveMenu from '@/components/inputs/base/RecursiveMenu.vue';
import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

import { roundToPrecisionAsString } from '@/lib/util';


const store = useProjectStore();
const menus = useMenusStore().menus;

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const indicator = store.projectAreas[0][key].gefIndicator;
    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            area[key].gefIndicator = indicator;
        }
    });
}

// Delete restorationType and tenureStatus for GEF3 indicators. This should be done in the store, but will be done here for now.
watch(() => store.projectAreas, areas => areas.forEach(area => {
    const areaValue = Object.values(area)[0];
    if (!areaValue.gefIndicator?.startsWith('GEF3')) {
        delete areaValue.restorationType;
        delete areaValue.tenureStatus;
    }
}), { deep: true });
</script>

<template>
    <TabTemplate title="Indicators">
        <template #description>
            <template v-if="store.project.reportingLine === 'GEF'">
                <p>
                    Indicators are selected to monitor project progress. The methodology proposed to report and monitor the achievement of GEF commitments including restoration (in ha of land) in FERM is through GEF Core Indicators.
                </p>
                <p>
                    Details on GEF Core Indicators can be found under this
                    <a href="https://www.thegef.org/sites/default/files/documents/2022-09/Results_Framework_Guidelines_2022_06_30.pdf"
                       target="_blank"
                       class="text-blue-600 dark:text-blue-100 underline hover:text-blue-500 dark:hover:text-blue-200">link</a>.
                </p>
            </template>
            <template v-else>
                <p>
                    Indicators are selected to monitor ecosystem restoration progress. The list of global indicators for monitoring ecosystem restoration is based on a compilation of >5,000 indicators found on international, regional, and national frameworks. More frequently used indicators in this compilation have been grouped under the same topic category and one final indicator representing all of them has been formulated (<a href="https://www.fao.org/publications/card/en/c/CB9982EN"
                       target="_blank"
                       class="text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 underline hover:text-ferm-blue-dark-500 dark:hover:text-ferm-blue-dark-300">https://www.fao.org/publications/card/en/c/CB9982EN</a>).
                </p>
                <p class="pt-4">
                    You can select several indicators from this list to monitor your restoration project. You are advised to select up to 10 indicators by project.
                </p>
            </template>
        </template>
        <template #default>
            <!-- hide if GEF -->
            <div v-if="store.project.reportingLine !== 'GEF'"
                 class="pt-6 pb-6">
                <h1 class="text-2xl dark:text-zinc-300 font-bold mb-3">SDG indicators</h1>
                <RecursiveMenu :edit="edit"
                               v-model="store.project.indicators"
                               :options="menus.indicators"
                               :expandLevel="0" />

            </div>

            <!-- hide if not GEF -->
            <div class="pt-8"
                 v-if="store.project.reportingLine === 'GEF'">
                <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">GEF indicators</h1>
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`" />

                <!-- Area by indicator -->
                <div v-if="store.project.reportingLine === 'GEF'"
                     class="mb-6">
                    <!-- <h3 class="text-xl font-semibold leading-6 text-gray-900">Area by indicator</h3> -->
                    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div v-for=" [indicator, area]  in  store.areaByGefIndicator() "
                             :key="indicator"
                             class="overflow-hidden rounded-lg bg-gray-100 px-4 py-5 shadow sm:p-6 flex flex-col">
                            <dt class="flex-grow text-sm font-medium text-gray-500">
                                {{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}
                            </dt>
                            <dd class="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
                                {{ area.toFixed(2) }} Ha
                            </dd>
                        </div>
                    </dl>
                </div>

                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="( area, i ) in  store.projectAreas "
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
                            </div>
                        </div>
                        <RecursiveRadio v-model="area[Object.keys(area)[0]].gefIndicator"
                                        :options="menus.gefIndicators"
                                        :edit="edit" />
                    </div>
                </div>
                <div v-else-if="edit"
                     class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                    <router-link class="text-blue-400 underline hover:text-blue-600"
                                 :to="{ path: 'area' }">Area tab
                    </router-link>
                </div>
                <div v-else>
                    <div class="text-lg italic text-gray-600 dark:text-gray-400">None selected</div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
