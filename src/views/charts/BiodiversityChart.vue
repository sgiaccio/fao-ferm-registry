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

const statisticType = 'IUCN_Biodiversity_species_richness';
</script>

<template>
    <EMChartContainer
        :area="area"
        :statisticType="statisticType"
        :processData="processData"
        :title="t('publicPagePreview.charts.biodiversity')"
        :isActive="isActive"
        type="bar"
    />
</template>
