<!-- LineChartContainer.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import LineChartComponent from './LineChart.vue';
import { getPolygonZonalStats } from '@/firebase/functions';
import { onWatcherCleanup } from 'vue';

const props = defineProps<{
    area: any;
    statisticType: string;
    processData: (stats: any) => { xData: any[]; yData: any[] };
    tooltipFormatter: (param: any) => string;
    title: string;
    isActive: boolean;
}>();

const xData = ref<any[]>();
const yData = ref<any[]>();
const loading = ref(true);
const loaded = ref(false);

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

        xData.value = processedData.xData;
        yData.value = processedData.yData;

        loading.value = false;
        loaded.value = true;
    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error appropriately (e.g., display a message to the user)
    }
}

// Watch for changes in the area prop to update the chart
// watch(
//     () => props.area,
//     (newArea) => {
//         showChart(newArea);
//     },
//     { immediate: true }
// );

// defineExpose({ loadData });

// watch(() => props.area, (newArea) => {
//     loaded.value = false;
//     loadData(newArea);
// });

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
    <LineChartComponent
        :title="title"
        :xData="xData"
        :yData="yData"
        :tooltipFormatter="tooltipFormatter"
        :loading="loading"
    />
</template>