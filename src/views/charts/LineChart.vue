<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    GraphicComponent
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';


interface YData {
    name: string;
    data: number[];
}

const props = defineProps<{
    title?: string
    yData?: YData[]
    xData: any
    tooltipFormatter?: any
    loading?: boolean
}>();

echarts.use([
    LineChart,
    TooltipComponent,
    GridComponent,
    SVGRenderer,
    LegendComponent,
    TitleComponent,
    GraphicComponent
]);

const chartDiv = ref(null);
let myChart: any;
let windowResizeObserver: () => void;

onMounted(() => {
    if (!chartDiv.value) return;

    myChart = echarts.init(chartDiv.value, null, { renderer: 'svg' });
    // myChart.showLoading();
    showLoading();

    windowResizeObserver = () => myChart.resize();
    window.addEventListener('resize', windowResizeObserver);

    watch(() => props.loading, () => {
        if (props.loading) {
            showLoading();
        }
    }, { immediate: true });
});

// watch(() => props.loading, () => {
//     if (props.loading) {
//         showLoading();
//     }}, { immediate: false });

function showLoading() {
    const columns = [];
    for (let i = 0; i < 7; i++) {
        columns.push({
            type: 'rect',
            x: i * 20,
            shape: {
                x: 0,
                y: -40,
                width: 10,
                height: 80
            },
            style: {
                fill: '#5470c6'
            },
            keyframeAnimation: {
                duration: 1000,
                delay: i * 200,
                loop: true,
                keyframes: [
                    {
                        percent: 0.5,
                        scaleY: 0.1,
                        easing: 'cubicIn'
                    },
                    {
                        percent: 1,
                        scaleY: 1,
                        easing: 'cubicOut'
                    }
                ]
            }
        });
    }
    const option = {
        graphic: {
            elements: [
                {
                    type: 'group',
                    bounding: 'all',
                    left: 'center',
                    top: 'center',
                    children: columns,
                },
                {
                    type: 'text',
                    left: 'center',  // Center the text horizontally in the chart
                    top: '70%',      // Position the text below the animated columns
                    style: {
                        text: `Loading ${props.title}...`,
                        font: 'bold 12px sans-serif',
                        fill: '#333',
                        textAlign: 'center',
                        textVerticalAlign: 'top',
                    }
                }, 
            ],
        }
    };

    myChart.setOption(option, true);
}

async function showChart() {
    if (!props.yData) return;

    // add type and emphasis to yData
    const yData = props.yData.map((value: any) => ({
        ...value,
        type: 'line',
        emphasis: {
            focus: 'series',
        },
    }));

    var option = {
        title: {
            text: props.title,
            left: 'center',
            top: '5',
            textStyle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333',
                lineHeight: 16
            },
        },
        tooltip: {
            trigger: 'item',
            formatter: props.tooltipFormatter,
            textStyle: {
                fontSize: 12
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '6%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: props.xData,
            axisLabel: {
                interval: 0,
                rich: {
                    line1: {
                        fontSize: 12,
                        color: '#333',
                    },
                    line2: {
                        fontSize: 10,
                        color: '#666',
                    }
                },
                align: 'center',
                lineHeight: 14,
            }
        },
        yAxis: {
            type: 'value',
        },
        series: yData,
        backgroundColor: 'transparent',
        legend: {
            show: true,
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            bottom: '0',
        }
    };

    // myChart.hideLoading();
    myChart.setOption(option, true);
}

onUnmounted(() => {
    if (windowResizeObserver) {
        window.removeEventListener('resize', windowResizeObserver);
    }
});

// watch both chartDiv and area and then show the chart
watch([chartDiv, () => props.yData], ([chartDiv, _data], [_oldChartDiv, _oldData]) => {
    if (!chartDiv) return;
    showChart();
});
</script>

<template>
    <div
        ref="chartDiv"
        class="h-96 w-full"
    />
</template>