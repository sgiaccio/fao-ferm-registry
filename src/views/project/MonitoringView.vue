<script setup lang="ts">
import { watch } from 'vue';

import { useProjectStore } from '@/stores/project';

import TabTemplate from '../TabTemplate.vue';

import { PlusCircleIcon } from '@heroicons/vue/24/solid';
import { TrashIcon } from '@heroicons/vue/20/solid';

import { getGoalColor } from '@/lib/auroraIndicators';

import { getSortedIndicatorsAndMonitoring } from '@/lib/util';


const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

// Delete restorationType and tenureStatus for GEF3 indicators. This should be done in the store, but will be done here for now.
watch(() => store.projectAreas, areas => areas.forEach(area => {
    const areaValue = Object.values(area)[0];
    if (!areaValue.gefIndicator?.startsWith('GEF3')) {
        delete areaValue.restorationType;
        delete areaValue.tenureStatus;
    }
}), { deep: true });

function addMonitoringYear(indicator) {
    if (!indicator.monitoring) indicator.monitoring = [];
    indicator.monitoring.push({ year: undefined, value: undefined });
}

function removeIndicator(monitoring, i: number) {
    if (confirm("Are you sure you want to delete this monitoring year?")) {
        monitoring.splice(i, 1);
    }
}
</script>

<template>
    <TabTemplate title="Monitoring">
        <template #description>
            With robust monitoring, it is possible to track restoration actions, determine their effectiveness, and adopt adaptive management practices to improve the outcomes of the restoration. To facilitate the monitoring, this section allows you to input the metric values corresponding to your chosen indicators on an annual basis. This process can be executed for each of the areas of your restoration initiative.
        </template>
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
                    </div>
                    <!-- Project indicators -->
                    <div v-for="goal in getSortedIndicatorsAndMonitoring(area[Object.keys(area)[0]].goalIndicators)"
                         class="text-xs mb-4">
                        <div class="w-full px-3 py-3 font-bold text-white border_ rounded-t-md"
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
                                            {{ indicator.indicator.rg_subtheme }} &ndash;
                                            {{ indicator.indicator.metric }} &ndash;
                                            {{ indicator.indicator.action }}
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-y-3">
                                        <div v-for="monitoring, i in indicator.monitoring || []"
                                             class="flex flex-row gap-x-5">
                                            <div class="flex flex-col">
                                                <label :for="`year-${i}`"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    Year
                                                </label>
                                                <input v-if="edit"
                                                       type="number"
                                                       name="year"
                                                       id="year"
                                                       min="1950"
                                                       max="9999"
                                                       class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="monitoring.year"
                                                       :readonly="!edit">
                                                <div v-else
                                                     class="text-base">{{ monitoring.year }}</div>
                                            </div>
                                            <div class="flex flex-col">
                                                <label :for="`value-${i}`"
                                                       class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    {{ indicator.indicator.unit }}
                                                </label>
                                                <input v-if="edit"
                                                       type="number"
                                                       name="value"
                                                       id="value"
                                                       class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                       v-model="monitoring.value"
                                                       :readonly="!edit">
                                                <div v-else
                                                     class="text-base">{{ monitoring.value }}</div>
                                            </div>
                                            <trash-icon v-if="edit"
                                                        class="w-5 h-5 cursor-pointer self-center"
                                                        v-model="monitoring.value"
                                                        @click="() => removeIndicator(indicator.monitoring, i)" />
                                        </div>
                                    </div>
                                </div>
                                <div v-if="edit"
                                     class="w-full text-right mt-3">
                                    <PlusCircleIcon class="inline w-5 h-5 cursor-pointer"
                                                    :style="`color: ${getGoalColor(goal.goal)};`"
                                                    @click="() => addMonitoringYear(indicator)" />
                                </div>
                            </div>
                        </div>
                    </div>




                    <!-- Custom indicators -->
                    <div class="border rounded-md text-xs">
                    <div v-for="indicator in area[Object.keys(area)[0]].customIndicators || []"
                         class="px-3 py-3 border-b last:border-b-0">
                        <div class="flex flex-row ">
                            <div class="flex-grow self-start font-medium">
                                <div class="flex-grow self-center">
                                    {{ indicator.indicator.indicator }} &ndash;
                                    {{ indicator.indicator.metric }} 
                                </div>
                            </div>
                            <div class="flex flex-col gap-y-3">
                                <div v-for="monitoring, i in indicator.monitoring || []"
                                     class="flex flex-row gap-x-5">
                                    <div class="flex flex-col">
                                        <label :for="`year-${i}`"
                                               class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                            Year
                                        </label>
                                        <input v-if="edit"
                                               type="number"
                                               name="year"
                                               id="year"
                                               min="1950"
                                               max="9999"
                                               class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                               v-model="monitoring.year"
                                               :readonly="!edit">
                                        <div v-else
                                             class="text-base">{{ monitoring.year }}
                                        </div>
                                    </div>
                                    <div class="flex flex-col">
                                        <label :for="`value-${i}`"
                                               class="block text-xs font-medium text-gray-700 dark:text-gray-100">
                                            {{ indicator.indicator.unit }}
                                        </label>
                                        <input v-if="edit"
                                               type="number"
                                               name="value"
                                               id="value"
                                               class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                               v-model="monitoring.value"
                                               :readonly="!edit">
                                        <div v-else
                                             class="text-base">{{ monitoring.value }}
                                        </div>
                                    </div>
                                    <trash-icon v-if="edit"
                                                class="w-5 h-5 cursor-pointer self-center"
                                                v-model="monitoring.value"
                                                @click="() => removeIndicator(indicator.monitoring, i)" />
                                </div>
                            </div>
                        </div>
                        <div v-if="edit"
                             class="w-full text-right mt-3">
                            <PlusCircleIcon class="inline w-5 h-5 cursor-pointer"
                                            @click="() => addMonitoringYear(indicator)" />
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
