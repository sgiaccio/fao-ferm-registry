<script setup lang="ts">
import { ref, onMounted } from 'vue';

import * as echarts from 'echarts/core';
import { GaugeChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent, GridComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';


import { formatNumber } from '@/lib/util';


echarts.use([
    GaugeChart,
    TooltipComponent,
    TitleComponent,
    GridComponent,
    SVGRenderer
]);

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
    const myChart = echarts.init(chartRef.value, null, { renderer: 'svg' });

    const option = {
        tooltip: {
            show: true, // Enable tooltips
            formatter: (params: any) => `${params.seriesName}: ${params.data.value} ${props.units}`
        },
        series: [
            {
                name: 'Committed Area',
                type: 'gauge',
                center: ['50%', '65%'],
                radius: '95%',
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: Math.max(props.targetArea, props.areaUnderRestoration),
                splitNumber: 1,
                itemStyle: {
                    color: '#F77F00'
                },
                progress: {
                    show: true,
                    width: 40
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
                            '{label|Committed}',
                            `{value|${formattedValue} ${props.units}}`,
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            fontSize: 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: 28
                        },
                        label: {
                            fontSize: 16,
                            color: '#888',
                            fontWeight: 'bold',
                            lineHeight: 16
                        }
                    },
                    color: 'inherit'
                },

                data: [
                    {
                        value: Math.round(props.targetArea),
                    }
                ]
            },
            {
                name: 'Area Under Restoration',
                type: 'gauge',
                center: ['50%', '65%'],
                radius: '95%',
                startAngle: 200,
                endAngle: -20,
                min: 0,
                max: Math.max(props.targetArea, props.areaUnderRestoration),
                zlevel: 1,
                itemStyle: {
                    color: '#007F5F'
                },
                progress: {
                    show: true,
                    width: 16
                },
                pointer: {
                    icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                    length: '8%',
                    width: 14,
                    offsetCenter: [0, '-62%'],
                    itemStyle: {
                        color: '#007F5F'
                        // color: 'rgba(0, 0, 0, 0.5)'
                    }
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
                    offsetCenter: [0, '5%'],
                    fontWeight: 'bolder',
                    formatter: function (value: number) {
                        const formattedValue = formatNumber(value);
                        return [
                            '{label|Under Restoration}',
                            `{value|${formattedValue} ${props.units}}`
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            fontSize: 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: 28
                        },
                        label: {
                            fontSize: 16,
                            color: '#888',
                            fontWeight: 'bold',
                            lineHeight: 16
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