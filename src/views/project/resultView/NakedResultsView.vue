<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted, computed, watch } from 'vue';

import { useRoute } from 'vue-router'

// import { listProjectFiles, getFileAsBlob } from '@/firebase/storage';
import { getProjectAreas, getProjectAdminAreas, getPublicProject } from '@/firebase/functions';
import { getGaulLevel0 } from '@/firebase/firestore';

// import { useProjectStore } from '@/stores/project';
import { useMenusStore } from '@/stores/menus';
// import { useAuthStore } from '@/stores/auth';

// import { getRecursiveMenuLabel } from '@/lib/util';
// import { roundToPrecisionAsString } from '@/lib/util';
// import SnailChart from '@/components/charts/SnailChart.vue';
// const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
// const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
import { MarkerClusterer } from "@googlemaps/markerclusterer";

// import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';

import ResultPanel from './ResultPanel.vue';
import ActivitiesPanel from './ActivitiesPanel.vue';
import SdgPanel from './SdgPanel.vue';
import AreasCharts from './AreasCharts.vue';
import AlertModal from '@/views/AlertModal.vue';
import SpinningThing from '@/components/SpinningThing.vue';
// import Navbar from '@/views/Navbar.vue';


// import required modules
// import { Navigation } from 'swiper/modules';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});


// const modules = [Navigation]; // Swiper modules

const route = useRoute();
const { menus, getRecursiveMenuItem } = useMenusStore();
// const store = useProjectStore();
// const authStore = useAuthStore();

const countries = ref<{ iso2: string, label: string }[] | null>(null);

const project = ref<any>(null);

onBeforeMount(async () => {
    // await store.fetchProject(route.params.id as string);
    const [fetchedProject, fetchedCountries] = await Promise.all([
        getPublicProject(route.params.id as string),
        getGaulLevel0()
    ]);
    project.value = fetchedProject;
    countries.value = fetchedCountries;
});

onUnmounted(() => {
    // Revoke all object URLs
    uploadedFiles.value.forEach(file => {
        if (file.imageUrl) {
            URL.revokeObjectURL(file.imageUrl);
        }
    });
});

const uploadedFiles = ref<{ name: string, path: string, imageUrl?: string }[]>([]);


// async function getUploadedFiles() {
//     try {
//         const accessToken = await authStore.getIdToken();
//         uploadedFiles.value = await listProjectFiles(route.params.id, "images", accessToken);

//         // Load each file in parallel
//         uploadedFiles.value.forEach(async (file: { name: string, path: string }, index: number) => {
//             try {
//                 const blob = await getFileAsBlob(route.params.id, file.path, accessToken);
//                 const imageUrl = URL.createObjectURL(blob);

//                 // Place the file at the correct index
//                 uploadedFiles.value[index] = { ...file, imageUrl };
//                 // Trigger a reactive update
//                 uploadedFiles.value = [...uploadedFiles.value];
//             } catch (error) {
//                 console.error(`Failed to load file ${file.path}:`, error);
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         alert('Failed to load files: ' + error);
//     }
// }

// GEF
// function getLastTargetArea() {
//     const registration = store.project?.project;
//     const targetAreaDesignPhase = registration.targetAreaDesignPhase;
//     const targetAreaReviewPhase = registration.targetAreaReviewPhase;
//     const targetAreaEvaluationPhase = registration.targetAreaEvaluationPhase;

//     return targetAreaEvaluationPhase || targetAreaReviewPhase || targetAreaDesignPhase;
// }
// const areaByGefIndicator = store.areaByGefIndicator();

let chartData: { value: number, name: string }[] = [];
const chartDiv = ref(null);
watch([project, chartDiv], ([project, chartDiv]) => {
    if (!project || !chartDiv) return;

    // if (project.reportingLine === 'GEF') {
    //     chartData = areaByGefIndicator.map(([label, value]) => {
    //         return {
    //             value,
    //             name: getRecursiveMenuLabel(label, menus.gefIndicators) || label
    //         };
    //     });
    // } else {
    chartData = [
        {
            value: project.project?.areaUnderRestoration || 0,
            name: 'Area under restoration'
        }, {
            value: project.project?.targetArea || 0 - (project.project?.areaUnderRestoration || 0), // TODO
            name: 'Not achieved'
        }
    ];
    // }

    initChart();
    // GEF
    // if (store.project?.reportingLine === 'GEF') {
    //     initCICharts();
    // }
});



