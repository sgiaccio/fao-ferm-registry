<script
    setup
    lang="ts"
>
import { ref, h } from 'vue';

import { useProjectStore } from '../../../stores/project';

import TabTemplate from "../../TabTemplate.vue";

import MeanMinMax from './MeanMinMax.vue';
import LandCover from './LandCover.vue';
import LandProductivityDynamics from './LandProductivityDynamics.vue';

import { getPolygonZonalStats } from '@/firebase/functions';

import InfoButton from '@/components/InfoButton.vue';


withDefaults(defineProps<{
    edit?: boolean
}>(), {
    edit: true
});

const store = useProjectStore();

async function fetchPolygonIndicator(areaUuid: string, statistics: string) {
    var url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/get_polygon_zonal_stats');
    const params = { area_uuid: areaUuid, statistics, project_id: store.id! }
    url.search = new URLSearchParams(params).toString();

    return fetch(
        url,
        {
            method: 'GET',
            headers: {
                // 'Authorization': `Bearer ${authStore.user.accessToken}`,
                // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
        }).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        }).then(json => {
            return json;
        });
}

async function fetchPolygonIndicatorFromEarthMap(areaUuid: string, statistics: string, options: any) {
    const results: any = await getPolygonZonalStats(areaUuid, statistics, options);
    return results;

    // const ecosystems = results.statisticResults.years.filter((y: any) => y.data.length)
    //     // year is actually the ecosystem
    //     .map((e: any) => e.year)
    //     // get the substrings before ' - '
    //     .map((e: any) => e.substring(0, e.indexOf(' - ')));
    // // filter out the ones that are not in the IUCN ecosystems

    // // flatten the IUCN ecosystems is calculated each time, optimize this
    // const flattenedIucnEcosystems: string[] = [];
    // (function flatten(ecosystems_) {
    //     ecosystems_.forEach((e: any) => {
    //         if (e.items) {
    //             flatten(e.items);
    //         } else if (e.value) {
    //             flattenedIucnEcosystems.push(e.value);
    //         }
    //     });
    // })(menus.iucnEcosystems);

    // // Filter out the ones that are not in the IUCN ecosystems
    // return ecosystems.filter((e: any) => flattenedIucnEcosystems.includes(e));
}

// const statisticsIds = ['elevation', 'temperature', 'precipitation', 'land_cover']

interface Statistics {
    type?: 'gee' | 'em', // Google Earth Engine or Earth Map
    requestId: string,
    requestOptions?: any,
    dbId: string,
    label: string,
    transformFn: any, // TODO: function
    template: any, // TODO vue template
    infoTemplate?: any,
}

function calculateAverages(values: any[], trunc = true): { mean: number, min: number, max: number } {
    function calculateAverage(key: string) {
        const average = (values.reduce((prev, curr) => prev + curr[key], 0) / values.length);
        return trunc ? Math.trunc(average) : average;
    }

    return {
        mean: calculateAverage('mean'),
        min: calculateAverage('min'),
        max: calculateAverage('max')
    }
}

