<script
    setup
    lang="ts"
>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';


const chartDiv = ref();

const props = withDefaults(defineProps<{
    values: [{
        label: number,
        value: number
    }],
    legend: string,
    unit: string,
    nDecimals: number
}>(), {
    nDecimals: 1
});

let resizeHandler: any;

onMounted(() => {
    const chart = echarts.init(chartDiv.value);
    chart.setOption({
        // title: {
        //     text: 'Temperature Change in the Coming Week'
        // },
        tooltip: {
            trigger: 'axis',
            valueFormatter: (value: number) => value.toFixed(props.nDecimals) + ' ' + props.unit,
            confine: true
        },
        legend: { show: false },
        // toolbox: {
        //     show: true,
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: 'none'
        //         },
        //         dataView: { readOnly: false },
        //         magicType: { type: ['line', 'bar'] },
        //         restore: {},
        //         saveAsImage: {}
        //     }
        // },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: props.values.map((v) => v.label)
        },
        yAxis: {
            type: 'value',
            name: props.unit,
            nameLocation: 'middle',
            nameGap: 35,
            // axisLabel: {
            //     formatter: '{value}'
            // },
            min: function (value) {
                return Math.ceil(value.min - 1);
            }
        },
        series: [
            {
                name: props.legend,
                type: 'line',
                data: props.values.map((v) => v.value),
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                    ],
                    label: {
                        formatter: (params: any) => params.value.toFixed(props.nDecimals)
                    }
                },
                // markLine: {
                //     data: [{ type: 'average', name: 'Avg' }]
                // }
            },
            // {
            //     name: 'Lowest',
            //     type: 'line',
            //     data: [1, -2, 2, 5, 3, 2, 0],
            //     markPoint: {
            //         data: [{ name: '周最低', value: -2, xAxis: 1, yAxis: -1.5 }]
            //     },
            //     markLine: {
            //         data: [
            //             { type: 'average', name: 'Avg' },
            //             [
            //                 {
            //                     symbol: 'none',
            //                     x: '90%',
            //                     yAxis: 'max'
            //                 },
            //                 {
            //                     symbol: 'circle',
            //                     label: {
            //                         position: 'start',
            //                         formatter: 'Max'
            //                     },
            //                     type: 'max',
            //                     name: '最高点'
            //                 }
            //             ]
            //         ]
            //     }
            // }
        ],
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
            id="2"
            class="w-full h-full"
            ref="chartDiv"
        />
    </div>
</template>
