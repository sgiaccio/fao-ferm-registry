<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';


defineProps<{
    area: any;
    isActive: boolean;
}>();

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
        title="ESA CCI Global Forest Above Ground Biomass"
        :isActive="isActive"
        type="bar"
        unit="MT/ha"
    />
</template>
