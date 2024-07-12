<script
    setup
    lang="ts"
>
// import * as L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-bing-layer';

import { ref, onMounted } from 'vue';

import { useProjectStore } from '../../stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

import TabTemplate from '../TabTemplate.vue';

import { roundToPrecisionAsString } from '@/lib/util';

// import SnailChart from '@/components/charts/SnailChart.vue';

import { getProjectAreas } from '@/firebase/functions';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();
const menus = useMenusStore().menus;

function getLastTargetArea() {
    const registration = store.project.project;
    const targetAreaDesignPhase = registration.targetAreaDesignPhase;
    const targetAreaReviewPhase = registration.targetAreaReviewPhase;
    const targetAreaEvaluationPhase = registration.targetAreaEvaluationPhase;

    return targetAreaEvaluationPhase || targetAreaReviewPhase || targetAreaDesignPhase;
}

const areaByGefIndicator = store.areaByGefIndicator();
// const areaForGefIndicator3 = areaByGefIndicator.reduce((total, [indicator, area]) => {
//     if (indicator.startsWith('GEF3')) return total + area;
//     return total;
// }, 0);

// const chartLabels = areaByGefIndicator.map(([label, _]) => getRecursiveMenuLabel(label, menus.gefIndicators));

let chartData: { value: number, name: string }[] = [];
if (store.project.reportingLine === 'GEF') {
    chartData = areaByGefIndicator.map(([label, value]) => {
        return {
            value,
            name: getRecursiveMenuLabel(label, menus.gefIndicators) || label
        };
    });
} else {
    chartData = [
        {
            value: store.project.project.areaUnderRestoration || 0,
            name: 'Area under restoration'
        },
        {
            value: store.project.project.targetArea - (store.project.project.areaUnderRestoration || 0),
            name: 'Not achieved'
        }
    ];
}


// const chartData = areaByGefIndicator.map(([label, value]) => {
//     return {
//         value,
//         name: label
//     };
// })

const totalArea = chartData.reduce((total, { value }) => total + value, 0);
if (totalArea < getLastTargetArea()) {
    chartData.push({
        value: getLastTargetArea() - totalArea,
        name: 'Not achieved'
    });
}

// import 'maplibre-gl/dist/maplibre-gl.css';
// import { Map } from 'maplibre-gl';

import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { BarChart } from 'echarts/charts';
import { PieChart } from 'echarts/charts';

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

import type { GeoJSONObject } from 'ol/format/GeoJSON';

echarts.use([
    PieChart,
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


onMounted(async () => {
    initMap();
    initChart();
    if (store.project.reportingLine === 'GEF') {
        initCICharts();
    }
});

const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0
});

const chartDiv = ref(null);
async function initChart() {
    if (!chartDiv.value) return;

    const myChart = echarts.init(chartDiv.value);
    const option = {
        tooltip: {
            trigger: 'item',
            // format the number with no decimals
            formatter: function (params: any) {
                const value = params.value;
                return `${getRecursiveMenuLabel(params.name, menus.gefIndicators) || params.name}:<br>${numberFormatter.format(value)} ${store.project.project.areaUnits || ''}`;
            },
            confine: 'true',
            textStyle: {
                overflow: 'breakAll',
                width: 40,
            },
            extraCssText: 'max-width: 200px; white-space: normal;',
            // formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            // type: 'plain',
            // orient: 'vertical',
            // itemWidth: 20,
            textStyle: {
                itemWidth: 20,
                rich: {
                    fw600: {
                        fontWeight: 600,
                    },
                },
            },
            formatter: (name: string) => {
                if (store.project.reportingLine === 'GEF')
                    name === 'Not achieved' ? 'Not achieved' : name.slice(3)
                else {
                    return name;
                }
            }
            // formatter: function (name: string) {
            //     const maxLength = 60; // Maximum length of legend text
            //     const truncatedName = name.length > maxLength ? name.substring(0, maxLength - 3) + '...' : name;
            //     const value = 1000;
            //     return `${truncatedName}:\n{fw600|${value}}`;
            // },
            // top: '5%',
            // left: '40%',
            // bottom: 0,
        },
        // legend: {
        // Try 'horizontal'
        // right: 10,
        // top: 'center'
        // },
        series: [
            {
                name: 'Area',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 0
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold',
                        formatter: (params: any) => {
                            return numberFormatter.format(params.value) + ' ' + (store.project.project.areaUnits || '');
                        }
                    },
                },
                labelLine: {
                    show: false
                },
                data: chartData,
                // center: ['50%', '50%']
            }
        ]
    };

    option && myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

