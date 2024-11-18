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

const unit = 'MT/ha';

function tooltipFormatter(param: any) {
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
    })} ${unit}</div>
    </div>
  `;
};

const statisticType = 'CCIBiomass';
const title = 'ESA CCI Global Forest Above Ground Biomass';
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
