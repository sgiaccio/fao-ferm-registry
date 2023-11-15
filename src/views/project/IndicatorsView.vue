<script setup lang="ts">
import { ref, watch } from 'vue';

import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

// import { indicators, gefIndicators } from '@/components/project/menus';
import RecursiveRadio from '@/components/inputs/base/RecursiveRadio.vue';

import { roundToPrecisionAsString } from '@/lib/util';

import { sortedGoalIndicators, getGoalColor, groupByGoal, GoalIndicator } from '@/lib/auroraIndicators';

import { ChevronRightIcon, ChevronDownIcon, CheckIcon, TrashIcon } from '@heroicons/vue/20/solid';

import { getSortedIndicatorsAndMonitoring } from '@/lib/util';


import IndicatorsList from './IndicatorsList.vue';

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

// const showGoals = ref(new Map());

const showGoals = ref(new Array(store.projectAreas.length).fill(new Map()));

function toggleGoal(idx: number, goal: string) {
    const newMap = new Map(showGoals.value[idx]);
    newMap.set(goal, !newMap.get(goal));
    showGoals.value[idx] = newMap;
}

function addIndicator(area: any, indicator: any) {
    // check if the indicator was already selected
    if (isSelected(area, indicator)) return;

    const goalIndicator = sortedGoalIndicators.find(i => i.id === indicator.id);

    const areaValue = Object.values(area)[0];
    if (!areaValue.goalIndicators) {
        areaValue.goalIndicators = [];
    }
    areaValue.goalIndicators.push({ indicator: goalIndicator });
}

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

function nSelectedByGoal(area: any, goal: string) {
    const indicators = groupByGoal(sortedGoalIndicators).find(g => g.goal === goal)?.indicators;
    if (!indicators) return 0;
    return indicators.filter(i => isSelected(area, i)).length;
}

const showAreaGoals = ref(new Array(store.projectAreas.length).fill(false));

function toggleAreaGoals(i: number) {
    showAreaGoals.value[i] = !showAreaGoals.value[i];
}

