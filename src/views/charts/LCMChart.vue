<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import { createEchartValuesFromEMStats, getEMStatsYears, createEchartValuesFromEMStatsAverages } from '@/lib/util';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const referenceYearStart = 2011;
const referenceYearEnd = 2020;

function processData(stats: any) {
    const referencePeriod = stats.statisticResults.years.filter((year: any) => year.year >= referenceYearStart && year.year <= referenceYearEnd);
    const yearsOnwards = stats.statisticResults.years.filter((year: any) => year.year > referenceYearEnd);

    // Calculate averages for the reference period (2011-2020)
    const referenceAvg = createEchartValuesFromEMStatsAverages(referencePeriod);

    // Process data for years 2021 onwards, including averages
    const values = createEchartValuesFromEMStats(yearsOnwards, referenceAvg);

    // Prepare x-axis data, including the reference period label
    const xData = [
        `Avg ${referenceYearStart}–${referenceYearEnd}`,
        ...getEMStatsYears(yearsOnwards),
    ];

    // yData includes averages as the first data point
    const yData = values.map((value: any) => ({
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
      <div>${param.dataIndex === 0 ? 'Reference period' : 'Year: ' + param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
    })} ${unit}</div>
    </div>
  `;
};

const statisticType = 'MODIS_COMBINED_LC';
const title = 'Land Cover - MODIS Combined';
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
        :rotateXAxisLabels="0"
    />
</template>