// const chartData = areaByGefIndicator.map(([label, value]) => {
//     return {
//         value,
//         name: label
//     };
// })

// const totalArea = chartData.reduce((total, { value }) => total + value, 0);
// if (totalArea < getLastTargetArea()) {
//     chartData.push({
//         value: getLastTargetArea() - totalArea,
//         name: 'Not achieved'
//     });
// }

// import 'maplibre-gl/dist/maplibre-gl.css';
// import { Map } from 'maplibre-gl';

import * as echarts from 'echarts/core';

// Import bar charts, all suffixed with Chart
import { BarChart } from 'echarts/charts';
import { PieChart } from 'echarts/charts';

// Import the tooltip, title, rectangular coordinate system, dataset and transform components
import {
    TooltipComponent,
    GridComponent,
    LegendComponent
} from 'echarts/components';

import echartConfig from './echarts_config.json'
echarts.registerTheme('dark', echartConfig);


// Features like Universal Transition and Label Layout
// import { LabelLayout, UniversalTransition } from 'echarts/features';

// Import the Canvas renderer
// Note that including the CanvasRenderer or SVGRenderer is a required step
import { SVGRenderer } from 'echarts/renderers';

// import type { GeoJSONObject } from 'ol/format/GeoJSON';
// import { babelParse } from 'vue/compiler-sfc';
// import { BackspaceIcon } from '@heroicons/vue/24/outline';
// import { text } from 'd3';

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

const mapDiv = ref<HTMLDivElement | null>(null);

onMounted(async () => {
    if (mapDiv.value) {
        initMap();
    }
    // await getUploadedFiles(); // TODO add getPublicUploadedFiles cloud function
});

// const numberFormatter = new Intl.NumberFormat('en-US', {
//     style: 'decimal',
//     maximumFractionDigits: 0
// });

async function initChart() {
    if (!chartDiv.value) return;

    const myChart = echarts.init(chartDiv.value, 'dark');

    var option = {
        series: [
            {
                type: 'pie',
                data: chartData,
            }
        ],
        backgroundColor: 'transparent',
    };

    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);

    option && myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// GEF
// Core indicators charts
// const ciChartDiv = ref(null);
// const showCIChart = ref(true);
// function initCICharts() {
//     if (!ciChartDiv.value) return;

//     // return if not GEF
//     if (store.project?.reportingLine !== 'GEF') return;

//     const achievedAreaByCoreIndicatorGroup = store.areaByGefIndicatorGroup();
//     function findAchievedAreaByCoreIndicator(label: string) {
//         return achievedAreaByCoreIndicatorGroup.find(([l, _]) => label === l)?.[1] || 0;
//     }

//     const achievedData = [
//         findAchievedAreaByCoreIndicator('1'),
//         findAchievedAreaByCoreIndicator('2'),
//         findAchievedAreaByCoreIndicator('3'),
//         findAchievedAreaByCoreIndicator('4'),
//         findAchievedAreaByCoreIndicator('5'),
//         findAchievedAreaByCoreIndicator('2LDCF')
//     ];
//     const committedData = [
//         store.project?.project.targetAreaCoreIndicator1 || 0,
//         store.project?.project.targetAreaCoreIndicator2 || 0,
//         store.project?.project.targetAreaCoreIndicator3 || 0,
//         store.project?.project.targetAreaCoreIndicator4 || 0,
//         store.project?.project.targetAreaCoreIndicator5 || 0,
//         store.project?.project.targetAreaCoreIndicator2LDCF || 0,
//     ];
//     const yAxisData = [
//         '1',
//         '2',
//         '3',
//         '4',
//         '5',
//         '2LDCF'
//     ];

