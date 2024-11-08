<!-- CCILCChart.vue -->
<script setup lang="ts">
import { ref } from 'vue';

import LineChartContainer from './LineChartContainer.vue';
import {
    createEchartValuesFromEMStats,
    createEchartValuesFromEMStatsAverages,
    getEMStatsYears,
} from '@/lib/util';

defineProps<{
    area: any;
    isActive: boolean;
}>();

function processData(stats: any) {
    // Split the years into two groups: 2011-2020 and 2021 onwards
    const years2011to2020 = stats.statisticResults.years.filter(
        (year: any) => year.year >= 2011 && year.year <= 2020
    );
    const years2021onwards = stats.statisticResults.years.filter(
        (year: any) => year.year >= 2021
    );

    // Calculate averages for the reference period (2011-2020)
    const averages2011to2020 = createEchartValuesFromEMStatsAverages(
        years2011to2020
    );

    // Process data for years 2021 onwards, including averages
    const values = createEchartValuesFromEMStats(
        years2021onwards,
        averages2011to2020
    );

    // Prepare x-axis data, including the reference period label
    const xData = [
        '{line1|Reference period}\n{line2|(2011-2020)}',
        ...getEMStatsYears(years2021onwards),
    ];

    // yData includes averages as the first data point
    const yData = values.map((value: any) => ({
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
      <div>${param.dataIndex === 0 ? 'Reference period' : 'Year: ' + param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
    })} ha</div>
    </div>
  `;
};

const statisticType = 'CCILC';
const title = 'CCI Land Cover Change\nCompared to Reference Period (2011-2020)';

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
