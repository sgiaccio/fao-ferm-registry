<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

// Import the JSON files
import worldJson from '@/assets/world_stylized.json';
import data from '@/assets/dashboard_data.json';
import { geoWinkel3 } from 'd3-geo-projection';

import echartConfig from '@/assets/echarts/themes/dark.json'
echarts.registerTheme('dark', echartConfig)

// set a dark background for the body
// document.body.style.backgroundColor = '#1a202c';

const chartRef = ref(null);
const countryChartRefs = ref([]);
const selectedCountry = ref(null);

// Process world JSON data
const worldJsonFeatures = worldJson.features.map(f => ({
    ...f,
    properties: {
        ...f.properties,
        name: f.properties?.nam_en,
    },
}));
worldJson.features = worldJsonFeatures;

// Prepare map data
// const minCommittedArea = Math.min(...data.map(d => d.commitment?.area || 0));
const maxCommittedArea = Math.max(...data.map(d => d.commitment?.area).filter(d => d));

data.forEach(d => {
    console.log(d.commitment?.area);
});

function formatNumber(value) {
    if (value >= 1e9) {
        return (value / 1e9).toFixed(2) + ' G';
    } else if (value >= 1e6) {
        return (value / 1e6).toFixed(2) + ' M';
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(2) + ' k';
    } else {
        return value.toFixed(2);
    }
}

const mapData = worldJson.features.map((f, i) => {
    const found = data.find(d => d.iso2 === f.properties.iso2cd);
    return {
        name: f.properties?.nam_en || i,
        value: found?.commitment?.area || null,
        iso2: f.properties.iso2cd,
    };
});

const colorList = [
    '#5470C6', '#91CC75', '#EE6666', '#73C0DE',
    '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC',
    // Add more colors if needed
];

// Placeholder icon URL (can be replaced with actual image paths)
// const placeholderIcon = '/path/to/placeholder_icon.png';

// Map of sources to icon URLs
const iconMap = {
    'Restoration barometer': '/interop_logos/rb.svg',
    // 'FRA': '/path/to/fra_icon.png',
    'FERM': '/interop_logos/ferm.svg',
    'RESTOR': '/interop_logos/restor.svg',
    'ORR': '/interop_logos/orr.png',
    'GEF': '/interop_logos/gef.svg',
};

onMounted(() => {
    if (!chartRef.value) return;

    const projection = geoWinkel3();

    const chartDom = chartRef.value;
    const mapChart = echarts.init(chartDom, 'dark');

    echarts.registerMap('world', worldJson);
    const option = {
        tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2,
        },
        visualMap: {
            left: 'right',
            top: 'top',
            min: 0,
            max: maxCommittedArea,
            inRange: {
                color: [
                    '#313695',
                    '#4575b4',
                    '#74add1',
                    '#abd9e9',
                    '#e0f3f8',
                    '#ffffbf',
                    '#fee090',
                    '#fdae61',
                    '#f46d43',
                    '#d73027',
                    '#a50026',
                ],
            },
            calculable: true,
        },
        series: [
            {
                name: 'Committed area',
                type: 'map',
                itemStyle: {
                    areaColor: '#f3f3f3',
                },
                roam: false,
                map: 'world',
                emphasis: {
                    label: {
                        show: true,
                    },
                },
                projection: {
                    project: point => projection(point),
                    unproject: point => projection.invert(point),
                },
                data: mapData,
            },
        ],
    };

    mapChart.on('click', function (params) {
        const countryData = data.find(d => d.iso2 === params.data.iso2);
        selectedCountry.value = countryData;
    });

    mapChart.setOption(option);

    window.addEventListener('resize', () => {
        mapChart.resize();
    });
});

