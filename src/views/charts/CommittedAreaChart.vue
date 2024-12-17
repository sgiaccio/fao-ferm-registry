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
    targetLabel?: string
    underRestorationLabel?: string
    title?: string
    size?: string
}>(), {
    units: '',
    targetLabel: 'Committed',
    underRestorationLabel: 'Under Restoration'
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
            show: true,
            confine: true,
            formatter: (params: any) => `${params.seriesName}: ${params.data.value} ${props.units}`,
            appendTo: document.querySelector('body'),
        },
        // title: props.title && {
        //     text: props.title || 'Default Title',
        //     left: 'center',
        //     top: '5%', // Adjust this value to position the title
        //     textStyle: {
        //         fontSize: 16,
        //         fontWeight: 'bold',
        //         color: '#333',
        //     },
        // },
        series: [
            {
                name: 'Committed Area',
                type: 'gauge',
                // center: ['50%', '65%'],
                center: props.size === 'small' ? ['50%', '60%'] : ['50%', '65%'],
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
                    // width: 40
                    width: props.size === 'small' ? 20 : 40
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
                // title: {
                //     show: false
                // },
                title: { show: false },
                detail: {
                    valueAnimation: true,
                    width: '60%',
                    lineHeight: 40,
                    borderRadius: 8,
                    offsetCenter: [0, '-35%'],
                    // offsetCenter: props.size === 'small' ? [0, '100%'] : [0, '-35%'],
                    // fontSize: 36,
                    fontWeight: 'bolder',
                    formatter: function (value: number) {
                        const formattedValue = formatNumber(value);
                        return [
                            `{label|${props.targetLabel}}`,
                            `{value|${formattedValue} ${props.units}}`,
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            // fontSize: 28,
                            fontSize: props.size === 'small' ? 20 : 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: props.size === 'small' ? 20 : 28
                        },
                        label: {
                            // fontSize: 16,
                            fontSize: props.size === 'small' ? 12 : 16,
                            color: '#888',
                            fontWeight: 'bold',
                            lineHeight: props.size === 'small' ? 12 : 16
                        }
                    },
                    color: 'inherit'
                },

                data: [
                    {
                        value: Math.round(props.targetArea),
                        name: props.title
                    }
                ]
            },
            {
                name: 'Area Under Restoration',
                type: 'gauge',
                // center: ['50%', '65%'],
                center: props.size === 'small' ? ['50%', '60%'] : ['50%', '65%'],
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
                    // width: 16
                    width: props.size === 'small' ? 8 : 16
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
                    // offsetCenter: props.size === 'small' ? [0, '60%'] : [0, '5%'],
                    fontWeight: 'bolder',
                    formatter: function (value: number) {
                        const formattedValue = formatNumber(value);
                        return [
                            `{label|${props.underRestorationLabel}}`,
                            `{value|${formattedValue} ${props.units}}`
                        ].join('\n');
                    },
                    rich: {
                        value: {
                            // fontSize: 28,
                            fontSize: props.size === 'small' ? 20 : 28,
                            fontWeight: 'bolder',
                            color: 'inherit',
                            lineHeight: props.size === 'small' ? 20 : 28
                        },
                        label: {
                            // fontSize: 16,
                            fontSize: props.size === 'small' ? 12 : 16,
                            color: '#888',
                            fontWeight: 'bold',
                            lineHeight: props.size === 'small' ? 12 : 16
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
    <div :class="['w-full shadow-md rounded-lg border border-gray-100 bg-white', props.size === 'small' ? 'text-sm grid' : 'text-base']">
        <div
            v-if="props.title"
            class="w-full center text-center font-bold text-gray-600 pt-4"
        >{{ props.title }}</div>
        <div
            ref="chartRef"
            :class="['w-full', props.size === 'small' ? 'h-52 self-end' : 'h-80']"
        ></div>
    </div>
</template>