const statistics: Statistics[] = [
    {
        type: 'em',
        requestId: 'CCIBiomass',
        requestOptions: {
            firstYear: 2010,
            lastYear: 2020,
        },
        dbId: 'cciBiomass',
        label: 'CCI Biomass',
        transformFn: (val: any) => val,
        template: LandProductivityDynamics,
    },
    {
        type: 'em',
        requestId: 'landProductivity',
        dbId: 'landProductivityDynamics',
        label: 'Land Productivity Dynamics [ha]',

        transformFn: (val: any) => {
            const data2016 = val.statisticResults.years.find((y: any) => y.year === 2016).data;
            // camelize the keys
            const camelized = data2016.map((d: any) => ({
                areaHa: Math.trunc(d.area_ha),
                areaPercentage: d.area_percentage,
                areaSqm: Math.trunc(d.area_sqm),
                className: d.class_name,
                classNumber: d.class_number,
                classPalette: d.class_palette,
                index: d.index
            }));
            return camelized;
        },
        template: LandProductivityDynamics,
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Land Productivity Dynamics:</span> The dynamics in the land productivity indicator are related to changes in the health and productive capacity of the land and reflects the net effects of changes in ecosystem functioning due to changes in plant phenology and biomass growth, where declining trends are often (but not always) a defining characteristic of land degradation. Understanding changes in the productive capacity of the land is critical for assessing the impact of land management interventions, its long-term sustainability, and the climate-derived impacts which could affect ecosystem resilience and human livelihoods. The categories correspond to the trends observed during the period 2001-2016.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Proportion of each category of land productivity dynamics within the area under restoration
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> Hectares
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial</span> resolution: 250 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Ivits E; Cherlet M. Land-Productivity Dynamics Towards integrated assessment of land degradation at global scales. EUR 26052. Luxembourg (Luxembourg): Publications Office of the European Union; 2013. JRC80541
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://earthmap.org/documents/LPD_Global.pdf">https://earthmap.org/documents/LPD_Global.pdf</a>
                </p>` });
        }
    }, {
        requestId: 'land_cover',
        dbId: 'landCover',
        label: 'Land cover [ha]',
        transformFn: (val: any) => Object.entries(val[0])
            .map(([k, v]) => [+k, +v])
            .filter(entry => !isNaN(+entry[0]))
            .map(entry => ({ id: entry[0], value: Math.trunc(+entry[1]) })),
        template: LandCover,
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Land cover:</span>
                    The type of land cover directly influences the composition of ecosystems and biodiversity, and also provide different ecosystem services, such as water regulation, carbon sequestration, or erosion control. This layer is the Dynamic Land Cover map (CGLS-LC100) for the year 2019.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Proportion of each category within the area under restoration.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> Hectares
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 100 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Buchhorn, M., Smets, B., Bertels, L., Roo, B. D., Lesiv, M., Tsendbazar, N.-E., Herold, M., & Fritz, S. (2020). Copernicus Global Land Service: Land Cover 100m: collection 3: epoch 2019: Globe (Version V3.0.1) [Data set]. Zenodo.
                </p>
                <p>
                <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                    target="_blank"
                    href="https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global">https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global</a>
                </p>` });
        }
    }, {
        requestId: 'elevation',
        dbId: 'elevation',
        label: 'Elevation [m]',
        transformFn: calculateAverages,
        template: MeanMinMax,
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Elevation:</span>
                    Elevation has an impact on various environmental factors such as microclimatic conditions, water flow and hydrology, species distribution, soil composition and ecosystem dynamics. This Digital Elevation Model (DEM) provides elevation values for the year 2000.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Minimum, maximum, and mean elevation values within the area under restoration.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 90 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Jarvis, A., H.I. Reuter, A. Nelson, E. Guevara. 2008. Hole-filled SRTM for the globe Version 4, available from the CGIAR-CSI SRTM 90m Database: <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://srtm.csi.cgiar.org">https://srtm.csi.cgiar.org</a>.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4">https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4</a>
                </p>` });
        }
    }, {
        requestId: 'temperature',
        dbId: 'temperature',
        label: 'Temperature [℃]',
        transformFn: result => {
            const k = calculateAverages(result, false);
            return {
                mean: Math.trunc(+k.mean - 273.15),
                min: Math.trunc(+k.min - 273.15),
                max: Math.trunc(+k.max - 273.15),
            }
        },
        template: MeanMinMax,
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Temperature:</span>
                    Temperature influences the distribution and range of species, growing season and phenology, resilience to climate change, soil health and nutrient cycling and has a direct impact in water availability and evapotranspiration. Estimates of temperature are computed from 2015 to 2019.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Minimum, maximum and mean monthly temperature of 5 years within the area under restoration
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> degree Celsius (°C)
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 27830 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Copernicus Climate Change Service (C3S) (2017): ERA5: Fifth generation of ECMWF atmospheric reanalyses of the global climate. Copernicus Climate Change Service Climate Data Store (CDS), (date of access), <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://cds.climate.copernicus.eu/cdsapp#!/home">https://cds.climate.copernicus.eu/cdsapp#!/home</a>
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY#citations">https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY#citations</a>
                </p>` });
        }
    }];

const t = statistics.reduce((prev, curr) => ({ ...prev, [curr.dbId]: 'idle' }), {})
const areaStatStatus = ref<{ [key: string]: 'idle' | 'loading' | 'error' }[]>(new Array(store.projectAreas.length).fill(null).map(() => ({ ...t })));

const nDots = ref(0);
const nLoading = ref(0)

function fetchIndicators_(area: any) {

    const areaIdx = store.projectAreas.indexOf(area);

    if (Object.values(areaStatStatus.value[areaIdx]).includes('loading')) {
        return;
    }

    let intervalId: number;

    statistics.forEach(async stats => {
        if (nLoading.value === 0) {
            intervalId = window.setInterval(() => nDots.value = (nDots.value + 1) % 4, 600);
        }
        nLoading.value += 1;

        areaStatStatus.value[areaIdx][stats.dbId] = 'loading';
        const areaValues = area[Object.keys(area)[0]];
        areaValues.characteristics = {};

        try {
            const result = await fetchPolygonIndicator(areaValues.uuid, stats.requestId);
            areaValues.characteristics[stats.dbId] = stats.transformFn(result);
            areaStatStatus.value[areaIdx][stats.dbId] = 'idle';
        } catch (e) {
            console.error(e);
            areaStatStatus.value[areaIdx][stats.dbId] = 'error';
        } finally {
            nLoading.value -= 1;
            if (nLoading.value === 0) {
                clearInterval(intervalId);
                nDots.value = 1;
            }
        }
    });
}


