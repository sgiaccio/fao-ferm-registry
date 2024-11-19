<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
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
    loading?: boolean
    unit?: string
}>();

echarts.use([
    BarChart,
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
    showLoading();

    windowResizeObserver = () => myChart.resize();
    window.addEventListener('resize', windowResizeObserver);

    watch(() => props.loading, () => {
        if (props.loading) {
            showLoading();
        }
    }, { immediate: true });
});

function showLoading() {
    const columns = [];
    for (let i = 0; i < 7; i++) {
        columns.push({
            type: 'rect',
            x: i * 8,
            shape: {
                x: 0,
                y: -20,
                width: 5,
                height: 40
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
                    top: '60%',      // Position the text below the animated columns
                    style: {
                        text: `Loading ${props.title}`,
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

    const series = {
        type: 'bar',
        barWidth: '66%',
        data: props.yData,
        emphasis: {
            focus: 'series',
        },
        itemStyle: {
            color: '#0d6526'
        }
    };

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
            trigger: 'axis',
            confine: true,
            appendTo: document.querySelector('body'),
            textStyle: {
                width: 100,
                overflow: 'truncate',
                fontSize: 12
            },
            valueFormatter: (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 2 }) + (props.unit ? ` ${props.unit}` : ''),
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '6%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            // boundaryGap: true,
            data: props.xData,
            axisLabel: {
                // rotate: 45,
                margin: 20,
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
        series,
        backgroundColor: 'transparent',
        legend: {
            show: true,
            type: 'scroll',
            orient: 'horizontal',
            left: 'center',
            bottom: '0',
        }
    };

    myChart.setOption(option, true);
}

onUnmounted(() => {
    if (windowResizeObserver) {
        window.removeEventListener('resize', windowResizeObserver);
    }
});

// watch both chartDiv and area and then show the chart
watch([chartDiv, () => props.yData], ([chartDiv, _data]) => {
    if (chartDiv) showChart();
});
</script>

<template>
    <div
        ref="chartDiv"
        class="h-96 w-full"
    />
</template>