watch(selectedCountry, (newVal) => {
    if (!newVal) return;

    nextTick(() => {
        // Initialize charts for each area under restoration
        if (newVal.areaUnderRestoration?.length > 0) {
            newVal.areaUnderRestoration.forEach((restoration, index) => {
                const chartDom = countryChartRefs.value[index];
                if (!chartDom) return;

                const chartInstance = echarts.init(chartDom);

                // Prepare chart data
                const chartData = restoration.breakdown
                    ? restoration.breakdown.map(item => ({
                        name: item.type,
                        value: item.area,
                    }))
                    : [{ name: 'Area', value: restoration.area }];

                // Configure the chart options
                // const option = {
                //     title: {
                //         text: restoration.source || `Restoration Data ${index + 1}`,
                //         left: 'center',
                //     },
                //     tooltip: {
                //         trigger: 'item',
                //     },
                //     legend: {
                //         top: 'bottom',
                //     },
                //     series: [
                //         {
                //             name: 'Area',
                //             type: 'pie',
                //             radius: '50%',
                //             data: chartData,
                //             emphasis: {
                //                 itemStyle: {
                //                     shadowBlur: 10,
                //                     shadowOffsetX: 0,
                //                     shadowColor: 'rgba(0, 0, 0, 0.5)',
                //                 },
                //             },
                //             label: {
                //                 formatter: '{b}: {c} ha ({d}%)',
                //             },
                //         },
                //     ],
                // };


                const option = {
                    title: {
                        // Use an image as the title
                        text: '',
                        left: 'center',
                        top: '5%',
                        left: 'left',
                        // Title style is left empty since we're adding an icon via the graphic component
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow', // Displays a shadow to indicate the axis pointer
                        },
                        formatter: function (params) {
                            const param = params[0]; // Since trigger is 'axis', params is an array
                            const name = param.name;
                            const value = param.value;
                            return `${name}: ${formatNumber(value)} ha`;
                        },
                    },
                    legend: {
                        show: false, // Hide the legend if not needed
                    },
                    grid: {
                        left: '80', // Adjust grid to accommodate labels
                        // containLabel: true,
                        right: '10%',
                        top: '25%', // Adjust top to make space for the icon
                        bottom: '10%',
                    },
                    xAxis: {
                        type: 'value',
                        // name: 'Area (ha)',
                    },
                    yAxis: {
                        type: 'category',
                        data: chartData.map(item => item.name),
                        axisLabel: {
                            interval: 0,
                            align: 'right',
                        },
                    },
                    series: [
                        {
                            name: 'Area',
                            type: 'bar',
                            data: chartData.map((item, idx) => ({
                                value: item.value,
                                itemStyle: {
                                    color: colorList[idx % colorList.length],
                                    borderRadius: [0, 10, 10, 0],
                                },
                            })),
                            label: {
                                show: true,
                                position: 'right',
                                // formatter: '{c} ha',
                                // use k mega, giga, etc.
                                formatter: function (params) {
                                    return formatNumber(params.value) + ' ha';
                                },
                            },
                            emphasis: {
                                focus: 'series',
                            },
                        },
                    ],
                };

                const source = restoration.source;
                if (iconMap[source]) {
                    // Add a graphic component to display the icon in place of the title
                    option.graphic = {
                        type: 'image',
                        id: 'logo',
                        left: 'left',
                        top: '5%',
                        z: 10,
                        bounding: 'raw',
                        origin: [75, 75],
                        style: {
                            image: iconMap[source],
                            // width: 150,
                            height: 40,
                            opacity: 1,
                        },
                    };
                } else {
                    // Use a text title if no icon is available
                    option.title.text = source;
                }

                // Set the chart option
                chartInstance.setOption(option);

                // Handle window resize
                window.addEventListener('resize', () => {
                    chartInstance.resize();
                });
            });
        } else {
            // Handle case where there is no areaUnderRestoration data
            console.log('No restoration data available for this country.');
        }
    });
});
</script>

<template>
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
        <div class="mx-auto max-w-5xl">
            <div class="mt-12 mb-6">
                <h1 class="text-7xl font-bold font-akrobat uppercase text-center text-gray-700">FERM Country Dashboard</h1>
            </div>
            <div
                ref="chartRef"
                class="w-full aspect-video shadow rounded-xl border"
            />
            <!-- Restoration Charts -->
            <div v-if="selectedCountry">
                <!-- <h2 class="mt-4 text-xl font-bold">
                    {{ selectedCountry.country }} Restoration Data
                </h2> -->
                <div class="grid grid-cols-2 gap-6 mt-6">
                    <div
                        v-for="(restoration, index) in selectedCountry.areaUnderRestoration"
                        :key="index"
                        :ref="el => (countryChartRefs[index] = el)"
                        class="border rounded-lg shadow w-full aspect-video p-4"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
