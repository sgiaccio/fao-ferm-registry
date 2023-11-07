<script setup lang="ts">
import { watch } from 'vue';

import { useProjectStore } from '@/stores/project';

import TabTemplate from '../TabTemplate.vue';

import { PlusCircleIcon } from '@heroicons/vue/24/solid';

import { getGoalColor, sortedGoalIndicators } from '@/lib/auroraIndicators';


const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

function applyToAll() {
    if (!confirm('Are you sure you want to apply this indicator to all areas? Your current selections will be overwritten.')) return;

    const key = Object.keys(store.projectAreas[0])[0];
    const gefIndicator = store.projectAreas[0][key].gefIndicator;
    const goalIndicators = store.projectAreas[0][key].goalIndicators;

    store.projectAreas.forEach((area, i) => {
        if (i > 0) {
            if (gefIndicator) {
                area[key].gefIndicator = gefIndicator;
            }
            if (goalIndicators && goalIndicators.length) {
                area[key].goalIndicators = [...goalIndicators];
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


function getSortedIndicatorsAndMonitoring(indicatorAndMonitoring: any) {
    function rank(i1: any, i2: any) {
        // check nullity
        if (!i1.indicator.rg_goal || !i2.indicator.rg_goal) return 0;

        const i1Index = sortedGoalIndicators.findIndex(i => i.rg_goal === i1.indicator.rg_goal);
        const i2Index = sortedGoalIndicators.findIndex(i => i.rg_goal === i1.indicator.rg_goal);
        return Math.sign(i1Index - i2Index);
    }

    const sorted = indicatorAndMonitoring.sort(rank);

    // group by goal
    const grouped = sorted.reduce((acc: any, indicator: any) => {
        const goal = indicator.indicator.rg_goal;
        if (!acc[goal]) {
            acc[goal] = {
                goal,
                indicators: []
            };
        }
        acc[goal].indicators.push(indicator);
        return acc;
    }, {});

    return grouped;
}

function addMonitoringYear(indicator) {
    if (!indicator.monitoring) indicator.monitoring = [];
    indicator.monitoring.push({ year: undefined, value: undefined });
}
</script>

<template>
    <TabTemplate title="Monitoring">
        <template #description>This is the description</template>
        <template #default>
            <div v-if="store.projectAreas?.length"
                 class="flex flex-col gap-y-4 mt-6">
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
                    <!-- Project indicators -->

                    <div v-for="goal in getSortedIndicatorsAndMonitoring(area[Object.keys(area)[0]].goalIndicators)"
                         class="text-xs mb-4">
                        <!-- {{ JSON.stringify(goal, null, 2) }} -->
                        <div class="w-full px-3 py-3 font-bold text-white order rounded-t-md"
                             :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`">{{ goal.goal }}</div>

                        <div class="border-x border-b rounded-b-md"
                             :style="`border-color: ${getGoalColor(goal.goal)};`">
                            <div v-for="indicator in goal.indicators"
                                 class="px-3 py-3 border-b last:border-b-0"
                                 :style="`border-color: ${getGoalColor(goal.goal, 0.4)}`">
                                <div class="flex flex-row ">
                                    <div class="flex-grow self-start font-medium">
                                        <div class="flex-grow self-center">
                                            {{ indicator.indicator.indicator }}
                                            <br>
                                            {{ indicator.indicator.action }} &ndash; {{ indicator.indicator.metric }} &ndash; {{ indicator.indicator.rg_subtheme }}
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-y-3">
                                        <div v-for="i in indicator.monitoring || []"
                                             class="flex flex-row gap-x-5">
                                            <div class="flex flex-col">
                                                <label for="year"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    Year
                                                </label>
                                                <input type="number"
                                                       name="year"
                                                       id="year"
                                                       class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="i.year">
                                            </div>
                                            <div class="flex flex-col">
                                                <label for="value"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    {{ indicator.indicator.unit }}
                                                </label>
                                                <input type="number"
                                                       name="value"
                                                       id="value"
                                                       class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="i.value">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="w-full text-right mt-3 ">
                                    <PlusCircleIcon class="inline w-5 h-5 cursor-pointer"
                                                    :style="`color: ${getGoalColor(goal.goal)};`"
                                                    @click="() => addMonitoringYear(indicator)" />
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </template>
    </TabTemplate>
</template>
