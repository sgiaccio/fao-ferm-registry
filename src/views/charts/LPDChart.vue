<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import { createEchartValuesFromEMStats, getEMStatsYears } from '@/lib/util';


defineProps<{
    area: any;
    isActive: boolean;
}>();

function processData(stats: any) {
    const allYears = stats.statisticResults.years;

    // Process data for these years
    const values = createEchartValuesFromEMStats(allYears);

    // Prepare x-axis and y-axis data
    const xData = getEMStatsYears(allYears);
    const yData = values.map((value: any, i: number) => ({
        name: value.class_name,
        data: value.values,
        id: value.index
    }));

    return { xData, yData };
}

const unit = 'ha';

function tooltipFormatter(param: any) {
    const fullName = param.seriesName;
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div style="font-weight: bold;">${fullName}</div>
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
    })} ${unit}</div>
    </div>
  `;
};

const statisticType = 'landProductivity';
const title = 'Land Productivity Dynamics - MODIS';
</script>

<template>
    <EMChartContainer
        :area="area"
        :statisticType="statisticType"
        :processData="processData"
        :tooltipFormatter="tooltipFormatter"
        :title="title"
        :isActive="isActive"
        type="stacked-bar"
        :getLegendFromStats="true"
    />
</template>
