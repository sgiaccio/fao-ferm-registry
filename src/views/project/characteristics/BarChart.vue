<script
    setup
    lang="ts"
>
import { ref, onMounted, onUnmounted } from 'vue';
// import * as echarts from 'echarts';


import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { BarChart } from 'echarts/charts';

// Import the tooltip, title, rectangular coordinate system, dataset and transform components
import {
    // TitleComponent,
    TooltipComponent,
    GridComponent,
    // DatasetComponent,
    // TransformComponent,
    LegendComponent
} from 'echarts/components';

// Features like Universal Transition and Label Layout
// import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { SVGRenderer } from 'echarts/renderers';


echarts.use([
    BarChart,
    // TitleComponent,
    TooltipComponent,
    GridComponent,
    // DatasetComponent,
    // TransformComponent,
    // LabelLayout,
    // UniversalTransition,
    SVGRenderer,
    LegendComponent
]);


const chartDiv = ref();

const props = defineProps<{
    values: [{
        label: number,
        value: number
    }],
    legend: string
}>()

let resizeHandler: any;

onMounted(() => {
    const chart = echarts.init(chartDiv.value);
    chart.setOption({
        title: {
            // text: 'Biomass [MT/ha]'
            show: false
        },
        tooltip: {
            confine: true,
        },
        legend: {
            data: [props.legend],
            show: false
        },
        xAxis: {
            data: props.values.map((v) => v.label)
        },
        yAxis: {},
        series: [{
            name: props.legend,
            type: 'bar',
            data: props.values.map(v => v.value)
        }],
        itemStyle: {
            borderRadius: [2, 2, 0, 0],
        },
        grid: {
            containLabel: true,
            // left: 0,
            // top: 20,
            // right: 5,
            bottom: 30
        },
    });

    resizeHandler = chart.resize
    window.addEventListener('resize', resizeHandler);
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
});
</script>

<template>
    <div class="h-64 lg:h-72 max-w-80 lg:max-w-96 rounded shadow-lg overflow-hidden border border-gray-100">
        <div
            id="1"
            class="w-full h-full"
            ref="chartDiv"
        ></div>
    </div>
</template>