function removeIndicator(area: any, indicator: GoalIndicator) {
    const areaValue = Object.values(area)[0];
    if (!areaValue.goalIndicators) return;

    // look for the indicator to remove
    const toBeRemoved = areaValue.goalIndicators.find(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return t.equals(indicator);
        } catch (error) {
            console.error(error);
            return false;
        }
    });

    console.log(toBeRemoved);

    // check that there are no monitoring years
    if (toBeRemoved?.monitoring?.length) {
        alert('Please remove all monitoring years before removing the indicator.');
        return;
    }

    areaValue.goalIndicators = areaValue.goalIndicators.filter(i => {
        try {
            const t = new GoalIndicator(i.indicator);
            return !t.equals(indicator);
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
                       class="text-blue-600 dark:text-blue-100 underline hover:text-blue-500 dark:hover:text-blue-200">link</a>.
                </p>
            </template>
            <template v-else>
                <p>
                    The progress of restoration efforts can be tracked using indicators and their corresponding metrics. Initiative-level indicators for monitoring primarily terrestrial restoration efforts are from the publication: "The Road to Restoration" (FAO and WRI, 2019) also available through the AURORA tool (<a target="_blank"
                       class="text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 underline hover:text-ferm-blue-dark-500 dark:hover:text-ferm-blue-dark-300"
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
                       class="text-ferm-blue-dark-700 dark:text-ferm-blue-dark-100 underline hover:text-ferm-blue-dark-500 dark:hover:text-ferm-blue-dark-300"
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
                         class="border-2 px-3 pt-2 pb-3 rounded-lg border-gray-300 dark:border-gray-500">
                        <!-- <pre>{{ JSON.stringify(area[Object.keys(area)[0]].goalIndicators, null, 2) }}</pre> -->

                        <div class="flex flex-row my-3">
                            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold mb-2 flex-grow">
                                Area {{ i + 1 }}<span class="text-black dark:text-gray-100"
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

                        <!-- summary of the selected indicators -->
                        <!-- <div class="flex flex-col mb-4 gap-y-1 text-xs font-bold text-white"
                             v-if="area[Object.keys(area)[0]].goalIndicators">
                            <template v-for="goal in getSortedIndicatorsAndMonitoring(area[Object.keys(area)[0]].goalIndicators)">
                                <div v-for="indicator in goal.indicators"
                                     class="rounded px-3 py-2 flex"
                                     :style="`background-color: ${getGoalColor(goal.goal)};`">
                                    <div class="flex-grow">
                                        {{ indicator.indicator.indicator }} &ndash;
                                        {{ indicator.indicator.rg_subtheme }} &ndash;
                                        {{ indicator.indicator.metric }} &ndash;
                                        {{ indicator.indicator.action }}
                                    </div>
                                    <div v-if="edit"
                                         @click="removeIndicator(area, indicator.indicator)"
                                         class="cursor-pointer">
                                        <TrashIcon class="w-4 h-4 cursor-pointer self-center text-black hover:text-red-500" />
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div v-else
                             class="-mt-2 mb-2 text-gray-500">
                            No indicators selected for this area
                        </div>

                        <div v-if="edit"
                             class="shadow-md rounded">
                            <div class="w-full px-2.5 py-2 font-bold text-gray-700 dark:text-gray-200 border-t border-x border-gray-300 cursor-pointer flex gap-0.5 rounded-t hover:bg-gray-100"
                                 :class="[!showAreaGoals[i] ? 'rounded-b border-b' : '']"
                                 @click="() => toggleAreaGoals(i)">
                                <ChevronRightIcon v-if="!showAreaGoals[i]"
                                                  class="inline w-5 h-5 cursor-pointer self-center" />
                                <ChevronDownIcon v-if="showAreaGoals[i]"
                                                 class="inline w-5 h-5 cursor-pointer self-center" />
                                <div class="flex-grow self-center">Add project indicators</div>
                            </div>
                            <template v-if="showAreaGoals[i]">
                                <div v-for="( goal, j ) in  groupByGoal(sortedGoalIndicators)"
                                     class="text-xs -mb-0">
                                    <div class="w-full px-2.5 py-2 font-bold text-white border-t border-y cursor-pointer flex gap-0.5 hover:brightness-110"
                                         :class="[j === groupByGoal(sortedGoalIndicators).length - 1 && !showGoals[i].get(goal.goal) ? 'rounded-b' : '']"
                                         @click="() => toggleGoal(i, goal.goal)"
                                         :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`">
                                        <ChevronRightIcon v-if="!showGoals[i].get(goal.goal)"
                                                          class="inline w-5 h-5 cursor-pointer self-center" />
                                        <ChevronDownIcon v-if="showGoals[i].get(goal.goal)"
                                                         class="inline w-5 h-5 cursor-pointer self-center" />
                                        <div class="flex-grow self-center">{{ goal.goal }}</div>
                                        <div :class="['font-normal', nSelectedByGoal(area, goal.goal) ? '' : 'text-gray-300', 'self-center']">{{ nSelectedByGoal(area, goal.goal) }} selected</div>
                                    </div>

                                    <div v-show="!!showGoals[i].get(goal.goal)"
                                         class="border-x border-b"
                                         :class="j === groupByGoal(sortedGoalIndicators).length - 1 ? 'rounded-b-md' : ''"
                                         :style="`border-color: ${getGoalColor(goal.goal)};`">
                                        <div v-for="indicator  in  goal.indicators"
                                             class="px-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
                                             :style="`border-color: ${getGoalColor(goal.goal, 0.4)}`"
                                             @click="() => addIndicator(area, indicator)">
                                            <div class="flex flex-row">
                                                <div class="flex-grow self-center">
                                                    {{ indicator.indicator }}
                                                    <br>
                                                    {{ indicator.rg_subtheme }} &ndash;
                                                    {{ indicator.metric }} &ndash;
                                                    {{ indicator.action }}
                                                </div>
                                                <div v-if="isSelected(area, indicator)"
                                                     class="text-green-600 font-bold text-lg self-center">
                                                    <CheckIcon class="inline w-5 h-5 cursor" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div> -->
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
                         class="border-2 rounded-lg border-gray-300 dark:border-gray-500 divide-y-2">
                        <div class="flex flex-row px-3 py-5">
                            <div class="text-gray-500 dark:text-gray-100 text-lg font-bold flex-grow">
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
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">GEF indicators</h1>
                            <RecursiveRadio v-model="area[Object.keys(area)[0]].gefIndicator"
                                            :options="menus.gefIndicators"
                                            :edit="edit" />
                        </div>
                        <div class="px-3 py-5">
                            <h1 class="akrobat text-2xl dark:text-zinc-300 font-bold mb-3">Project indicators</h1>
                            <IndicatorsList v-model="area[Object.keys(area)[0]].goalIndicators"
                                            :edit="edit" />
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
                    <div class="text-lg italic text-gray-600 dark:text-gray-400">None selected</div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
