<script setup lang="ts">
import { ref, watch } from 'vue';

import { getPolygonZonalStats } from '@/firebase/functions';

import LineChartComponent from './LineChart.vue';
import StackedBarChartComponent from './StackedBarChart.vue';
import BarChartComponent from './BarChart.vue';


const props = withDefaults(defineProps<{
    area: any
    statisticType: string
    processData: (stats: any) => { xData: any[]; yData: any[] }
    title: string
    isActive: boolean
    type?: string
    getLegendFromStats?: boolean
    rotateXAxisLabels?: number
    unit?: string
}>(), {
    type: 'line',
    getLegendFromStats: false,
    rotateXAxisLabels: 45
});

const xData = ref<any[]>();
const yData = ref<any[]>();
let legend: { [key: string]: string } = {};
const loading = ref(true);
const loaded = ref(false);
const error = ref(false);

function getLegend(stats: any) {
    const legendObj: { [key: string]: string } = {};
    stats.statisticResults.years.forEach((year: any) => {
        year.data.forEach((data: any) => {
            if (!legendObj[data.class_name]) {
                legendObj[data.class_name] = '#' + data.class_palette;
            }
        });
    });
    return legendObj;
}

async function loadData(area: any) {
    if (loaded.value) return;

    loading.value = true;

    if (!area?.uuid) return;
    const uuid = area.uuid;

    try {
        // Fetch data using getPolygonZonalStats
        const stats = await getPolygonZonalStats(uuid, props.statisticType);

        // Process data using the specialized function
        const processedData = props.processData(stats);

        if (props.getLegendFromStats) {
            legend = getLegend(stats);
        }

        xData.value = processedData.xData;
        yData.value = processedData.yData;

        loading.value = false;
        loaded.value = true;
    } catch (e) {
        error.value = true;
        console.error('Error fetching data:', e);
    }
}

watch(() => props.isActive, (isActive) => {
    if (isActive) {
        loadData(props.area);
    }
}, { immediate: true });

watch(() => props.area, (newArea) => {
    loaded.value = false;
    if (props.isActive) {
        loadData(newArea);
    }
});
</script>

<template>
    <div
        v-if="error"
        class="h-96 w-full flex items-center justify-center text-gray-600 text-center select-none cursor-default"
    >
        <div>
            <p class="font-bold text-base">Error calculating statistics for the selected area</p>
            <p class="text-sm">Please try again later<br>and contact support if the problem persists</p>
        </div>
    </div>
    <template v-else>
        <LineChartComponent
            v-if="type === 'line'"
            :title="title"
            :xData="xData"
            :yData="yData"
            :loading="loading"
            :legend="legend"
            :unit="unit"
        />
        <StackedBarChartComponent
            v-else-if="type === 'stacked-bar'"
            :title="title"
            :xData="xData"
            :yData="yData"
            :loading="loading"
            :legend="legend"
            :rotateXAxisLabels="props.rotateXAxisLabels"
            :unit="unit"
        />
        <BarChartComponent
            v-else-if="type === 'bar'"
            :title="title"
            :xData="xData"
            :yData="yData"
            :loading="loading"
            :unit="unit"
        />
        <template v-else>
            <p>Unsupported chart type: {{ type }}</p>
        </template>
    </template>
</template>