//     // delete the items from the three arrays above when achievedData is 0 and committedData is 0
//     for (let i = 0; i < achievedData.length; i++) {
//         if (achievedData[i] === 0 && committedData[i] === 0) {
//             achievedData.splice(i, 1);
//             committedData.splice(i, 1);
//             yAxisData.splice(i, 1);
//             i--;
//         }
//     }

//     if (achievedData.length === 0) {
//         showCIChart.value = false;
//         return;
//     };

//     var myChart = echarts.init(ciChartDiv.value);

//     const option = {
//         // title: {
//         //     text: 'Area achieved by GEF Core Indicators',
//         // },
//         tooltip: {
//             trigger: 'axis',
//             axisPointer: {
//                 type: 'shadow'
//             },
//             valueFormatter: (value: number) => numberFormatter.format(value)
//         },
//         legend: {
//             // bottom: 0,
//         },
//         grid: {
//             left: '3%',
//             right: '4%',
//             bottom: '3%',
//             containLabel: true
//         },
//         xAxis: {
//             type: 'value',
//             boundaryGap: [0, 0.01],
//         },
//         yAxis: {
//             type: 'category',
//             data: yAxisData,
//         },
//         series: [
//             {
//                 name: 'Committed',
//                 type: 'bar',
//                 data: committedData
//             },
//             {
//                 name: 'Achieved',
//                 type: 'bar',
//                 data: achievedData
//             }
//         ],
//         itemStyle: {
//             borderRadius: 3,
//         },

//     };

//     myChart.setOption(option);

//     window.addEventListener('resize', () => {
//         myChart.resize();
//     });
// }

let map: google.maps.Map;

const geoJsonLoaded = ref(false);
const geoJsonLoadError = ref(false);

async function initMap() {
    if (!mapDiv.value) return;

    geoJsonLoaded.value = false;
    geoJsonLoadError.value = false;

    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const bounds = {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
    };
    map = new Map(mapDiv.value as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        restriction: {
            latLngBounds: bounds,
            strictBounds: true,
        },

        disableDefaultUI: true,
        // satellite map
        mapTypeId: 'hybrid',
        mapId: 'acfd9aecb62ff17c',
    });

    // Load the json data
    const [geojson, adminGeoJson] = await Promise.all([
        getProjectAreas(route.params.id, true),
        getProjectAdminAreas(route.params.id, true),
    ]).catch((error) => {
        console.error('Failed to load geojson:', error);
        geoJsonLoadError.value = true;
    }).finally(() => {
        geoJsonLoaded.value = true;
    });
    map.data.addGeoJson(geojson);
    map.data.addGeoJson(adminGeoJson);

    // hide by default
    map.data.setStyle({
        visible: false,
    });

    // Add mouseover and mouseout events
    map.data.addListener('mouseover', function (event) {
        map.data.overrideStyle(event.feature, {
            // fillOpacity: 0.3,
            strokeWeight: 4,
        });
    });

    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle(event.feature);
    });

    // zoom to the layer
    if (geojson.features.length > 0 || adminGeoJson.features.length > 0) {
        const layerBounds = new google.maps.LatLngBounds();
        map.data.forEach(feature => {
            feature.getGeometry().forEachLatLng(latLng => {
                layerBounds.extend(latLng);
            });
        });
        map.fitBounds(layerBounds);
        map.setCenter(layerBounds.getCenter());
    }

    function getPseudoCentroid(geometry: google.maps.Data.Geometry) {
        if (geometry.getType() === 'Point') {
            return geometry.get();
        }
        if (geometry.getType() === 'Polygon') {
            const bounds = new google.maps.LatLngBounds();
            geometry.getArray().forEach((path) => {
                path.getArray().forEach((latLng) => {
                    bounds.extend(latLng);
                });
            });
            return bounds.getCenter();
        }
        if (geometry.getType() === 'MultiPolygon') {
            const bounds = new google.maps.LatLngBounds();
            geometry.getArray().forEach((polygon) => {
                polygon.getArray().forEach((path) => {
                    path.getArray().forEach((latLng) => {
                        bounds.extend(latLng);
                    });
                });
            });
            return bounds.getCenter();
        }
        return null;
    }

    const centroidsAndFeatures: { centroid: google.maps.LatLng, feature: google.maps.Data.Feature }[] = [];
    map.data.forEach(feature => {
        const centroid = getPseudoCentroid(feature.getGeometry());
        centroidsAndFeatures.push({ centroid, feature });
    });
    const parser = new DOMParser();
    const pinSvgString = '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="#EEA63A" stroke="white" stroke-width="3" /></svg>';
    const pinSvg = parser.parseFromString(pinSvgString, 'image/svg+xml').documentElement;
    // Center the SVG using CSS
    pinSvg.style.position = 'absolute';
    pinSvg.style.top = '50%';
    pinSvg.style.left = '50%';
    pinSvg.style.transform = 'translate(-50%, -50%)';

    // Create markers based on centroids
    const markers = centroidsAndFeatures.map(({ centroid, feature }) => {

        const marker = new AdvancedMarkerElement({
            position: centroid,
            content: pinSvg.cloneNode(true),
        });

        // Add click listener to highlight related feature
        marker.addListener("click", () => {
            zoomAndHighlightFeature(feature);
        });
        return marker;
    });

    // when not clicking on any marker, reset the style
    map.addListener('click', () => {
        map.data.setStyle({
            visible: false,
        });
    });
    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ markers, map });

}

