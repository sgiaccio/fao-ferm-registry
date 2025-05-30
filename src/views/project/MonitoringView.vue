<script setup lang="ts">
import { watch } from 'vue';

import { useI18n } from 'vue-i18n';

import { useProjectStore } from '@/stores/project';

import TabTemplate from '../TabTemplate.vue';

import { PlusCircleIcon } from '@heroicons/vue/24/solid';
import { TrashIcon } from '@heroicons/vue/20/solid';

import { getGoalColor } from '@/lib/auroraIndicators';

import { getSortedIndicatorsAndMonitoring } from '@/lib/util';
import { getAreaValue } from "@/lib/areaUtil";


const store = useProjectStore();

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const { t } = useI18n();

// Delete restorationType and tenureStatus for GEF3 indicators. This should be done in the store, but will be done here for now.
watch(() => store.projectAreas, areas => areas.forEach(area => {
    const areaValue = getAreaValue(area);
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
            {{ t('monitoring.description') }}
        </template>
        <template #default>
            <div
                v-if="store.projectAreas?.length"
                class="flex flex-col gap-y-4 mt-6"
            >
                <div
                    v-for="( area, i ) in store.projectAreas "
                    class="border-2 px-3 py-2 rounded-lg border-gray-300"
                >
                    <div class="flex flex-row my-3">
                        <div class="text-gray-500 text-lg font-bold mb-2 flex-grow">
                            {{ t('areaAndEcosystems.area') }}
                            {{ i + 1 }}<span
                                class="text-black"
                                v-if="getAreaValue(area).siteName"
                            >: {{ getAreaValue(area).siteName }}</span>
                        </div>
                    </div>
                    <!-- Project indicators -->
                    <div
                        v-for="goal in getSortedIndicatorsAndMonitoring(getAreaValue(area).goalIndicators)"
                        class="text-xs mb-4"
                    >
                        <div
                            class="w-full px-3 py-3 font-bold text-white border_ rounded-t-md"
                            :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`"
                        >{{ goal.goal }}</div>
                        <div
                            class="border-x border-b rounded-b-md"
                            :style="`border-color: ${getGoalColor(goal.goal)};`"
                        >
                            <div
                                v-for="indicator in goal.indicators"
                                class="px-3 py-3 border-b last:border-b-0"
                                :style="`border-color: ${getGoalColor(goal.goal, 0.4)}`"
                            >
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
                                        <div
                                            v-for="monitoring, i in indicator.monitoring || []"
                                            class="flex flex-row gap-x-5"
                                        >
                                            <div class="flex flex-col">
                                                <label
                                                    :for="`year-${i}`"
                                                    class="block text-xs font-medium text-gray-700"
                                                >
                                                    {{ t('monitoring.year') }}
                                                </label>
                                                <input
                                                    v-if="edit"
                                                    type="number"
                                                    name="year"
                                                    id="year"
                                                    min="1950"
                                                    max="9999"
                                                    class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    v-model="monitoring.year"
                                                    :readonly="!edit"
                                                >
                                                <div
                                                    v-else
                                                    class="text-base"
                                                >{{ monitoring.year }}</div>
                                            </div>
                                            <div class="flex flex-col">
                                                <label
                                                    :for="`value-${i}`"
                                                    class="block text-xs font-medium text-gray-700"
                                                >
                                                    {{ indicator.indicator.unit }}
                                                </label>
                                                <input
                                                    v-if="edit"
                                                    type="number"
                                                    name="value"
                                                    id="value"
                                                    class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    v-model="monitoring.value"
                                                    :readonly="!edit"
                                                >
                                                <div
                                                    v-else
                                                    class="text-base"
                                                >{{ monitoring.value }}</div>
                                            </div>
                                            <trash-icon
                                                v-if="edit"
                                                class="w-5 h-5 cursor-pointer self-center"
                                                v-model="monitoring.value"
                                                @click="() => removeIndicator(indicator.monitoring, i)"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-if="edit"
                                    class="w-full text-right mt-3"
                                >
                                    <PlusCircleIcon
                                        class="inline w-5 h-5 cursor-pointer"
                                        :style="`color: ${getGoalColor(goal.goal)};`"
                                        @click="() => addMonitoringYear(indicator)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>




                    <!-- Custom indicators -->
                    <div class="border rounded-md text-xs">
                        <div
                            v-for="indicator in getAreaValue(area).customIndicators || []"
                            class="px-3 py-3 border-b last:border-b-0"
                        >
                            <div class="flex flex-row gap-x-3">
                                <div class="self-start font-medium w-2/3">
                                    <div class="flex-grow self-center">
                                        {{ indicator.indicator.indicator }} &ndash;
                                        {{ indicator.indicator.metric }}
                                    </div>
                                </div>
                                <div class="flex flex-col gap-y-3 w-1/3">
                                    <div
                                        v-for="monitoring, i in indicator.monitoring || []"
                                        class="flex flex-row gap-x-2"
                                    >
                                        <div class="flex flex-col w-1/2 overflow-hidden">
                                            <label
                                                :for="`year-${i}`"
                                                class="block text-xs font-medium text-gray-700"
                                            >
                                                {{ t('monitoring.year') }}
                                            </label>
                                            <input
                                                v-if="edit"
                                                type="number"
                                                name="year"
                                                id="year"
                                                min="1950"
                                                max="9999"
                                                class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-20 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                v-model="monitoring.year"
                                                :readonly="!edit"
                                            >
                                            <div
                                                v-else
                                                class="text-base"
                                            >{{ monitoring.year }}
                                            </div>
                                        </div>
                                        <div class="flex flex-col w-1/2 overflow-hidden">
                                            <label
                                                :for="`value-${i}`"
                                                class="block text-xs font-medium text-gray-700"
                                            >
                                                {{ indicator.indicator.unit }}
                                            </label>
                                            <input
                                                v-if="edit"
                                                type="number"
                                                name="value"
                                                id="value"
                                                class="mt-0.5 focus:ring-indigo-500 focus:border-indigo-500 block w-24 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                v-model="monitoring.value"
                                                :readonly="!edit"
                                            >
                                            <div
                                                v-else
                                                class="text-base"
                                            >{{ monitoring.value }}
                                            </div>
                                        </div>
                                        <trash-icon
                                            v-if="edit"
                                            class="w-5 h-5 cursor-pointer self-center"
                                            v-model="monitoring.value"
                                            @click="() => removeIndicator(indicator.monitoring, i)"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                v-if="edit"
                                class="w-full text-right mt-3"
                            >
                                <PlusCircleIcon
                                    class="inline w-5 h-5 cursor-pointer"
                                    @click="() => addMonitoringYear(indicator)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </TabTemplate>
</template>
