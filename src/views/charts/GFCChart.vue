<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';


defineProps<{
    area: any;
    isActive: boolean;
}>();

function processData(stats: any) {
    const lossByYear = stats.statisticResults.lossByYear;

    const dataFrom2011 = lossByYear.filter((loss: any) => loss[0] >= 2011);
    const dataFrom2021 = dataFrom2011.filter((loss: any) => loss[0] >= 2021);
    const dataFrom2011To2020 = dataFrom2011.filter((loss: any) => loss[0] <= 2020);

    const xDataFrom2021 = dataFrom2021.map((loss: any) => loss[0]);
    const yDataFrom2021 = dataFrom2021.map((loss: any) => loss[1]);

    const averageFrom2011To2020 = dataFrom2011To2020
        .map((loss: any) => loss[1])
        .reduce((a: number, b: number) => a + b, 0) / dataFrom2011To2020.length;

    const yData = [averageFrom2011To2020, ...yDataFrom2021];
    const xData = ['Average 2011-2020', ...xDataFrom2021];

    return { xData, yData };
}

const tooltipFormatter = (param: any) => {
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 0,
    })} ha</div>
    </div>
  `;
};

const statisticType = 'hansen';
const title = 'Forest Tree Cover > 10% (FRA Forest definition)';
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
