<script setup lang="ts">
import { getSortedIndicatorsAndMonitoring } from '@/lib/util';
import { GoalIndicator, getGoalColor } from '@/lib/auroraIndicators';
import ResultPanel from './ResultPanel.vue';

const props = defineProps<{
    areas: any
}>();

const areasWithIndicators = props.areas
    .map(area => Object.values(area)[0])
    .filter((areaData: any) => areaData?.goalIndicators?.length > 0 || areaData?.customIndicators?.length > 0);


const goalIndicators = areasWithIndicators
    .map(area => area.goalIndicators || [])
    .flat()
    .map(i => ({ indicator: new GoalIndicator(i.indicator) }))
    // remove duplicates
    .filter((value, index, self) => self.findIndex(i => i.indicator.equals(value.indicator)) === index);

const customIndicators = areasWithIndicators
    .map(area => area.customIndicators || [])
    .flat()

const sorted = getSortedIndicatorsAndMonitoring(goalIndicators);
</script>

<template>
    <ResultPanel title="Indicators">
        <div
            v-if="goalIndicators.length === 0 && customIndicators.length === 0"
            class="italic text-gray-500"
        >No indicators</div>
        <div
            v-else
            class="sm:rounded-md overflow-hidden"
        >
            <template v-if="goalIndicators.length > 0">
                <div
                    v-for="goal in sorted"
                    :key="goal.id"
                >
                    <div
                        class="flex flex-col py-2 text-white"
                        :style="`background-color: ${getGoalColor(goal.goal)}; border-color: ${getGoalColor(goal.goal)};`"
                    >
                        <h3 class="text-base font-semibold px-3 pt-2">{{ goal.goal }}</h3>
                        <div class="flex flex-col text-xs divide-y divide-gray-300">
                            <div
                                v-for="indicator in goal.indicators"
                                :key="indicator.id"
                                class="py-2 px-3"
                            >
                                {{ indicator.indicator.indicator }}:
                                {{ indicator.indicator.action }} -
                                {{ indicator.indicator.metric }} [{{ indicator.indicator.unit }}]
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="customIndicators.length > 0">
                <div class="flex flex-col py-2 text-black bg-gray-200 border-gray-500">
                    <h3 class="text-base font-semibold px-3 pt-2">Custom indicators</h3>
                    <div class="flex flex-col text-xs divide-y divide-gray-300">
                        <div
                            v-for="indicator in customIndicators"
                            :key="indicator.id"
                            class="py-2 px-3"
                        >
                            {{ indicator.indicator.indicator }}:
                            {{ indicator.indicator.metric }} [{{ indicator.indicator.unit }}]
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </ResultPanel>
</template>