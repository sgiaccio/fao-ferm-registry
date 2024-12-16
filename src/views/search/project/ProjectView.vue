<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted, computed, watch } from 'vue';

import { useRoute } from 'vue-router'

import { getPublicProject, getPublicProjectThumbnail } from '@/firebase/functions';

import { useMenusStore } from '@/stores/menus';

import ResultPanel from './ResultPanel.vue';
import ActivitiesPanel from './ActivitiesPanel.vue';
import SdgPanel from './SdgPanel.vue';
import AreasCharts from './AreasCharts.vue';
import AlertModal from '@/views/AlertModal.vue';
import IndicatorsPanel from './IndicatorsPanel.vue';
import MapPanel from './MapPanel.vue';
import EcosystemsPanel from './EcosystemsPanel.vue';
import ChartsSwiper from '@/views/charts/ChartsSwiper.vue';
import GoodPracticesPanel from './GoodPracticesPanel.vue';
import CommittedAreaChart from '@/views/charts/CommittedAreaChart.vue';

import {
    getRecursiveMenuItem,
    getLastTargetArea,
    getPolygonsArea,
    areaByGefIndicatorGroup as areaByGefIndicatorGroupUtil
} from '@/lib/util';

import iso2codes from '@/assets/iso2codes.json';


const mapPanel = ref<any>(null);

withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const route = useRoute();
const { menus } = useMenusStore();

const project = ref<any>(null);

const areaByGefIndicatorGroup = ref<any[]>([]);

// const indicatorGroupNames = [
//     { value: 1, label: '1. Terrestrial protected areas created or under improved management for conservation and sustainable use' },
//     { value: 2, label: '2. Marine protected areas created or under improved management for conservation and sustainable use' },
//     { value: 3, label: '3. Area of land and ecosystems under restoration' },
//     { value: 4, label: '4. Area of landscapes under improved practices' },
//     { value: 5, label: '5. Area of marine habitat under improved practices to benefit biodiversity' },
//     { value: '2LDCF', label: '2 (LDCF). Area of land managed for climate resilience' }
// ];

onBeforeMount(async () => {
    const [fetchedProject] = await Promise.all([
        getPublicProject(route.params.id as string),
        // getGaulLevel0()
    ]);
    project.value = fetchedProject;
    // countries.value = fetchedCountries;

    if (fetchedProject.reportingLine === 'GEF') {
        areaByGefIndicatorGroup.value = areaByGefIndicatorGroupUtil(fetchedProject.areas);
    }
});

onUnmounted(() => {
    // Revoke all object URLs
    uploadedFiles.value.forEach(file => {
        if (file.imageUrl) {
            URL.revokeObjectURL(file.imageUrl);
        }
    });

    if (thumbnail.value) {
        URL.revokeObjectURL(thumbnail.value);
    }
});

const uploadedFiles = ref<{ name: string, path: string, imageUrl?: string }[]>([]);

async function getThumbnail() {
    try {
        const blob = await getPublicProjectThumbnail(route.params.id as string);
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Error displaying the thumbnail:', error);
    }
}

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

import { ArrowLeftIcon } from '@heroicons/vue/24/outline';

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


const thumbnail = ref<string | null>(null);

