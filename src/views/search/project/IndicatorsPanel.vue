<script setup lang="ts">
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { getSortedIndicatorsAndMonitoring } from '@/lib/util';
import { GoalIndicator, getGoalColor } from '@/lib/auroraIndicators';
import ResultPanel from './ResultPanel.vue';
import type { AreaObject } from "@/types";
import { getAreaValue } from "@/lib/areaUtil";


const props = defineProps<{
    areas: AreaObject[]
}>();

const { t } = useI18n();

const areasWithIndicators = computed(() => props.areas
    .map(getAreaValue)
    .filter(areaData => (areaData?.goalIndicators ?? []).length > 0 || (areaData?.customIndicators ?? []).length > 0)
);

const goalIndicators = computed(() => areasWithIndicators.value
    .map(area => area.goalIndicators || [])
    .flat()
    .map(i => ({ indicator: new GoalIndicator(i.indicator) }))
    // remove duplicates
    .filter((value, index, self) => self.findIndex(i => i.indicator.equals(value.indicator)) === index)
);

const customIndicators = computed(() => areasWithIndicators.value
    .map(area => area.customIndicators || [])
    .flat()
);

const sorted = computed(() => getSortedIndicatorsAndMonitoring(goalIndicators.value));
</script>

<template>
    <ResultPanel
        :title="t('publicPagePreview.indicatorsPanel.title')"
        titleLink="https://auroramonitoring.org"
    >
        <div
            v-if="goalIndicators.length === 0 && customIndicators.length === 0"
            class="italic text-gray-500"
        >
            {{ t('publicPagePreview.indicatorsPanel.noIndicators') }}
        </div>
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
                    <h3 class="text-base font-semibold px-3 pt-2">
                        {{ t('publicPagePreview.indicatorsPanel.customIndicators') }}
                    </h3>
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