const ciChartDiv = ref(null);
const showCIChart = ref(true);
function initCICharts() {
    if (!ciChartDiv.value) return;

    // return if not GEF
    if (store.project.reportingLine !== 'GEF') return;

    const achievedAreaByCoreIndicatorGroup = store.areaByGefIndicatorGroup();
    function findAchievedAreaByCoreIndicator(label: string) {
        return achievedAreaByCoreIndicatorGroup.find(([l, _]) => label === l)?.[1] || 0;
    }

    const achievedData = [
        findAchievedAreaByCoreIndicator('1'),
        findAchievedAreaByCoreIndicator('2'),
        findAchievedAreaByCoreIndicator('3'),
        findAchievedAreaByCoreIndicator('4'),
        findAchievedAreaByCoreIndicator('5'),
        findAchievedAreaByCoreIndicator('2LDCF')
    ];
    const committedData = [
        store.project.project.targetAreaCoreIndicator1 || 0,
        store.project.project.targetAreaCoreIndicator2 || 0,
        store.project.project.targetAreaCoreIndicator3 || 0,
        store.project.project.targetAreaCoreIndicator4 || 0,
        store.project.project.targetAreaCoreIndicator5 || 0,
        store.project.project.targetAreaCoreIndicator2LDCF || 0,
    ];
    const yAxisData = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '2LDCF'
    ];

    // delete the items from the three arrays above when achievedData is 0 and committedData is 0
    for (let i = 0; i < achievedData.length; i++) {
        if (achievedData[i] === 0 && committedData[i] === 0) {
            achievedData.splice(i, 1);
            committedData.splice(i, 1);
            yAxisData.splice(i, 1);
            i--;
        }
    }

    if (achievedData.length === 0) {
        showCIChart.value = false;
        return;
    };

    var myChart = echarts.init(ciChartDiv.value);

    const option = {
        // title: {
        //     text: 'Area achieved by GEF Core Indicators',
        // },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            valueFormatter: (value: number) => numberFormatter.format(value)
        },
        legend: {
            // bottom: 0,
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
        },
        yAxis: {
            type: 'category',
            data: yAxisData,
        },
        series: [
            {
                name: 'Committed',
                type: 'bar',
                data: committedData
            },
            {
                name: 'Achieved',
                type: 'bar',
                data: achievedData
            }
        ],
        itemStyle: {
            borderRadius: 3,
        },

    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

async function initMap() {
    const { Map } = await google.maps.importLibrary('maps');
    const map = new Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        disableDefaultUI: true,
        // satellite map
        mapTypeId: 'hybrid'
    });

    //load the json data
    const area = await getProjectAreas(store.id!);
    // if area is not a valid GeoJSON object, return
    if (!area) {
        return;
    }

    const geojson = {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            properties: {},
            geometry: area
        }]
    }

    // let geojson;
    // // area is a GeometryCollection, wrap in a FeatureCollection
    // if (area.type === 'GeometryCollection') {
    //     geojson = {
    //         type: 'FeatureCollection',
    //         features: area.geometries.map((geometry: any) => ({
    //             type: 'Feature',
    //             properties: {},
    //             geometry
    //         })),
    //     };
    // }


    map.data.addGeoJson(geojson);

    map.data.setStyle({
        fillColor: '#ff0000',
        fillOpacity: 0,
        strokeColor: '#EEA63A',
        strokeWeight: 2,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#fff',
            fillOpacity: 0.67,
            strokeColor: '#EEA63A',
            strokeWeight: 2,
            scale: 4,
        },
    });

    // const jsonLayer = new google.maps.Data({ map });
    // jsonLayer.addGeoJson(geojson);

    // zoom to the layer
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach((feature) => {
        feature.getGeometry().forEachLatLng((latLng) => {
            bounds.extend(latLng);
        });
    });
    // zoom slowly to the layer
    map.fitBounds(bounds);

    // jsonLayer.setStyle({
    //     fillColor: '#ff0000',
    //     fillOpacity: 0,
    //     color: '#ff7800',
    //     strokeWeight: 2
    // });

    // // map.data.setMap(map)

    // // Add marks from the points array
}


