<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import {
    createEchartValuesFromEMStats,
    createEchartValuesFromEMStatsAverages,
    getEMStatsYears,
} from '@/lib/util';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const referenceYearStart = 2011;
const referenceYearEnd = 2020;

function processData(stats: any) {
    // Split the years into two groups: referenceYearStart to referenceYearEnd and 
    const referencePeriod = stats.statisticResults.years.filter((year: any) => year.year >= referenceYearStart && year.year <= referenceYearEnd);
    const yearsOnwards = stats.statisticResults.years.filter((year: any) => year.year > referenceYearEnd);

    // Calculate averages for the reference period
    const referenceAvg = createEchartValuesFromEMStatsAverages(referencePeriod);

    // Process data for years onwards, including averages
    const values = createEchartValuesFromEMStats(yearsOnwards, referenceAvg);

    // Prepare x-axis data, including the reference period label
    const xData = [
        // '{line1|Reference period}\n{line2|(2011-2020)}',
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

const statisticType = 'CCILC';
const title = 'CCI Land Cover Change';
</script>

<template>
    <EMChartContainer
        :area="area"
        :statisticType="statisticType"
        :processData="processData"
        :tooltipFormatter="tooltipFormatter"
        :title="title"
        :isActive="isActive"
        :getLegendFromStats="true"
    />
</template>
