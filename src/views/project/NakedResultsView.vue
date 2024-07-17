<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onBeforeUnmount, onUnmounted, computed, watch } from 'vue';

import { useRoute } from 'vue-router'

import { useProjectStore } from '../../stores/project';
import { useMenusStore } from '@/stores/menus';

import { getRecursiveMenuLabel } from '@/lib/util';

// import { roundToPrecisionAsString } from '@/lib/util';

// import SnailChart from '@/components/charts/SnailChart.vue';

import { getProjectAreas } from '@/firebase/functions';

import { getGaulLevel0 } from '@/firebase/firestore';

// const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
// const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
import { MarkerClusterer } from "@googlemaps/markerclusterer";

import ResultPanel from './ResultPanel.vue';

import Skeleton from 'primevue/skeleton';
import Galleria from 'primevue/galleria';

// import { Swiper, SwiperSlide } from 'swiper/vue';
// import 'swiper/css';
// import 'swiper/css/navigation';

// // import './style.css';

// // import required modules
// import { Navigation } from 'swiper/modules';



// const modules = [Navigation];

// SDG images
import sdg1 from '@/assets/SDG/E_WEB_01.png';
import sdg2 from '@/assets/SDG/E_WEB_02.png';
import sdg3 from '@/assets/SDG/E_WEB_03.png';
import sdg4 from '@/assets/SDG/E_WEB_04.png';
import sdg5 from '@/assets/SDG/E_WEB_05.png';
import sdg6 from '@/assets/SDG/E_WEB_06.png';
import sdg7 from '@/assets/SDG/E_WEB_07.png';
import sdg8 from '@/assets/SDG/E_WEB_08.png';
import sdg9 from '@/assets/SDG/E_WEB_09.png';
import sdg10 from '@/assets/SDG/E_WEB_10.png';
import sdg11 from '@/assets/SDG/E_WEB_11.png';
import sdg12 from '@/assets/SDG/E_WEB_12.png';
import sdg13 from '@/assets/SDG/E_WEB_13.png';
import sdg14 from '@/assets/SDG/E_WEB_14.png';
import sdg15 from '@/assets/SDG/E_WEB_15.png';
import sdg16 from '@/assets/SDG/E_WEB_16.png';
import sdg17 from '@/assets/SDG/E_WEB_17.png';

const sdgs = [
    sdg1, sdg2, sdg3, sdg4, sdg5, sdg6, sdg7, sdg8, sdg9, sdg10, sdg11, sdg12, sdg13, sdg14, sdg15, sdg16, sdg17
];

const sdgLinks = ['poverty', 'hunger', 'health', 'education', 'gender-equality', 'water-and-sanitation', 'energy', 'economic-growth', 'infrastructure-industrialization', 'inequality', 'cities', 'sustainable-consumption-production', 'climate-change', 'oceans', 'biodiversity', 'peace-justice', 'globalpartnerships'];

// const theme = useTheme()


// const { name } = useDisplay()
// const leftDivWidth = computed(() => {
//     // name is reactive and
//     // must use .value
//     switch (name.value) {
//         case 'xl':
//             return 'w-1/3'
//         case 'lg':
//             return 'w-1/3'
//         case 'md':
//             return 'w-1/3'
//         case 'sm':
//             return 'w-1/3'
//         case 'xs':
//             return 'w-1/3'
//         default:
//             return 'w-1/3'
//     }
// });

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const route = useRoute();

const { menus, getRecursiveMenuItem } = useMenusStore();

console.log(menus);

const store = useProjectStore();

const countries = ref<{ iso2: string, label: string }[] | null>(null);