// async function initMap() {
//     const map = L.map('map').setView([0, 0], 2);

//     L.tileLayer.bing(import.meta.env.VITE_BING_KEY).addTo(map)
//     const areaFetchPromise = getProjectAreas(store.id!);

//     var myStyle = {
//         "color": "#FFCC00",
//         "weight": 2,
//         "opacity": 0.9,
//         "fillOpacity": 0
//     };


//     const area = await areaFetchPromise as GeoJSONObject;
//     // if area is not a valid GeoJSON object, return
//     if (!area) {
//         return;
//     }

//     const jsonLayer = L.geoJSON(area, {
//         pointToLayer: function (_feature, latlng) {
//             return L.circleMarker(latlng, {
//                 radius: 1,
//                 fillColor: "#ff0000",
//                 color: "#ff7800",
//                 weight: 1,
//                 opacity: 1,
//                 fillOpacity: 0.8
//             });
//         },
//         style: myStyle
//     });

//     map.flyToBounds(jsonLayer.getBounds(), {
//         padding: [10, 10],
//     });

//     map.once('zoomend', function () {
//         jsonLayer.addTo(map);
//     });

// MapLibre

// const map = new Map({
//     container: 'map', // container id
//     style: {
//         'version': 8,
//         'sources': {
//             'raster-tiles': {
//                 'type': 'raster',
//                 'tiles': [
//                     // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
//                     // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
//                     'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
//                 ],
//                 'tileSize': 256,
//                 'attribution':
//                     'Map tiles by <a target="_blank" href="http://stamen.com">Stamen Design</a>; Hosting by <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>. Data &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
//             }
//         },
//         'layers': [
//             {
//                 'id': 'simple-tiles',
//                 'type': 'raster',
//                 'source': 'raster-tiles',
//                 'minzoom': 0,
//                 'maxzoom': 22
//             }
//         ]
//     },
//     center: [-74.5, 40], // starting position
//     zoom: 2 // starting zoom
// });
// }

// async function fetchProjectPolygonsArea() {
//     return fetch(
//         `https://europe-west3-fao-ferm.cloudfunctions.net/get_project_areas_json?project_id=${store.id}`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${auth.user.accessToken}`
//         }
//     }).then(response => response.json()).then(area => {
//         return area;
//     });
// }

// onUnmounted(() => {
//     map.remove();
// });
</script>