onMounted(async () => {
    // await getUploadedFiles(); // TODO add getPublicUploadedFiles cloud function

    const imageUrl = await getThumbnail();
    if (!imageUrl) {
        console.error('Failed to load thumbnail:', imageUrl);
        return;
    }
    thumbnail.value = imageUrl;
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

const countriesObj = computed(() => {
    if (!iso2codes || !project?.value?.project?.countries) return '';
    const projectCountries = (project?.value?.project?.countries || []).map((iso2: string) => {
        return iso2codes!.find(c => c.iso2 === iso2)
    });
    return projectCountries.map(c => ({ name: c?.label, iso2: c?.iso2 })).sort((a, b) => a.name.localeCompare(b.name));
});


const timeframe = computed(() => {
    const p = project.value.project;
    if (!p.startingYear && !p.endingYear) return 'No timeframe specified';
    if (p.startingYear && p.endingYear) return `${p.startingYear} – ${p.endingYear}`;
    if (p.startingYear) return `from ${p.startingYear}`;
    if (p.endingYear) return `until ${p.endingYear}`;
});

function zoomToArea(uuid: string) {
    return;
    // // Look for the feature with the given uuid
    // let foundFeature = null;
    // map.data.forEach(feature => {
    //     if (feature.getProperty('uuid') === uuid) {
    //         foundFeature = feature;
    //     }
    // });

    // // zoom to the feature
    // if (foundFeature) {
    //     zoomAndHighlightFeature(foundFeature);
    // } else {
    //     // zoom to the whole layer
    //     const layerBounds = new google.maps.LatLngBounds();
    //     map.data.forEach(feature => {
    //         feature.getGeometry().forEachLatLng(latlng => {
    //             layerBounds.extend(latlng);
    //         });
    //     });
    //     map.fitBounds(layerBounds);
    //     map.setCenter(layerBounds.getCenter());
    // }
}

const showFullDescription = ref(false);

const selectedArea = ref(null);
function areaClicked(area: any) {
    // if there's only one area, don't do anything because the information would be the same
    if (project.value.areas.length === 1) return;

    selectedArea.value = area;
}

function deselectArea() {
    selectedArea.value = null;
    mapPanel.value?.resetMap();
}


const targetArea = computed(() => {
    if (project.value.reportingLine === 'GEF') {
        return getLastTargetArea(project.value);
    } else {
        return project.value.project.targetArea;
    }
});

const areaUnderRestoration = computed(() => {
    if (project.value.reportingLine === 'GEF') {
        return getPolygonsArea(project.value.areas);
    } else {
        return project.value.project.areaUnderRestoration;
    }
});

function areaForGefIndicatorGroup(indicatorGroup: number) {
    return areaByGefIndicatorGroup.value.find(i => +i[0] === indicatorGroup)?.[1];
}

function nCIOtherThan3() {
    const allIndicators = [
        project.value.project.targetAreaCoreIndicator1,
        project.value.project.targetAreaCoreIndicator2,
        project.value.project.targetAreaCoreIndicator2LDCF,
        project.value.project.targetAreaCoreIndicator4,
        project.value.project.targetAreaCoreIndicator5
    ];
    return allIndicators.filter(i => i).length;
}

function otherChartSize() {
    return nCIOtherThan3() > 1 ? 'small' : undefined;
}
</script>

<template>
    <AlertModal
        title="Description"
        :onClose="() => { showFullDescription = false }"
        :open="showFullDescription"
        buttonText="Close"
    >
        <p class="whitespace-pre-wrap text-sm text-gray-800 text-left font-serif_">{{ project?.project.description }}</p>
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

    <div class="mx-auto sm:px-6_ lg:px-8_ font-serif_ h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] border-t border-t-slate-400 bg-slate-100">
        <div class="flex flex-col md:flex-row h-full">
            <div
                id="projectInfo"
                class="h-full w-full md:w-[400px] lg:w-[500px] xl:w-[600px] _py-6 _pl-4 pr-3 text-gray-800 overflow-auto"
            >
                <div
                    v-if="project"
                    class="relative"
                >
                    <transition name="appear_from_left">
                        <div
                            v-if="selectedArea"
                            class="absolute w-full space-y-4 bg-slate-100 z-50 py-6 pl-4 "
                        >
                            <div class="text-gray-800 text-sm flex w-full items-center">
                                <div class="flex-grow">
                                    <h1 class="text-2xl font-akrobat font-semibold">{{ selectedArea.siteName || 'Area' }}</h1>
                                </div>
                                <button @click="deselectArea">
                                    <div class="rounded-full bg-gray-300 hover:bg-gray-400 p-1">
                                        <ArrowLeftIcon class="h-6 w-6" />
                                    </div>
                                </button>
                            </div>

                            <EcosystemsPanel :areas="[{ dummy: selectedArea }]" />

                            <ActivitiesPanel :areas="[{ dummy: selectedArea }]" />

                            <IndicatorsPanel :areas="[{ dummy: selectedArea }]" />

                            <AreasCharts
                                :areas="[{ dummy: selectedArea }]"
                                @zoomToArea="zoomToArea"
                            />


                            <ChartsSwiper :area="selectedArea" />
                        </div>
                    </transition>
                    <transition name="disappear_to_left">
                        <div
                            v-if="!selectedArea"
                            class="space-y-4 py-6 pl-4"
                        >
                            <div class="text-gray-800 text-sm">
                                <div class="flex flex-row w-full">
                                    <div class="flex-1">
                                        <h1 class="text-2xl font-akrobat font-semibold">{{ project.project.title }}</h1>
                                    </div>
                                    <!-- add GEF logo if GEF project -->
                                    <div
                                        v-if="project.reportingLine === 'GEF'"
                                        class="mt-2"
                                    >
                                        <img
                                            src="/interop_logos/gef.svg"
                                            alt="GEF logo"
                                            class="h-12 w-auto"
                                        />
                                    </div>
                                </div>
                                <div class="mt-1 flex flex-wrap gap-x-3 gap-y-2">
                                    <div
                                        v-for="c in countriesObj"
                                        :key="c.iso2"
                                        class="flex items-center"
                                    >
                                        <img
                                            :src="`/flags/iso2/${c.iso2.toLowerCase()}.svg`"
                                            :alt="`${c.name} flag`"
                                            class="h-6 w-6 flex-shrink-0 rounded-full"
                                        />
                                        <span class="ml-2">{{ c.name }}</span>
                                    </div>


                                </div>
                            </div>

                            <div
                                v-if="thumbnail"
                                class="shadow rounded-lg overflow-hidden aspect-[162/100] border border-gray-200"
                            >
                                <img
                                    v-if="project.project.thumbnailUrl"
                                    :src="thumbnail"
                                    alt="Project thumbnail"
                                    class="object-cover aspect-[162/100]"
                                />
                            </div>

                            <CommittedAreaChart
                                v-if="project.reportingLine !== 'GEF'"
                                :areaUnderRestoration="areaUnderRestoration"
                                :targetArea="project.project.targetArea"
                                :units="project.project.areaUnits"
                            />
                            <div v-else>
                                <CommittedAreaChart
                                    v-if="project.project.targetAreaCoreIndicator3"
                                    title="Area of land and ecosystems under restoration"
                                    :targetArea="project.project.targetAreaCoreIndicator3"
                                    :areaUnderRestoration="areaForGefIndicatorGroup(3) ?? 0"
                                    :units="project.project.areaUnits"
                                />
                                <div :class="['mt-2', nCIOtherThan3() > 1 ? 'grid grid-cols-2 gap-2' : '']">
                                    <CommittedAreaChart
                                        v-if="project.project.targetAreaCoreIndicator4"
                                        title="Area of landscapes under improved practices"
                                        :targetArea="project.project.targetAreaCoreIndicator4"
                                        :areaUnderRestoration="areaForGefIndicatorGroup(4) ?? 0"
                                        :units="project.project.areaUnits"
                                        underRestorationLabel="Under improved practices"
                                        :size="otherChartSize()"
                                    />
                                    <CommittedAreaChart
                                        v-if="project.project.targetAreaCoreIndicator5"
                                        title="Area of marine habitat under improved practices to benefit biodiversity"
                                        :targetArea="project.project.targetAreaCoreIndicator5"
                                        :areaUnderRestoration="areaForGefIndicatorGroup(2) ?? 0"
                                        :units="project.project.areaUnits"
                                        underRestorationLabel="Under improved practices"
                                        :size="otherChartSize()"
                                    />
                                    <CommittedAreaChart
                                        v-if="project.project.targetAreaCoreIndicator1"
                                        title="Terrestrial protected areas created or under improved management for conservation and sustainable use"
                                        :targetArea="project.project.targetAreaCoreIndicator1"
                                        :areaUnderRestoration="areaForGefIndicatorGroup(1) ?? 0"
                                        :units="project.project.areaUnits"
                                        underRestorationLabel="Under improved practices"
                                        :size="otherChartSize()"
                                    />
                                    <CommittedAreaChart
                                        v-if="project.project.targetAreaCoreIndicator2"
                                        title="Marine protected areas created or under improved management for conservation and sustainable use"
                                        :targetArea="project.project.targetAreaCoreIndicator2"
                                        :areaUnderRestoration="areaForGefIndicatorGroup(2) ?? 0"
                                        :units="project.project.areaUnits"
                                        underRestorationLabel="Under improved practices"
                                        :size="otherChartSize()"
                                    />
                                    <CommittedAreaChart
                                        v-if="project.project.targetAreaCoreIndicator2LDCF"
                                        title="Area of land managed for climate resilience"
                                        :targetArea="project.project.targetAreaCoreIndicator2LDCF"
                                        :areaUnderRestoration="areaForGefIndicatorGroup('2LDCF') ?? 0"
                                        :units="project.project.areaUnits"
                                        underRestorationLabel="Under improved practices"
                                        :size="otherChartSize()"
                                    />
                                </div>
                            </div>


                            <!-- <div
                                v-if="project.reportingLine === 'GEF'"
                                class="gap-x-5 lg:gap-x-0 rounded-md p-2 h-full bg-[#dd6b66]"
                            >
                                <div class="font-bold">GEF Core Indicators</div>
                                <div
                                    v-for="group in areaByGefIndicatorGroup"
                                    :key="group[0]"
                                    class="flex mt-2"
                                >
                                    <div class="flex flex-row gap-4">
                                        <div class="flex-grow">
                                            {{ indicatorGroupNames.find(i => '' + i.value === '' + group[0])?.label }}
                                        </div>
                                        <div>
                                            <span class="font-bold text-xl mr-1">{{ group[1] ? formatNumber(group[1]) : 'n/a' }}</span>
                                            <span class="text-xl">{{ project.project.areaUnits || '' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div> -->

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

                            <ResultPanel>
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
                                                            class="text-blue-700 underline"
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

                            <EcosystemsPanel :areas="project.areas" />

                            <ActivitiesPanel :areas="project.areas" />

                            <SdgPanel :sdgs="project.contributionToSdg" />

                            <IndicatorsPanel :areas="project.areas" />

                            <AreasCharts
                                :areas="project.areas"
                                @zoomToArea="zoomToArea"
                            />
                            <GoodPracticesPanel :projectId="route.params.id" />
                        </div>
                    </transition>
                </div>
            </div>
            <div class="flex-grow p-4 bg-slate-300 relative">
                <MapPanel
                    ref="mapPanel"
                    class="rounded-md"
                    :projectId="route.params.id"
                    @area-clicked="areaClicked"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
#projectInfo {
    scrollbar-color: #bbb transparent;
    /* scrollbar-width: thin; */
}

.gm-style iframe+div {
    border: none !important;
}

.appear_from_left-enter-active,
.appear_from_left-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.appear_from_left-enter-from,
.appear_from_left-leave-to {
    transform: translateX(100%);
}

.appear_from_left-enter-to,
.appear_from_left-leave-from {
    transform: translateX(0);
}

.disappear_to_left-enter-active,
.disappear_to_left-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.disappear_to_left-enter-from,
.disappear_to_left-leave-to {
    transform: translateX(-100%);
}

.disappear_to_left-enter-to,
.disappear_to_left-leave-from {
    transform: translateX(0);
}
</style>
