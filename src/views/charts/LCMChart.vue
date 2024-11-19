<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import {
    createEchartValuesFromEMStats,
    getEMStatsYears,
    createEchartValuesFromEMStatsAverages,
    addMissingEMClasses
} from '@/lib/util';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const referenceYearStart = 2011;
const referenceYearEnd = 2020;

function processData(stats: any) {
    const years = addMissingEMClasses(stats, referenceYearStart)

    const referencePeriod = years.filter((year: any) => year.year >= referenceYearStart && year.year <= referenceYearEnd);
    const yearsOnwards = years.filter((year: any) => year.year > referenceYearEnd);

    // Calculate averages for the reference period (2011-2020)
    const referenceAvg = createEchartValuesFromEMStatsAverages(referencePeriod);

    // Process data for years 2021 onwards, including averages
    const values = createEchartValuesFromEMStats(yearsOnwards, referenceAvg);

    // Prepare x-axis data, including the reference period label
    const xData = [
        `Reference\n${referenceYearStart}-${referenceYearEnd}`,
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
</script>

<template>
    <EMChartContainer
        :area="area"
        statisticType="MODIS_COMBINED_LC"
        :processData="processData"
        title="Land Cover - MODIS Combined"
        :isActive="isActive"
        type="line"
        :getLegendFromStats="true"
        :rotateXAxisLabels="0"
        unit="ha"
    />
</template>