<template>
    <TabTemplate title="Results">
        <template #description>
            In this section you can see a summary of the results of your restoration initiative, such as:
            <ul class="list-disc list-inside">
                <li>The progress in the extent of the restoration area</li>
                <li>The proportion of area of each ecosystem under restoration</li>
                <li>The progress of the indicators</li>
            </ul>
        </template>
        <template #default>
            <div
                id="map"
                class="rounded shadow-md border border-gray-100 mt-4 w-full"
                style="height: 400px"
            ></div>
            <!-- Non GEF charts -->
            <div
                v-if="store.project.reportingLine !== 'GEF'"
                class="flex flex-col gap-6 mt-6"
            >
                <div
                    v-if="store.project.project.targetArea && store.project.project.areaUnderRestoration"
                    class="shadow-md rounded px-4 py-3 text-base border"
                >
                    <div
                        id="chart"
                        ref="chartDiv"
                        class="shadow-md rounded px-4 py-3 text-base border h-64 w-full"
                    ></div>
                    <!-- <SnailChart
                        :values="[store.project.project.areaUnderRestoration]"
                        :labels="['Area under restoration']"
                        :unit="store.project.project.areaUnits"
                        :targetValue="store.project.project.targetArea"
                        not-achieved-label="Area committed not under restoration"
                    /> -->
                    <p class="mt-4 text-center font-bold text-gray-800">Congratulations! Your project has achieved {{ roundToPrecisionAsString(store.project.project.areaUnderRestoration / store.project.project.targetArea * 100) }}% of your total committed land ({{ store.project.project.targetArea }} {{ store.project.project.areaUnits || '' }}).</p>
                </div>
                <div
                    v-else
                    class="pt-6 font-bold text-xl"
                >
                    Committed area to restore or Total area under restoration not selected in the Area & Ecosystems tab.
                </div>
            </div>

            <!-- GEF charts -->
            <div
                v-else-if="chartData.length > 0 && getLastTargetArea()"
                class="flex flex-col gap-6 mt-6"
            >

                <template v-if="store.project.project.areaAchievedMatch === 1">
                    <div
                        v-if="chartData.length > 0 && getLastTargetArea()"
                        id="chart"
                        ref="chartDiv"
                        class="shadow-md rounded px-4 py-3 text-base border h-64 w-full"
                    />
                    <div
                        ref="ciChartDiv"
                        v-if="showCIChart"
                        class="shadow-md rounded px-4 py-3 text-base border h-64 w-full"
                    />

                    <!-- <SnailChart
                        v-if="chartValues.length > 0 && getLastTargetArea()"
                        :values="chartValues"
                        :labels="chartLabels h-64 w-full"
                        :targetValue="getLastTargetArea()"
                    /> -->
                    <p class="mt-4 text-center font-bold text-gray-800">Congratulations! Your project has {{ Math.trunc(store.polygonsArea() / getLastTargetArea() * 100) }}% of committed land under restoration.</p>
                </template>
                <!-- <div
                    v-else
                    class="shadow-md rounded px-4 py-3 text-base border"
                >
                    <!- - <SnailChart
                        :values="[]"
                        :labels="[] h-64 w-full"
                    /> - ->
                    <div
                        id="chart"
                        ref="chartDiv"
                        class="shadow-md rounded px-4 py-3 text-base border h-64 w-full"
                    ></div>
                </div> -->

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-green-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Area of land committed in last project phase</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-green-light/20">
                        <div class="col-span-2">Target area in last project phase</div>
                        <div class="col-span-1">{{ roundToPrecisionAsString(getLastTargetArea(), 2) }} Ha</div>
                    </div>
                </div>

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-mustard-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Total area of land achieved during project implementation</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-mustard-light/20">
                        <!-- <div class="col-span-2">Total area of land achieved (tabular format)</div>
                        <div class="col-span-1">{{ roundToPrecisionAsString(store.project.project.areaAchieved, 2) }} Ha</div> -->
                        <div class="col-span-2">Total area of land achieved (spatially explicit format)</div>
                        <div class="col-span-1">{{ roundToPrecisionAsString(store.polygonsArea(), 2) }} Ha</div>
                    </div>
                </div>

                <div class="shadow-lg rounded border divide-y">
                    <div class="px-4 py-5 sm:px-6 bg-ferm-blue-light/70 rounded-t">
                        <h3 class="text-lg font-semibold leading-6 text-gray-900">Total area of land achieved per GEF CORE Indicator 1&#8209;5</h3>
                    </div>

                    <div class="grid grid-cols-3 gap-4 px-4 py-5 sm:px-6 bg-ferm-blue-light/20">
                        <template v-for="[indicator, area] in areaByGefIndicator">
                            <div class="col-span-2">{{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}</div>
                            <div class="col-span-1">{{ roundToPrecisionAsString(area, 2) }} Ha</div>
                        </template>
                    </div>
                </div>


                <!-- <div class="shadow rounded px-4 py-3 border bg-slate-50">
                    <div class="grid grid-cols-6 gap-4">
                        <div class="col-span-2"><!- -Total area of land achieved- -></div>
                        <div class="col-span-4 font-bold text-lg">Total area of land achieved per GEF CORE Indicator 1&#8209;5</div>
                        <template v-for="[indicator, area] in areaByGefIndicator">
                            <div class="col-span-2 font-bold">{{ getRecursiveMenuLabel(indicator, menus.gefIndicators) }}</div>
                            <div class="col-span-2">{{ formatNumber(area, true) }}</div>
                            <div class="col-span-2">Ha</div>
                        </template>
                    </div>
                </div> -->
            </div>
            <div
                v-else
                class="flex flex-col gap-6 pt-6 font-bold text-xl"
            >
                Not enough data to show results
            </div>
        </template>
    </TabTemplate>
</template>
