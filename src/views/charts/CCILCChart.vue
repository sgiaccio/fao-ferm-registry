<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import {
    createEchartValuesFromEMStats,
    createEchartValuesFromEMStatsAverages,
    getEMStatsYears,
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

    // Split the years into two groups: referenceYearStart to referenceYearEnd and 
    const referencePeriod = years.filter((year: any) => year.year >= referenceYearStart && year.year <= referenceYearEnd);
    const yearsOnwards = years.filter((year: any) => year.year > referenceYearEnd);

    // Calculate averages for the reference period
    const referenceAvg = createEchartValuesFromEMStatsAverages(referencePeriod);

    // Process data for years onwards, including averages
    const values = createEchartValuesFromEMStats(yearsOnwards, referenceAvg);

    // Prepare x-axis data, including the reference period label
    const xData = [
        // '{line1|Reference period}\n{line2|(2011-2020)}',
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
        type="line"
        :area="area"
        statisticType="CCILC"
        :processData="processData"
        title="CCI Land Cover Change"
        :isActive="isActive"
        :getLegendFromStats="true"
        unit="ha"
    />
</template>