// onMounted(() => {
//     getPolygonZonalStats(store.id!, store.projectAreas.map(area => area[Object.keys(area)[0]].uuid))
//         .then(result => {
//             result.forEach((area, i) => {
//                 areaStatStatus.value[i] = { ...areaStatStatus.value[i], ...area };
//             })
//         })
//         .catch(e => console.error(e));
// });

function fetchIndicators(area: any) {
    const areaIdx = store.projectAreas.indexOf(area);

    if (Object.values(areaStatStatus.value[areaIdx]).includes('loading')) {
        return;
    }

    let intervalId: number;

    statistics.forEach(async stats => {
        if (nLoading.value === 0) {
            intervalId = window.setInterval(() => nDots.value = (nDots.value + 1) % 4, 600);
        }
        nLoading.value += 1;

        areaStatStatus.value[areaIdx][stats.dbId] = 'loading';
        const areaValues = area[Object.keys(area)[0]];
        areaValues.characteristics = {};

        try {
            let result;
            if (!stats.type || stats.type === 'gee') {
                result = await fetchPolygonIndicator(areaValues.uuid, stats.requestId);
            } else if (stats.type === 'em') {
                result = await fetchPolygonIndicatorFromEarthMap(areaValues.uuid, stats.requestId, stats.requestOptions);
            } else {
                throw Error('Unknown statistics type');
            }
            areaValues.characteristics[stats.dbId] = stats.transformFn(result);
            areaStatStatus.value[areaIdx][stats.dbId] = 'idle';
        } catch (e) {
            areaStatStatus.value[areaIdx][stats.dbId] = 'error';
        } finally {
            nLoading.value -= 1;
            if (nLoading.value === 0) {
                clearInterval(intervalId);
                nDots.value = 1;
            }
        }
    });
}
</script>

