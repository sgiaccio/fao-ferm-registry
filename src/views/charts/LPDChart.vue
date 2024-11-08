<script setup lang="ts">
import { ref } from 'vue';

import LineChartContainer from './LineChartContainer.vue';
import { createEchartValuesFromEMStats, getEMStatsYears } from '@/lib/util';

defineProps<{
    area: any;
    isActive: boolean;
}>();

function processData(stats: any) {
    // Filter years from 2021 onwards
    const years2021onwards = stats.statisticResults.years.filter(
        (year: any) => year.year >= 2021
    );

    // Process data for these years
    const values = createEchartValuesFromEMStats(years2021onwards);

    // Prepare x-axis and y-axis data
    const xData = getEMStatsYears(years2021onwards);
    const yData = values.map((value: any, i: number) => ({
        name: value.class_name,
        data: value.values,
    }));

    return { xData, yData };
}

const tooltipFormatter = (param: any) => {
    const fullName = param.seriesName;
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div style="font-weight: bold;">${fullName}</div>
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
    })} ha</div>
    </div>
  `;
};

const statisticType = 'landProductivity';
const title = 'Land Productivity Dynamics - MODIS';

const ccChartRef = ref(null);

// function loadData() {
//     if (ccChartRef.value) {
//         ccChartRef.value.loadData(props.area);
//     }
// }

// defineExpose({ loadData });
</script>

<template>
    <LineChartContainer
        ref="ccChartRef"
        :area="area"
        :statisticType="statisticType"
        :processData="processData"
        :tooltipFormatter="tooltipFormatter"
        :title="title"
        :isActive="isActive"
    />
</template>
