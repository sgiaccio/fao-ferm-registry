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

const tooltipFormatter = (param: any) => {
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
    })}</div>
    </div>
  `;
};

const statisticType = 'IUCN_Biodiversity_species_richness';
const title = 'Biodiversity - IUCN Species Richness';
</script>

<template>
    <EMChartContainer
        :area="area"
        :statisticType="statisticType"
        :processData="processData"
        :tooltipFormatter="tooltipFormatter"
        :title="title"
        :isActive="isActive"
        type="bar"
    />
</template>
