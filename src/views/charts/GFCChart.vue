<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const referenceYearStart = 2011;
const referenceYearEnd = 2020;

function processData(stats: any) {
    const lossByYear = stats.statisticResults.lossByYear;

    // const dataFrom2011 = lossByYear.filter((loss: any) => loss[0] >= 2011);
    const dataFromReferencePeriod = lossByYear.filter(([ year, _ ]: any) => year >= referenceYearStart);
    // const dataFrom2011To2020 = dataFrom2011.filter((loss: any) => loss[0] <= 2020);
    const referencePeriodAverage = dataFromReferencePeriod
        .map(([ _, loss ]: any) => loss)
        .reduce((a: number, b: number) => a + b, 0) / dataFromReferencePeriod.length;
    // const dataFrom2021 = dataFrom2011.filter((loss: any) => loss[0] >= 2021);
    const dataOnwards = lossByYear.filter(([ year, _ ]: any )=> year > referenceYearEnd);

    // const xDataFrom2021 = dataFrom2021.map((loss: any) => loss[0]);
    // const yDataFrom2021 = dataFrom2021.map((loss: any) => loss[1]);

    const xDataOnwards = dataOnwards.map(([ year, _ ]: any) => year);
    const yDataOnwards = dataOnwards.map(([ _, loss ]: any) => loss);

    // const averageFrom2011To2020 = dataFrom2011To2020
    //     .map((loss: any) => loss[1])
    //     .reduce((a: number, b: number) => a + b, 0) / dataFrom2011To2020.length;

    const yData = [referencePeriodAverage, ...yDataOnwards];
    // const xData = ['Avg 2011-2020', ...xDataOnwards];
    const xData = [ `Avg ${referenceYearStart}-${referenceYearEnd}`, ...xDataOnwards ];

    return { xData, yData };
}

function tooltipFormatter(param: any) {
    return `
    <div style="max-width: 200px; white-space: normal; line-height: 1.5;">
      <div>Year: ${param.name}</div>
      <div>Value: ${param.value.toLocaleString('en-US', {
        maximumFractionDigits: 2,
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
