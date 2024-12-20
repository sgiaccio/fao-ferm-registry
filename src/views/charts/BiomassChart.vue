<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';

import { useI18n } from 'vue-i18n';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const { t } = useI18n();

function processData(stats: any) {
    const yData = stats.statisticResults.data.map((v: any) => v.total);
    const xData = stats.statisticResults.data.map((v: any) => v.year);

    return { xData, yData };
}
</script>

<template>
    <EMChartContainer
        :area="area"
        statisticType="CCIBiomass"
        :processData="processData"
        :title="t('publicPagePreview.charts.biomass')"
        :isActive="isActive"
        type="bar"
        unit="MT/ha"
    />
</template>