function zoomToFeature(feature) {
    const bounds = new google.maps.LatLngBounds();
    feature.getGeometry().forEachLatLng(latlng => {
        bounds.extend(latlng);
    });
    map.fitBounds(bounds);
    map.setCenter(bounds.getCenter());
}

function highlightFeature(feature) {
    // Set a style for the highlighted feature
    map.data.setStyle(f => {
        if (f === feature) {
            return {
                fillColor: '#EEA63A',
                fillOpacity: 0,
                strokeColor: '#EEA63A',
                strokeWeight: 2,
            };
        } else {
            return {
                visible: false,
            };
        }
    });
}

function zoomAndHighlightFeature(feature) {
    zoomToFeature(feature);
    highlightFeature(feature);
}

const countriesString = computed(() => {
    if (!countries.value || !project.value.project.countries) return '';
    const countryNames = (project.value.project.countries || []).map((iso2: string) => {
        return countries.value.find(c => c.iso2 === iso2)
    });
    return countryNames.map(c => c.label).join(', ');
});


const timeframe = computed(() => {
    const p = project.value.project;
    if (!p.startingYear && !p.endingYear) return 'No timeframe specified';
    if (p.startingYear && p.endingYear) return `${p.startingYear} – ${p.endingYear}`;
    if (p.startingYear) return `from ${p.startingYear}`;
    if (p.endingYear) return `until ${p.endingYear}`;
});

function zoomToArea(uuid: string) {
    // Look for the feature with the given uuid
    let foundFeature = null;
    map.data.forEach(feature => {
        if (feature.getProperty('uuid') === uuid) {
            foundFeature = feature;
        }
    });

    // zoom to the feature
    if (foundFeature) {
        zoomAndHighlightFeature(foundFeature);
    } else {
        // zoom to the whole layer
        const layerBounds = new google.maps.LatLngBounds();
        map.data.forEach(feature => {
            feature.getGeometry().forEachLatLng(latlng => {
                layerBounds.extend(latlng);
            });
        });
        map.fitBounds(layerBounds);
        map.setCenter(layerBounds.getCenter());
    }
}

const showFullDescription = ref(false);

function formatNumber(n: number) {
    // Use the toLocaleString method to add suffixes to the number
    return n.toLocaleString('en-US', {
        // add suffixes for thousands, millions, and billions
        // the maximum number of decimal places to use
        maximumFractionDigits: 0,
        // specify the abbreviations to use for the suffixes
        notation: 'compact',
        compactDisplay: 'short'
    });
}
</script>

