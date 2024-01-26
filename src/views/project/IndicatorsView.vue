<script setup lang="ts">
import { ref, watch } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

import { roundToPrecisionAsString } from '@/lib/util';

import { GoalIndicator } from '@/lib/auroraIndicators';

import IndicatorsList from './IndicatorsList.vue';
import CustomIndicatorsList from './CustomIndicatorsList.vue';

import LabelFormGroup from '@/components/inputs/base/LabelFormGroup.vue';


const store = useProjectStore();
const menus = useMenusStore().menus;

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const areaValue: any = Object.values(store.projectAreas[0])[0];
    const gefIndicator = areaValue.gefIndicator;
    const goalIndicators = areaValue.goalIndicators;

    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            const areaToChange: any = Object.values(area)[0];
            if (gefIndicator) {
                areaToChange.gefIndicator = gefIndicator;
            }
            if (goalIndicators && goalIndicators.length) {
                areaToChange.goalIndicators = goalIndicators.map(i => ({ indicator: i.indicator.clone() }));
            }
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
ref(new Array(store.projectAreas.length).fill(new Map()));
function isSelected(area: any, indicator: any) {
    const indicators = Object.values(area)[0]?.goalIndicators;
    if (!indicators) return false;
    return indicators.some(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return t.equals(indicator);
        } catch (error) {
            console.error(error);
            return false;
        }
    });
}
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
                       class="text-blue-600 underline hover:text-blue-500">link</a>.
                </p>
            </template>
            <template v-else>
                <p>
                    The progress of restoration efforts can be tracked using indicators and their corresponding metrics. Initiative-level indicators for monitoring primarily terrestrial restoration efforts are from the publication: "The Road to Restoration" (FAO and WRI, 2019) also available through the AURORA tool (<a target="_blank"
                       class="text-ferm-blue-dark-700 underline hover:text-ferm-blue-dark-500"
                       href="https://www.auroramonitoring.org">https://www.auroramonitoring.org</a>).
                </p>
                <p class="pt-4">
                    If you do not know or have not yet decided which indicators you will need in your restoration initiative, use the AURORA tool and follow the process. In the future you will be able to import the selected indicators from the AURORA tool into the FERM registry.
                </p>
                <p class="pt-4">
                    If you already know the indicators needed to monitor your restoration initiative, please select them from the drop-down list in this section.
                </p>
                <p class="pt-4">
                    If the indicator needed to monitor your initiative is not available in this list, please insert your custom indicator by providing a short name for the indicator and the measurement unit.
                </p>
                <p class="pt-4">
                    The initiative level indicators contribute to SDGs, emphasizing the interconnectedness of restoration efforts with broader sustainable development objectives (FAO and UNEP, 2022).
                </p>
                <p class="pt-4">
                    References:
                </p>
                <p class="pt-1">
                    FAO and WRI. 2019. The Road to Restoration: A Guide to Identifying Priorities and Indicators for Monitoring Forest and Landscape Restoration. Rome, Washington, DC.
                </p>
                <p class="pt-4">
                    FAO and UNEP. 2022. Global indicators for monitoring ecosystem restoration &mdash; A contribution to the UN Decade on Ecosystem Restoration. Rome, FAO. <a target="_blank"
                       class="text-ferm-blue-dark-700 underline hover:text-ferm-blue-dark-500"
                       href="https://doi.org/10.4060/cb9982en">https://doi.org/10.4060/cb9982en</a>
                </p>
            </template>
        </template>
        <template #default>
            <div class="pt-8"
                 v-if="store.project.reportingLine !== 'GEF'">
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`" />
                <div v-if="store.projectAreas?.length"
                     class="flex flex-col gap-y-4">
                    <div v-for="( area, i ) in store.projectAreas"
                         class="border-2 px-3 pt-2 pb-3 rounded-lg border-gray-300">
                        <!-- <pre>{{ JSON.stringify(area[Object.keys(area)[0]].goalIndicators, null, 2) }}</pre> -->

                        <div class="flex flex-row my-3">
                            <div class="text-gray-500 text-lg font-bold mb-2 flex-grow">
                                Area {{ i + 1 }}<span class="text-black"
                                      v-if="area[Object.keys(area)[0]].siteName">: {{ area[Object.keys(area)[0]].siteName }}
                                </span>
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

                        <IndicatorsList v-model="area[Object.keys(area)[0]].goalIndicators"
                                        :edit="edit" />

                        <CustomIndicatorsList v-model="area[Object.keys(area)[0]].customIndicators"
                                              :edit="edit"
                                              class="mt-4" />
                    </div>
                </div>
                <div v-else-if="edit"
                     class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                    <router-link class="text-blue-400 underline hover:text-blue-600"
                                 :to="{ path: 'area' }">Area tab
                    </router-link>
                </div>
                <div v-else>
                    <div class="text-lg italic text-gray-600">None selected</div>
                </div>
            </div>


            <!-- GEF -->
            <div v-else
                 class="pt-8">
                <LabelFormGroup label="Total area of land achieved (spatially explicit format)"
                                :value="`${roundToPrecisionAsString(store.polygonsArea(), 2)} Ha`" />

                <!-- Area by indicator -->
                <div class="mb-6">
                    <!-- <h3 class="text-xl font-semibold leading-6 text-gray-900">Area by indicator</h3> -->
                    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div v-for="  [indicator, area]   in   store.areaByGefIndicator()  "
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
                    <div v-for="(area, i) in store.projectAreas  "
                         class="border-2 rounded-lg border-gray-300 divide-y-2">
                        <div class="flex flex-row px-3 py-5">
                            <div class="text-gray-500 text-lg font-bold flex-grow">
                                Area {{ i + 1 }}<span class="text-black"
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
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl font-bold mb-3">GEF indicators</h1>
                            <RecursiveRadio v-model="area[Object.keys(area)[0]].gefIndicator"
                                            :options="menus.gefIndicators"
                                            :edit="edit" />
                        </div>
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl font-bold mb-3">Project indicators</h1>
                            <IndicatorsList v-model="area[Object.keys(area)[0]].goalIndicators"
                                            :edit="edit" />
                            <CustomIndicatorsList v-model="area[Object.keys(area)[0]].customIndicators"
                                                  :edit="edit"
                                                  class="mt-4 bg-red-50" />
                        </div>

                    </div>
                </div>
                <div v-else-if="edit"
                     class="text-red-600 font-bold text-lg pb-4 mt-6">Please enter at least one area in the
                    <router-link class="text-blue-400 underline hover:text-blue-600"
                                 :to="{ path: 'area' }">Area tab
                    </router-link>
                </div>
                <div v-else>
                    <div class="text-lg italic text-gray-600">None selected</div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
