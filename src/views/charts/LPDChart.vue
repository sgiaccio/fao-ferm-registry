<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';
import { createEchartValuesFromEMStats, getEMStatsYears } from '@/lib/util';

import { useI18n } from 'vue-i18n';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const { t } = useI18n();

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
</script>

<template>
    <EMChartContainer
        :area="area"
        statisticType="landProductivity"
        :processData="processData"
        :title="t('publicPagePreview.charts.lpd')"
        :isActive="isActive"
        type="stacked-bar"
        :getLegendFromStats="true"
        unit="ha"
    />
</template>
