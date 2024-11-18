<script setup lang="ts">
import { ref, onMounted } from 'vue';

import * as echarts from 'echarts';

import { formatNumber } from '@/lib/util';


const props = withDefaults(defineProps<{
    areaUnderRestoration: number
    targetArea: number
    units: string
}>(), {
    units: ''
});

const chartRef = ref<HTMLElement | null>(null);

onMounted(() => {
    if (!chartRef.value) return;

    initChart();
});

function initChart() {
    const myChart = echarts.init(chartRef.value);

    const option = {
        tooltip: {
            show: true, // Enable tooltips
            formatter: function (params) {
                // Access the value from the hovered data
                const fullValue = params.data.value;
                return `${params.seriesName}: ${fullValue} ${props.units}`;
            }
        },
        series: [
            {
                name: 'Committed Area', // Corresponds to the legend item
                type: 'gauge',
                center: ['50%', '65%'],
                radius: '95%',
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: Math.max(props.targetArea, props.areaUnderRestoration),
                splitNumber: 1,
                itemStyle: {
                    color: '#007F5F'
                },
                progress: {
                    show: true,
                    width: 30
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                anchor: {
                    show: false
                },
                title: {
                    show: false
                },
                detail: {
                    valueAnimation: true,
                    width: '60%',
                    lineHeight: 40,
                    borderRadius: 8,
                    offsetCenter: [0, '-35%'],
                    // fontSize: 36,
                    fontWeight: 'bolder',
                    formatter: function (value: number) {
                        const formattedValue = formatNumber(value);
                        return [
                            `{value|${formattedValue} ${props.units}}`,
                            '{label|Committed}'
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            fontSize: 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: 36
                        },
                        label: {
                            fontSize: 18,
                            color: '#666',
                            fontWeight: 'bold',
                            lineHeight: 18
                        }
                    },
                    color: 'inherit'
                },

                data: [
                    {
                        value: props.targetArea,
                    }
                ]
            },
            {
                name: 'Area Under Restoration', // Corresponds to the legend item
                type: 'gauge',
                center: ['50%', '65%'],
                radius: '95%',
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: Math.max(props.targetArea, props.areaUnderRestoration),
                zlevel: 1,
                itemStyle: {
                    color: '#F77F00'
                },
                progress: {
                    show: true,
                    width: 15
                },
                pointer: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                detail: {
                    valueAnimation: true,
                    width: '60%',
                    lineHeight: 40,
                    borderRadius: 8,
                    offsetCenter: [0, '10%'],
                    fontWeight: 'bolder',
                    formatter: function (value: number) {
                        const formattedValue = formatNumber(value);
                        return [
                            `{value|${formattedValue} ${props.units}}`,
                            '{label|Under Restoration}'
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            fontSize: 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: 36
                        },
                        label: {
                            fontSize: 18,
                            color: '#666',
                            fontWeight: 'bold',
                            lineHeight: 18
                        }
                    },
                    color: 'inherit'
                },
                data: [
                    {
                        value: Math.round(props.areaUnderRestoration)
                    }
                ]
            }
        ]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}
</script>

<template>
    <div
        ref="chartRef"
        class="w-full h-80 shadow-md rounded-lg border border-gray-100 bg-white"
    />
</template>