<template>
    <TabTemplate title="Characteristics">
        <template #description>
            <p>In this section, you can access basic information about the characteristics of your area under restoration. Designing a restoration initiative starts with a local assessment of the area being considered for restoration, including a general description of its environmental, biophysical and socio-economic components that can be assessed in this section. The characteristics of a site can help restoration practitioners to make more informed decisions about which species to reintroduce, where to focus restoration efforts, and how to replicate or restore elsewhere based on similar characteristics. The degree of degradation, and its effects on biodiversity, ecological integrity, and human health and well-being must be identified as well (in progress).</p>
            <p class="mt-4">For each of the areas under restoration within your initiative a set of quantitative and qualitative statistics are calculated automatically using the following datasets. Details about these datasets, methods used for computation, and original sources are also provided.</p>
            <!-- <div class="font-light mt-4 text-sm">
                <p class="4">
                    <span class="font-bold">Land Productivity Dynamics:</span> The dynamics in the land productivity indicator are related to changes in the health and productive capacity of the land and reflects the net effects of changes in ecosystem functioning due to changes in plant phenology and biomass growth, where declining trends are often (but not always) a defining characteristic of land degradation. Understanding changes in the productive capacity of the land is critical for assessing the impact of land management interventions, its long-term sustainability, and the climate-derived impacts which could affect ecosystem resilience and human livelihoods. The categories correspond to the trends observed during the period 2001-2016.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Proportion of each category of land productivity dynamics within the area under restoration
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> Hectares
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial</span> resolution: 250 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Ivits E; Cherlet M. Land-Productivity Dynamics Towards integrated assessment of land degradation at global scales. EUR 26052. Luxembourg (Luxembourg): Publications Office of the European Union; 2013. JRC80541
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://earthmap.org/documents/LPD_Global.pdf"
                    >https://earthmap.org/documents/LPD_Global.pdf</a>
                </p>

                <p class="mt-4">
                    <span class="font-bold">Land cover:</span>
                    The type of land cover directly influences the composition of ecosystems and biodiversity, and also provide different ecosystem services, such as water regulation, carbon sequestration, or erosion control. This layer is the Dynamic Land Cover map (CGLS-LC100) for the year 2019.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Proportion of each category within the area under restoration.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> Hectares
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 100 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Buchhorn, M., Smets, B., Bertels, L., Roo, B. D., Lesiv, M., Tsendbazar, N.-E., Herold, M., & Fritz, S. (2020). Copernicus Global Land Service: Land Cover 100m: collection 3: epoch 2019: Globe (Version V3.0.1) [Data set]. Zenodo.

                    <span class="font-medium">Source:</span> <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global"
                    >https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_Landcover_100m_Proba-V-C3_Global</a>
                </p>

                <p class="mt-4">
                    <span class="font-bold">Elevation:</span>
                    Elevation has an impact on various environmental factors such as microclimatic conditions, water flow and hydrology, species distribution, soil composition and ecosystem dynamics. This Digital Elevation Model (DEM) provides elevation values for the year 2000.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Minimum, maximum, and mean elevation values within the area under restoration.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 90 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Jarvis, A., H.I. Reuter, A. Nelson, E. Guevara. 2008. Hole-filled SRTM for the globe Version 4, available from the CGIAR-CSI SRTM 90m Database: <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://srtm.csi.cgiar.org"
                    >https://srtm.csi.cgiar.org</a>.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4"
                    >https://developers.google.com/earth-engine/datasets/catalog/CGIAR_SRTM90_V4</a>
                </p>
                <p class="mt-4">
                    <span class="font-bold">Temperature:</span>
                    Temperature influences the distribution and range of species, growing season and phenology, resilience to climate change, soil health and nutrient cycling and has a direct impact in water availability and evapotranspiration. Estimates of temperature are computed from 2015 to 2019.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Minimum, maximum and mean monthly temperature of 5 years within the area under restoration
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> degree Celsius (°C)
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 27830 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Copernicus Climate Change Service (C3S) (2017): ERA5: Fifth generation of ECMWF atmospheric reanalyses of the global climate. Copernicus Climate Change Service Climate Data Store (CDS), (date of access), <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://cds.climate.copernicus.eu/cdsapp#!/home"
                    >https://cds.climate.copernicus.eu/cdsapp#!/home</a>
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a
                        class="text-blue-600 underline hover:text-blue-500"
                        target="_blank"
                        href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY#citations"
                    >https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_MONTHLY#citations</a>
                </p>
            </div> -->
        </template>
        <template #default>
            <div
                v-if="store.projectAreas?.length"
                class="text-sm text-gray-800 flex flex-col gap-y-4 mt-6"
            >
                <div
                    v-for="area, i in store.projectAreas"
                    class="border-2 border-gray-300 px-3 py-2 rounded-lg"
                >
                    <div class="text-gray-500 text-lg font-bold mb-2">
                        Area {{ i + 1 }}<span
                            class="text-black"
                            v-if="area[Object.keys(area)[0]].siteName"
                        >: {{ area[Object.keys(area)[0]].siteName }}</span>
                    </div>

                    <div class="grid grid-cols-4 gap-x-4 gap-y-4">
                        <template v-for="stats in statistics">
                            <div class="font-bold">
                                {{ stats.label }}
                                <InfoButton :title="stats.label">
                                    <slot>
                                        <component :is="stats.infoTemplate" />
                                    </slot>
                                </InfoButton>
                            </div>
                            <div
                                v-if="area[Object.keys(area)[0]].characteristics && area[Object.keys(area)[0]].characteristics[stats.dbId]"
                                class="col-span-3"
                            >
                                <component
                                    :is="stats.template"
                                    :value="area[Object.keys(area)[0]].characteristics[stats.dbId]"
                                />
                            </div>
                            <template v-else>
                                <div
                                    class="col-span-3"
                                    v-if="areaStatStatus[i][stats.dbId] === 'loading'"
                                >
                                    Loading{{ '.'.repeat(nDots) }}
                                </div>
                                <div
                                    v-else-if="areaStatStatus[i][stats.dbId] === 'error'"
                                    class="text-red-500 col-span-3"
                                >Error getting statistics</div>
                                <div
                                    class="col-span-3"
                                    v-else
                                >n/a</div>
                            </template>
                        </template>
                    </div>
                    <div
                        class="w-full flex place-content-end"
                        v-if="edit && ['upload', 'draw', 'uploadKml'].includes(Object.keys(area)[0])"
                    >
                        <button
                            type="button"
                            class="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            @click="fetchIndicators(area)"
                        >Get values</button>
                    </div>
                </div>
            </div>
            <div
                v-else
                class="text-red-600 font-bold text-lg pb-4"
            >Please enter at least one area in the <router-link
                    class="text-blue-400 underline hover:text-blue-600"
                    :to="{ path: 'area' }"
                >Area tab</router-link></div>
        </template>
    </TabTemplate>
</template>
