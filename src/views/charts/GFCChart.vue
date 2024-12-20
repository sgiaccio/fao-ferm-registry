<script setup lang="ts">
import EMChartContainer from './EMChartContainer.vue';

import { useI18n } from 'vue-i18n';


defineProps<{
    area: any;
    isActive: boolean;
}>();

const { t } = useI18n();

const referenceYearStart = 2011;
const referenceYearEnd = 2020;

function processData(stats: any) {
    const lossByYear = stats.statisticResults.lossByYear;

    const dataFromReferencePeriod = lossByYear.filter(([ year, _ ]: any) => year >= referenceYearStart);
    const referencePeriodAverage = dataFromReferencePeriod
        .map(([ _, loss ]: any) => loss)
        .reduce((a: number, b: number) => a + b, 0) / (referenceYearEnd - referenceYearStart + 1); // here we are dividing by the number of years in the reference period as we consider missing years as 0 - please note that this is a bold assumption
    const dataOnwards = lossByYear.filter(([ year, _ ]: any )=> year > referenceYearEnd);

    const xDataOnwards = dataOnwards.map(([ year, _ ]: any) => year);
    const yDataOnwards = dataOnwards.map(([ _, loss ]: any) => loss);

    const yData = [referencePeriodAverage, ...yDataOnwards];
    const xData = [ `${t('publicPagePreview.charts.reference')}\n${referenceYearStart}-${referenceYearEnd}`, ...xDataOnwards ];

    return { xData, yData };
}
</script>

<template>
    <EMChartContainer
        :area="area"
        statisticType="hansen"
        :processData="processData"
        :title="t('publicPagePreview.charts.gfc')"
        :isActive="isActive"
        type="bar"
    />
</template>
