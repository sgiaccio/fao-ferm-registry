<script setup lang="ts">
import { useProjectStore } from '../../stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

import { formatNumber } from '@/lib/util';

import SnailChart from '@/components/charts/SnailChart.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();
const menus = useMenusStore().menus;

function getLastTargetArea() {
    const registration = store.project.project;
    const targetAreaDesignPhase = registration.targetAreaDesignPhase?.value;
    const targetAreaReviewPhase = registration.targetAreaReviewPhase?.value;
    const targetAreaEvaluationPhase = registration.targetAreaEvaluationPhase?.value;

    return targetAreaEvaluationPhase || targetAreaReviewPhase || targetAreaDesignPhase;
}

const areaByGefIndicator = store.areaByGefIndicator();
const areaForGefIndicator3 = areaByGefIndicator.reduce((total, [indicator, area]) => {
    if (indicator.startsWith('GEF3')) return total + area;
    return total;
}, 0);

const chartValues = areaByGefIndicator.map(([_, value]) => value);
const chartLabels = areaByGefIndicator.map(([label, _]) => getRecursiveMenuLabel(label, menus.gefIndicators));
</script>


<template>
    <TabTemplate title="Monitoring & Results">
        <!-- <template #description>
            <p>Results are calculated for selected indicators in each area of interests. The indicator calculation is based on available global layers and cloud computing environment such as SEPAL. The standard operating procedure to assess ecosystem restoration indicators is under preparation.</p>
        </template> -->
        <template #default>
            <div v-if="store.project.reportingLine !== 'GEF'"
                 class="font-semibold text-3xl text-center">
                Under development
            </div>
            <div v-else-if="chartValues.length > 0 && getLastTargetArea()"
                 class="flex flex-col gap-6">
                <div v-if="store.project.project.areaAchievedMatch === 1"
                     class="shadow-lg rounded px-4 py-3 text-base border">
                    <SnailChart v-if="chartValues.length > 0 && getLastTargetArea()"
                                :values="chartValues"
                                :labels="chartLabels"
                                unit="Ha"
                                :targetValue="getLastTargetArea()" />
                    <p class="mt-4 text-center font-bold text-gray-800">Congratulations! Your project has achieved {{ formatNumber(store.polygonsArea() / getLastTargetArea() * 100, true) }}% of your total committed land.</p>
                    <p class="mt-2 text-center">{{ formatNumber(areaForGefIndicator3 / getLastTargetArea() * 100, true) }}% of this land is under restoration (GEF core indicator 3).</p>
                </div>
                <div v-else
                     class="shadow-lg rounded px-4 py-3 text-base border">
                    <SnailChart :values="[]"
                                :labels="[]"
                                :targetValue="getLastTargetArea()" />
                </div>

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-green-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Area of land committed in last project phase</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-green-light/20">
                        <div class="col-span-2">Target area in last project phase</div>
                        <div class="col-span-1">{{ formatNumber(getLastTargetArea(), true) }} Ha</div>
                    </div>
                </div>

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-mustard-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Total area of land achieved during project implementation</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-mustard-light/20">
                        <div class="col-span-2">Total area of land achieved (tabular format)</div>
                        <div class="col-span-1">{{ formatNumber(store.project.project.areaAchieved, true) }} Ha</div>
                        <div class="col-span-2">Total area of land achieved (spatially explicit format)</div>
                        <div class="col-span-1">{{ formatNumber(store.polygonsArea(), true) }} Ha</div>
                    </div>
                </div>

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-blue-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Total area of land achieved per GEF CORE Indicator 1&#8209;5</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-blue-light/20">
                        <template v-for="[indicator, area] in areaByGefIndicator">
                            <div class="col-span-2">{{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}</div>
                            <div class="col-span-1">{{ formatNumber(area, true) }} Ha</div>
                        </template>
                    </div>
                </div>



                <!-- <div class="shadow rounded px-4 py-3 border bg-slate-50">
                    <div class="grid grid-cols-6 gap-4">
                        <div class="col-span-2"><!- -Total area of land achieved- -></div>
                        <div class="col-span-4 font-bold text-lg">Total area of land achieved per GEF CORE Indicator 1&#8209;5</div>
                        <template v-for="[indicator, area] in areaByGefIndicator">
                            <div class="col-span-2 font-bold">{{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}</div>
                            <div class="col-span-2">{{ formatNumber(area, true) }}</div>
                            <div class="col-span-2">Ha</div>
                        </template>
                    </div>
                </div> -->
            </div>
            <div v-else
                 class="flex flex-col gap-6 pt-6 font-bold text-xl">
                Not enough data to show results
            </div>
        </template>
    </TabTemplate>
</template>
