<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import { createEchartValuesFromEMStats, getEMStatsYears, createEchartValuesFromEMStatsAverages } from '@/lib/util';


defineProps<{
    area: any;
    isActive: boolean;
}>();

function processData(stats: any) {
    const years2011to2020 = stats.statisticResults.years.filter((year: any) => year.year >= 2011 && year.year <= 2020);
    const years2021onwards = stats.statisticResults.years.filter((year: any) => year.year >= 2021);

    // Calculate averages for the reference period (2011-2020)
    const averages2011to2020 = createEchartValuesFromEMStatsAverages(years2011to2020);

    // Process data for years 2021 onwards, including averages
    const values = createEchartValuesFromEMStats(years2021onwards, averages2011to2020);

    // Prepare x-axis data, including the reference period label
    const xData = [
        '{line1|Reference period}\n{line2|(2011-2020)}',
        ...getEMStatsYears(years2021onwards),
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

const tooltipFormatter = (param: any) => {
    const fullName = param.seriesName;
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div style="font-weight: bold;">${fullName}</div>
      <div>${param.dataIndex === 0 ? 'Reference period' : 'Year: ' + param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
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
    />
</template>