<template>
    <AlertModal
        title="Description"
        :onClose="() => { showFullDescription = false }"
        :open="showFullDescription"
        buttonText="Close"
    >
        <p class="whitespace-pre-wrap text-sm text-gray-800 text-left font-serif">{{ project?.project.description }}</p>
    </AlertModal>
    <header class="top-0 h-20 md:h-24">
        <div class="overflow-hidden bg-slate-200 relative h-20 md:h-24">
            <!-- <img
                src="/seashore.jpg"
                class="w-full h-24 object-cover absolute"
            > -->
            <div class="px-4 sm:px-12 pt-3 md:pt-4">
                <!-- Logos -->
                <div class="relative w-full pl-10 flex">
                    <div class="mb-2 sm:mb-5 mt-2 grid grid-flow-col gap-x-6 mx-auto md:mx-0 divide-x divide-slate-500">
                        <div class="-ml-10 mr-3">
                            <router-link :to="{ name: 'home' }">
                                <img
                                    src="@/assets/FERM_LOGO_MASTER_colour_EN.svg"
                                    alt="FERM logo"
                                    class="h-10 md:h-12 w-auto scale-125"
                                />
                            </router-link>
                        </div>
                        <div>
                            <a
                                href="https://www.decadeonrestoration.org"
                                target="_blank"
                            >
                                <img
                                    src="@/assets/UNDecade_LOGO_MASTER_EN.svg"
                                    alt="FERM logo"
                                    class="h-10 md:h-12 w-auto scale-150 ml-10"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="mx-auto sm:px-6_ lg:px-8_ font-serif h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] border-t border-t-slate-400 bg-slate-100">
        <div class="flex flex-col md:flex-row h-full">
            <div
                id="projectInfo"
                class="h-full w-full md:w-[400px] lg:w-[500px] xl:w-[600px] py-6 pl-4 pr-3 text-gray-800 overflow-auto"
            >
                <div
                    v-if="project"
                    class="space-y-4"
                >
                    <div class="text-gray-800">
                        <div>
                            <h1 class="text-2xl">{{ project.project.title }}</h1>
                        </div>
                        <div class="mt-1 text-base">
                            <p>{{ countriesString }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 font-roboto text-black">
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#589C33]">
                            <div class="flex-0">
                                <svg
                                    class="h-10 w-10 text-green-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <title>forest</title>
                                    <path d="M16 12L9 2L2 12H3.86L0 18H7V22H11V18H18L14.14 12H16M20.14 12H22L15 2L12.61 5.41L17.92 13H15.97L19.19 18H24L20.14 12M13 19H17V22H13V19Z" />
                                </svg>
                            </div>
                            <div class="flex-0 flex items-center">
                                <div>
                                    <span class="font-bold text-3xl mr-1">{{ project.project.targetArea ? formatNumber(project.project.targetArea) : 'n/a' }}</span>
                                    <span class="text-xl">{{ project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Committed area</div>
                            </div>
                        </div>
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#dd6b66]">
                            <div class="flex-0">
                                <svg
                                    class="h-10 w-10 text-red-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <title>sprout</title>
                                    <path d="M2,22V20C2,20 7,18 12,18C17,18 22,20 22,20V22H2M11.3,9.1C10.1,5.2 4,6.1 4,6.1C4,6.1 4.2,13.9 9.9,12.7C9.5,9.8 8,9 8,9C10.8,9 11,12.4 11,12.4V17C11.3,17 11.7,17 12,17C12.3,17 12.7,17 13,17V12.8C13,12.8 13,8.9 16,7.9C16,7.9 14,10.9 14,12.9C21,13.6 21,4 21,4C21,4 12.1,3 11.3,9.1Z" />
                                </svg>
                            </div>
                            <div class="flex-0 flex items-center">
                                <div>
                                    <span class="font-bold text-3xl mr-1">{{ project.project.areaUnderRestoration ? formatNumber(project.project.areaUnderRestoration) : 'n/a' }}</span>
                                    <span class="text-xl">{{ project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Area under restoration</div>
                            </div>
                        </div>
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#69B2BA]">
                            <div class="flex-0">
                                <svg
                                    class="h-10 w-10 text-ferm-blue-light-900"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <title>cactus</title>
                                    <path d="M14,16V21H10V18H9A3,3 0 0,1 6,15V12A1,1 0 0,1 7,11A1,1 0 0,1 8,12V15C8,15.56 8.45,16 9,16H10V6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V14H15A1,1 0 0,0 16,13V11A1,1 0 0,1 17,10A1,1 0 0,1 18,11V13A3,3 0 0,1 15,16H14Z" />
                                </svg>
                            </div>
                            <div class="flex-0 flex items-center">
                                <div class="">
                                    <span class="font-bold text-3xl mr-1">{{ project.project.targetArea && project.project.areaUnderRestoration ? formatNumber(project.project.targetArea - project.project.areaUnderRestoration) : 'n/a' }}</span>
                                    <span class="text-xl">{{ project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Area not achieved</div>
                            </div>
                        </div>
                    </div>

                    <!-- <div
                        v-if="project.project.targetArea && project.project.areaUnderRestoration"
                        id="chart"
                        ref="chartDiv"
                        class="rounded-md text-base h-48 w-full mt-8 overflow-hidden"
                    /> -->

                    <!-- <div class="shadow rounded-lg overflow-hidden aspect-[162/100]">
                        <!- - <div class="absolute bottom-0 px-3 py-2 left-0 right-0 z-50 w-full bg-blend-multiply bg-black/40 text-white">
                            <div>
                                <h1 class="text-2xl">{{ project.project.title }}</h1>
                            </div>
                            <div class="mt-1 text-base">
                                <p>{{ countriesString }}</p>
                            </div>
                        </div> - ->

                        <swiper
                            v-if="uploadedFiles?.length > 0 && uploadedFiles[0]?.imageUrl"
                            :navigation="true"
                            :modules="modules"
                        >
                            <swiper-slide
                                v-for="file in uploadedFiles"
                                :key="file.path"
                            >
                                <img
                                    v-if="file?.imageUrl"
                                    :src="file.imageUrl"
                                    alt="File Image"
                                    class="object-cover aspect-[162/100]"
                                />
                            </swiper-slide>
                        </swiper>
                        <div
                            v-else
                            width="100%"
                            height="100%"
                            class="bg-red-400"
                        />
                    </div> -->

                    <!-- <pre>{{ JSON.stringify(project, null, 2) }}</pre> -->

                    <!-- <Galleria
                        v-if="uploadedFiles?.length > 0 && uploadedFiles[0]?.imageUrl"
                        :value="uploadedFiles.map(file => ({ itemImageSrc: file.imageUrl, alt: file.name }))"
                        :numVisible="5"
                        containerStyle="max-width: 640px"
                        :showItemNavigators="true"
                        :showThumbnails="false"
                        :circular="true"
                    >
                        <template #item="slotProps">
                            <img
                                :src="slotProps.item.itemImageSrc"
                                :alt="slotProps.item.alt"
                                style="width: 100%; display: block;"
                                class="shadow rounded-lg overflow-hidden object-cover aspect-[162/100]"
                            />
                        </template>
</Galleria>
<Galleria v-else :value="['']" :numVisible="5" containerStyle="max-width: 640px" :showItemNavigators="false" :showThumbnails="false">
    <template #item="">
                            <Skeleton
                                width="100%"
                                height="100%"
                                class="shadow rounded-lg overflow-hidden object-cover aspect-[162/100]"
                            />
                        </template>
</Galleria> -->

                    <ResultPanel>
                        <!-- <div class="
                            px-4
                            sm:px-0"
                        >
                            <h3 class="text-base font-semibold leading-7 text-gray-900">Applicant Information</h3>
                            <p class="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Personal details and application.</p>
                    </div> -->
                        <div class="border-gray-100">
                            <dl class="divide-y divide-gray-100">
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Description</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <template v-if="project.project.description">
                                            <template v-if="project.project.description.length > 250">
                                                <p>{{ project.project.description.substring(0, 250) }}...</p>
                                                <button
                                                    @click="showFullDescription = !showFullDescription"
                                                    class="text-blue-500 hover:text-blue-700"
                                                >Show more</button>
                                            </template>

                                            <template v-else>
                                                <p>{{ project.project.description }}</p>
                                            </template>
                                        </template>
                                        <template v-else>
                                            <p class="italic text-gray-500">n/a</p>
                                        </template>
                                    </dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Timeframe</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ timeframe }}</dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Restoration status</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <template v-if="project.project.restorationStatus">
                                            {{ getRecursiveMenuItem(menus.restorationStatuses, project.project.restorationStatus)?.label }}
                                        </template>
                                        <span
                                            v-else
                                            class="italic text-gray-500"
                                        >n/a</span>
                                    </dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Restoration types</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <template v-if="project.project.restorationTypes?.length > 0">
                                            {{ project.project.restorationTypes.map(type => getRecursiveMenuItem(menus.restorationTypes, type)?.label).join(', ') }}
                                        </template>
                                        <span
                                            v-else
                                            class="italic text-gray-500"
                                        >n/a</span>
                                    </dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Tenure statuses</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <template v-if="project.project.tenureStatuses?.length > 0">
                                            {{ project.project.tenureStatuses.map(status => getRecursiveMenuItem(menus.tenureStatuses, status)?.label).join(', ') }}
                                        </template>
                                        <span
                                            v-else
                                            class="italic text-gray-500"
                                        >n/a</span>
                                    </dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Website</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 hover:text-gray-900">
                                        <a
                                            v-if="project.project.website"
                                            :href="project.project.website.startsWith('http') ? project.project.website : 'http://' + project.project.website"
                                            target="_blank"
                                            class="underline"
                                        >{{ project.project.website }}</a>
                                        <span
                                            v-else
                                            class="italic text-gray-500"
                                        >n/a</span>
                                    </dd>
                                </div>
                                <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                    <dt class="text-sm font-medium leading-6 text-gray-900">Keywords</dt>
                                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        <template v-if="project.project.keywords?.length > 0">
                                            {{ project.project.keywords.join(', ') }}
                                        </template>
                                        <span
                                            v-else
                                            class="italic text-gray-500"
                                        >n/a</span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </ResultPanel>

                    <ActivitiesPanel :areas="project.areas" />

                    <SdgPanel :sdgs="project.contributionToSdg" />

                    <AreasCharts
                        :areas="project.areas"
                        @zoomToArea="zoomToArea"
                    />
                </div>
            </div>
            <div class="flex-grow p-4 bg-slate-200 relative">
                <div
                    id="map"
                    ref="mapDiv"
                    class="rounded-md focus:ring-0"
                ></div>
                <div
                    v-if="!geoJsonLoaded || geoJsonLoadError"
                    class="absolute inset-0 flex items-center justify-center font-sans"
                >
                    <div
                        v-if="!geoJsonLoaded"
                        class="text-black flex flex-col items-center border border-gray-500 bg-white px-10 py-6 rounded"
                    >
                        <SpinningThing />
                        <div class="mt-3">
                            Loading map
                        </div>
                    </div>
                    <div
                        v-else-if="geoJsonLoadError"
                        class="text-black flex flex-col items-center border border-gray-500 bg-white px-10 py-6 rounded"
                    >
                        <div>
                            Failed to load map
                        </div>

                        <div class="mt-3">
                            <button
                                @click="initMap"
                                class="bg-gray-700 text-white px-4 py-2 rounded-sm"
                            >
                                Retry
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#projectInfo {
    scrollbar-color: #bbb transparent;
    /* scrollbar-width: thin; */
}
</style>

<style>
.gm-style iframe+div {
    border: none !important;
}
</style>