onBeforeMount(async () => {
    await store.fetchProject(route.params.id as string);
    countries.value = await getGaulLevel0();
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

import { useAuthStore } from '@/stores/auth';
import { listProjectFiles, getFileAsBlob } from '@/firebase/storage';
const authStore = useAuthStore();

async function getUploadedFiles() {
    try {
        const accessToken = await authStore.getIdToken();
        uploadedFiles.value = await listProjectFiles(route.params.id, "images", accessToken);

        // Load each file in parallel
        uploadedFiles.value.forEach(async (file: { name: string, path: string }, index: number) => {
            try {
                const blob = await getFileAsBlob(route.params.id, file.path, accessToken);
                const imageUrl = URL.createObjectURL(blob);

                // Place the file at the correct index
                uploadedFiles.value[index] = { ...file, imageUrl };
                // Trigger a reactive update
                uploadedFiles.value = [...uploadedFiles.value];
            } catch (error) {
                console.error(`Failed to load file ${file.path}:`, error);
            }
        });
    } catch (error) {
        console.error(error);
        alert('Failed to load files: ' + error);
    }
}

function getLastTargetArea() {
    const registration = store.project?.project;
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

const chartDiv = ref(null);

watch([() => store.project, chartDiv], ([project, chartDiv]) => {
    if (!project || !chartDiv) return;

    if (project.reportingLine === 'GEF') {
        chartData = areaByGefIndicator.map(([label, value]) => {
            return {
                value,
                name: getRecursiveMenuLabel(label, menus.gefIndicators) || label
            };
        });
    } else {
        chartData = [
            {
                value: project.project?.areaUnderRestoration || 0,
                name: 'Area under restoration'
            }, {
                value: project.project?.targetArea || 0 - (project.project?.areaUnderRestoration || 0), // TODO
                name: 'Not achieved'
            }
        ];
    }

    initChart();
    if (store.project?.reportingLine === 'GEF') {
        initCICharts();
    }
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
    // TitleComponent,
    TooltipComponent,
    GridComponent,
    // DatasetComponent,
    // TransformComponent,
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
    await getUploadedFiles();
});

const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0
});

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
        // backgroundColor: 'rgba(30, 41, 59, 1)', // same as slate-800
        backgroundColor: 'transparent',
    };

    // Display the chart using the configuration items and data just specified.
    myChart.setOption(option);

    // const option = {
    //     tooltip: {
    //         trigger: 'item',
    //         // format the number with no decimals
    //         formatter: function (params: any) {
    //             const value = params.value;
    //             return `${getRecursiveMenuLabel(params.name, menus.gefIndicators) || params.name}:<br>${numberFormatter.format(value)} ${store.project?.project.areaUnits || ''}`;
    //         },
    //         confine: 'true',
    //         textStyle: {
    //             overflow: 'breakAll',
    //             width: 40,
    //         },
    //         extraCssText: 'max-width: 200px; white-space: normal;',
    //         // formatter: '{a} <br/>{b}: {c} ({d}%)'
    //     },
    //     legend: {
    //         // type: 'plain',
    //         // orient: 'vertical',
    //         // itemWidth: 20,
    //         textStyle: {
    //             itemWidth: 20,
    //             rich: {
    //                 fw600: {
    //                     fontWeight: 600,
    //                 },
    //             },
    //             color: '#fff'
    //         },
    //         formatter: (name: string) => {
    //             if (store.project?.reportingLine === 'GEF')
    //                 name === 'Not achieved' ? 'Not achieved' : name.slice(3)
    //             else {
    //                 return name;
    //             }
    //         }
    //     },
    //     // legend: {
    //     // Try 'horizontal'
    //     // right: 10,
    //     // top: 'center'
    //     // },
    //     series: [
    //         {
    //             name: 'Area',
    //             type: 'pie',
    //             radius: ['40%', '70%'],
    //             avoidLabelOverlap: false,
    //             itemStyle: {
    //                 borderRadius: 6,
    //                 borderColor: '#fff',
    //                 borderWidth: 0
    //             },
    //             label: {
    //                 show: false,
    //                 position: 'center'
    //             },
    //             emphasis: {
    //                 label: {
    //                     show: true,
    //                     fontSize: 40,
    //                     fontWeight: 'bold',
    //                     formatter: (params: any) => {
    //                         return numberFormatter.format(params.value) + ' ' + (store.project?.project.areaUnits || '');
    //                     }
    //                 },
    //             },
    //             labelLine: {
    //                 show: false
    //             },
    //             data: chartData,
    //             // center: ['50%', '50%']
    //         }
    //     ]
    // };

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
    if (store.project?.reportingLine !== 'GEF') return;

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
        store.project?.project.targetAreaCoreIndicator1 || 0,
        store.project?.project.targetAreaCoreIndicator2 || 0,
        store.project?.project.targetAreaCoreIndicator3 || 0,
        store.project?.project.targetAreaCoreIndicator4 || 0,
        store.project?.project.targetAreaCoreIndicator5 || 0,
        store.project?.project.targetAreaCoreIndicator2LDCF || 0,
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
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const bounds = {
        north: 85,
        south: -85,
        west: -180,
        east: 180,
    };
    const map = new Map(mapDiv.value as HTMLElement, {
        center: { lat: 0, lng: 40 },
        zoom: 1,
        restriction: {
            latLngBounds: bounds,
            strictBounds: true,
        },

        disableDefaultUI: true,
        // satellite map
        // mapTypeId: 'hybrid',
        mapId: 'acfd9aecb62ff17c',
    });

    //load the json data
    const geojson = await getProjectAreas(route.params.id);

    map.data.addGeoJson(geojson);

    // map.data.setStyle({
    //     fillColor: '#EEA63A',
    //     fillOpacity: 0,
    //     strokeColor: '#EEA63A',
    //     strokeWeight: 2,
    //     icon: {
    //         path: google.maps.SymbolPath.CIRCLE,
    //         fillColor: '#fff',
    //         fillOpacity: 0.67,
    //         strokeColor: '#EEA63A',
    //         strokeWeight: 2,
    //         scale: 4,
    //     },
    // });
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
    const layerBounds = new google.maps.LatLngBounds();
    map.data.forEach(feature => {
        feature.getGeometry().forEachLatLng((latLng) => {
            layerBounds.extend(latLng);
        });
    });

    map.fitBounds(layerBounds);

    function getCentroid(geometry: google.maps.Data.Geometry) {
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

    // get the centroid of each feature in map.data
    // map.data.forEach(feature => {
    //     const centroid = getCentroid(feature.getGeometry());
    //     const marker = new google.maps.Marker({
    //         position: centroid,
    //         map: map
    //     });
    // });

    const centroidsAndFeatures = [];

    map.data.forEach(feature => {
        const centroid = getCentroid(feature.getGeometry());
        centroidsAndFeatures.push({ centroid, feature });
    });



    const parser = new DOMParser();
    const pinSvgString = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="#EEA63A" stroke="white" stroke-width="3" />
</svg>`;
    const pinSvg =
        parser.parseFromString(pinSvgString, 'image/svg+xml').documentElement;
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
            // Set a style for the highlighted feature
            map.data.setStyle((f) => {
                if (f === feature) {
                    return {
                        fillColor: '#EEA63A',
                        fillOpacity: 0,
                        strokeColor: '#EEA63A',
                        strokeWeight: 2,
                    };
                } else {
                    return {
                        // fillColor: 'grey',
                        // strokeWeight: 1,
                        // strokeColor: 'grey',
                        visible: false,
                    };
                }
            });

            // Calculate bounds of the feature
            const bounds = new google.maps.LatLngBounds();
            feature.getGeometry().forEachLatLng(latlng => {
                bounds.extend(latlng);
            });

            // Zoom to the bounds of the feature
            map.fitBounds(bounds);
        });
        return marker;
    });

    // when not clicking on any marker, reset the style
    map.addListener('click', () => {
        map.data.setStyle({
            // fillColor: '#EEA63A',
            // fillOpacity: 0,
            // strokeColor: '#EEA63A',
            // strokeWeight: 2,
            visible: false,
        });
    });

    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ markers, map });

}

const countriesString = computed(() => {
    if (!countries.value || !store.project.project.countries) return '';
    const countryNames = (store.project.project.countries || []).map((iso2: string) => {
        return countries.value.find(c => c.iso2 === iso2)
    });
    return countryNames.map(c => c.label).join(', ');
});


const timeframe = computed(() => {
    const project = store.project.project;
    if (!project.startingYear && !project.endingYear) return 'No timeframe specified';
    if (project.startingYear && project.endingYear) return `${project.startingYear} – ${project.endingYear}`;
    if (project.startingYear) return `from ${project.startingYear}`;
    if (project.endingYear) return `until ${project.endingYear}`;
});








function getAllActivities() {
    const areas = store.projectAreas;
    const activities = areas.reduce((acc, area) => {
        const areaObjValue = Object.values(area)[0];
        const areaActivities = areaObjValue.activities;
        console.log('areaActivities', areaActivities);
        return areaActivities ? [...acc, ...areaActivities] : acc;
    }, []);
    return activities.map(a => getRecursiveMenuItem(menus.activities, a)).map(i => i.label).sort();
}

console.log(getAllActivities());
</script>

<template>
    <div class="mx-auto sm:px-6_ lg:px-8_ bg-black h-screen font-serif">
        <div class="flex flex-col md:flex-row h-full">
            <div
                id="projectInfo"
                class="h-full w-full md:w-[400px] lg:w-[500px] xl:w-[600px] bg-slate-100 p-6 text-gray-800 overflow-auto"
            >
                <div
                    v-if="store.project"
                    class="space-y-4"
                >
                    <div class="relative shadow rounded-lg overflow-hidden _aspect-[162/100]">
                        <!-- <div class="absolute bottom-0 px-3 py-2 left-0 right-0 z-50 w-full bg-blend-multiply bg-red-900 text-white">
                            <div>
                                <h1 class="text-2xl">{{ store.project.project.title }}</h1>
                            </div>
                            <div class="mt-1 text-base">
                                <p>{{ countriesString }}</p>
                            </div>
                        </div> -->

                        <!-- <swiper
                            v-if="uploadedFiles?.length > 0 && uploadedFiles[0]?.imageUrl"
                            :navigation="true"
                            :modules="modules"
                            class="z-10"
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
                        </swiper> -->
                        
                        <!-- <Galleria
                            v-if="uploadedFiles?.length > 0 && uploadedFiles[0]?.imageUrl" 
                            :value="uploadedFiles.map(file => ({ itemImageSrc: file.imageUrl, alt: file.name }))"
                            :responsiveOptions="responsiveOptions" :numVisible="5" :circular="true" containerStyle="_max-width: 640px"
                            :showItemNavigators="true" :showThumbnails="true">
                            <template #item="slotProps">
                                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="display: block;" class=" object-cover aspect-video"/>
                            </template>
                            <template #thumbnail="slotProps">
                                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%; display: block" class="aspect-video object-cover"/>
                            </template>
                        </Galleria>                         -->

                        <Galleria  v-if="uploadedFiles?.length > 0 && uploadedFiles[0]?.imageUrl" :value="uploadedFiles.map(file => ({ itemImageSrc: file.imageUrl, alt: file.name }))" :responsiveOptions="responsiveOptions" :numVisible="5" :thumbnailsPosition="position" containerStyle="max-width: 640px">
                            <template #item="slotProps">
                                <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 100%; display: block" />
                            </template>
                            <template #thumbnail="slotProps">
                                <div class="justify-center">
                                    <img :src="slotProps.item.itemImageSrc" :alt="slotProps.item.alt" style="width: 90%; display: block;" class="object-cover aspect-video" />
                                </div>
                            </template>
                        </Galleria>
                        <Skeleton
                            v-else
                            width="100%"
                            height="100%"
                        />
                    </div>

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
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ store.project.project.description }}</dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Timeframe</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ timeframe }}</dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Restoration status</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ getRecursiveMenuItem(menus.restorationStatuses, store.project.project.restorationStatus)?.label }}</dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Restoration types</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ store.project.project.restorationTypes?.map(type => getRecursiveMenuItem(menus.restorationTypes, type)?.label).join(', ') }}</dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Tenure statuses</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ store.project.project.tenureStatuses?.map(status => getRecursiveMenuItem(menus.tenureStatuses, status)?.label).join(', ') }}</dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Website</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 underline hover:text-gray-900"><a
                                        :href="store.project.project.website"
                                        target="_blank"
                                    >{{ store.project.project.website }}</a></dd>
                            </div>
                            <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt class="text-sm font-medium leading-6 text-gray-900">Keywords</dt>
                                <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{{ store.project.project.keywords?.join(', ') }}</dd>
                            </div>
                        </dl>
                    </div>
                    </ResultPanel>

                    <ResultPanel title="Activities">
                        {{ getAllActivities() }}
                    </ResultPanel>

                    <ResultPanel title="Contributions to SDGs">
                        <div class="grid grid-cols-4 gap-4">
                            <a
                                :href="`https://www.un.org/sustainabledevelopment/${sdgLinks[sdg - 1]}`"
                                target="_blank"
                                v-for="sdg in store.project.contributionToSdg"
                                :key="sdg"
                                class="shadow-sm hover:scale-110 transition-all hover:shadow-md hover:brightness-105"
                            >
                                <img
                                    :key="sdg"
                                    :src="sdgs[sdg - 1]"
                                    :alt="`SDG ${sdg}`"
                                    class="rounded"
                                />
                            </a>
                        </div>
                    </ResultPanel>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 font-roboto text-black">
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#589C33]">
                            <div class="flex-0 text-2xl">🌳</div>
                            <div class="flex-0 flex items-center">
                                <div>
                                    <span class="font-bold text-3xl mr-1">{{ store.project.project.targetArea ?? 'n/a' }}</span>
                                    <span class="text-xl">{{ store.project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Committed area</div>
                            </div>
                        </div>
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#dd6b66]">
                            <div class="flex-0 text-2xl">🌱</div>
                            <div class="flex-0 flex items-center">
                                <div class="">
                                    <span class="font-bold text-3xl mr-1">{{ store.project.project.areaUnderRestoration ?? 'n/a' }}</span>
                                    <span class="text-xl">{{ store.project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Area under restoration</div>
                            </div>
                        </div>
                        <div class="flex flex-col rounded-md p-2 h-full bg-[#69B2BA]">
                            <div class="flex-0 text-2xl">🌵</div>
                            <div class="flex-0 flex items-center">
                                <div class="">
                                    <span class="font-bold text-3xl mr-1">{{ (store.project.project.targetArea - store.project.project.areaUnderRestoration) || 'n/a' }}</span>
                                    <span class="text-xl">{{ store.project.project.areaUnits || '' }}</span>
                                </div>
                            </div>
                            <div class="flex-grow flex items-end">
                                <div>Area not achieved</div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="store.project.project.targetArea && store.project.project.areaUnderRestoration"
                        id="chart"
                        ref="chartDiv"
                        class="rounded-md text-base h-48 w-full mt-8 overflow-hidden"
                    />

                    <!-- <div class="grid-cols-4 grid md:grid-cols-3 lg:grid-cols-4 mt-8 justify-between content-around gap-5">
                        <div
                            class="w-24 h-24"
                            v-for="file in uploadedFiles"
                            :key="file.path"
                        >
                            <img
                                v-if="file?.imageUrl"
                                :src="file.imageUrl"
                                alt="File Image"
                                class="rounded-full object-cover w-24 h-24"
                            />
                        </div>
                    </div> -->


                    <!-- <p class="mt-6 text-base font-serif">Congratulations! Your project has achieved <span class="font-bold">{{ roundToPrecisionAsString(store.project.project.areaUnderRestoration / store.project.project.targetArea * 100) }}%</span> <span class="font-bold">({{ store.project.project.areaUnderRestoration }} {{ store.project.project.areaUnits || '' }})</span> of your total committed land <span class="font-bold">({{ store.project.project.targetArea }} {{ store.project.project.areaUnits || '' }})</span>.</p> -->
                </div>
            </div>
            <div
                id="map"
                ref="mapDiv"
                class="border-gray-100 h-full flex-grow"
            />
        </div>
    </div>
</template>

<style scoped>
#projectInfo {
    scrollbar-color: #bbb transparent;
    scrollbar-width: thin;
}
</style>
