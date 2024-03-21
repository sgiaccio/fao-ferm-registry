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
import BarChart from './BarChart.vue';
import LineChart from './LineChart.vue';

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
}

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
        label: 'Above Ground Biomass [MT/ha]',
        transformFn: (val: any) => val.statisticResults.data.map((v: any) => {
            return {
                year: v.year,
                value: Math.trunc(v.total)
            }
        }).sort((a: any, b: any) => a.year - b.year),
        template: (props) => {
            return h(BarChart, {
                values: props.value.map((area: any) => ({
                    label: area.year,
                    value: area.value
                })),
                legend: 'AGB [MT/ha]'
            })
        },
        // template_: h('CciChart', {
        //     values: (area: any) => ({
        //         label: area.year,
        //         value: area.value
        //     }),
        //     legend: 'Above Ground Biomass [MT/ha]'
        // }),
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Above Ground Biomass:</span> The change in above-ground biomass is essential to quantify the carbon sequestration potential of ecosystems in restoration. It allows the comparability between similar restoration techniques and approaches and evaluates their effectiveness. It is also a proxy of ecosystem health and helps monitor productivity. Estimates of forest above-ground biomass for the years 2010, 2017, 2018, 2019, and 2020.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Sum of the AGB for the whole area
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span>Mg, Ton
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 98 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Santoro, M.; Cartus, O. (2023): ESA Biomass Climate Change Initiative (Biomass_cci): Global datasets of forest above-ground biomass for the years 2010, 2017, 2018, 2019 and 2020, v4. NERC EDS Centre for Environmental Data Analysis, 21 April 2023. doi:10.5285/af60720c1e404a9e9d2c145d2b2ead4e.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://dx.doi.org/10.5285/af60720c1e404a9e9d2c145d2b2ead4">https://dx.doi.org/10.5285/af60720c1e404a9e9d2c145d2b2ead4</a>
                </p>` });
        }
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
        label: 'Land Cover [ha]',
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
        type: 'em',
        requestId: 'meanTempECMWFLand',
        requestOptions: {
            firstYear: 2013,
            lastYear: 2023,
            timePeriod: 'monthlyAverages',
        },
        dbId: 'temperatureMonthlyAvg',
        label: 'Temperature Monthly Average [°C]',
        transformFn: result => {
            // the first row is the header
            const data = result.statisticResults.data.slice(1);
            return data.map(([month, temp]: [string, number]) => {
                return {
                    month: month,
                    value: temp
                }
            });
        },
        template: (props) => {
            return h(LineChart, {
                values: props.value.map((area: any) => ({
                    label: area.month,
                    value: area.value
                })),
                legend: 'Temperature',
                unit: '°C'
            })
        },
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Temperature:</span>
                    Temperature influences the distribution and range of species, growing season and phenology, resilience to climate change, soil health and nutrient cycling and has a direct impact in water availability and evapotranspiration. Estimates of temperature are computed from 2013 to 2023.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Mean monthly temperature for the period 2013 to 2023.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> degree Celsius (°C)
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 11132 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> oz Sabater, J., (2019): ERA5-Land monthly averaged data from 1981 to present. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). (<date of access>), doi:10.24381/cds.68d2bb30.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR#citation">https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR#citation</a>
                </p>` });
        }
    }, {
        type: 'em',
        requestId: 'precipitationECMWFLand',
        requestOptions: {
            firstYear: 2013,
            lastYear: 2023,
            timePeriod: 'monthlyAverages',
        },
        dbId: 'precipitationMonthlyAvg',
        label: 'Precipitation Monthly Average [mm]',
        transformFn: result => {
            // the first row is the header
            const data = result.statisticResults.data.slice(1);
            return data.map(([month, temp]: [string, number]) => {
                return {
                    month: month,
                    value: temp
                }
            });
        },
        template: (props) => {
            return h(LineChart, {
                values: props.value.map((area: any) => ({
                    label: area.month,
                    value: area.value
                })),
                legend: 'Precipitation',
                nDecimals: 0,
                unit: 'mm'
            })
        },
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Precipitation:</span>
                    Precipitation influences water availability, hydrological processes, soi erosion, nutrient cycling and species community composition. Estimates of precipitation are computed from 2013 to 2023.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Mean monthly precipitation sum for the period 2013 to 2023.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> mm
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 11132 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">References:</span> Muñoz Sabater, J., (2019): ERA5-Land monthly averaged data from 1981 to present. Copernicus Climate Change Service (C3S) Climate Data Store (CDS). (<date of access>), doi:10.24381/cds.68d2bb30.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR#citation">https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR#citation</a>
                </p>` });
        }
    }, {
        type: 'gee',
        requestId: 'iucn_richness',
        dbId: 'iucnRichness',
        label: 'Species Richness',
        transformFn: (val: any) => {
            return [{
                year: 2021,
                value: val[0].max
            }, {
                year: 2022,
                value: val[1].max
            }];
        },
        template: (props) => {
            return h(BarChart, {
                values: props.value.map((area: any) => ({
                    label: area.year,
                    value: area.value
                })),
                legend: 'Number of species',
            })
        },
        infoTemplate: () => {
            return h('div', {
                class: 'class="font-light mt-4 text-sm"',
                innerHTML: `<p class="4">
                    <span class="font-bold">Species Richness:</span>
                    Is a fundamental component to measure biodiversity, which is an essential component to achieve target 2. Biodiversity is key for ecosystem functioning, resilience to environmental change and genetic diversity. Estimates of species richness are for the year 2021 and 2022.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Values:</span> Count of the maximum number of terrestrial species potentially occurring in each grid cell in 2021 and 2022.
                </p>
                <p class="mt-1">
                    <span class="font-medium">Units:</span> Number of species
                </p>
                <p class="mt-1">
                    <span class="font-medium">Spatial resolution:</span> 30000 meters
                </p>
                <p class="mt-1">
                    <span class="font-medium">Source:</span> <a class="text-blue-600 underline hover:text-blue-500"
                       target="_blank"
                       href="https://www.iucnredlist.org/resources/other-spatial-downloads#SR_2022 ">https://www.iucnredlist.org/resources/other-spatial-downloads#SR_2022</a>
                </p>` });
        }
    }
];

const t = statistics.reduce((prev, curr) => ({ ...prev, [curr.dbId]: 'idle' }), {})
const areaStatStatus = ref<{ [key: string]: 'idle' | 'loading' | 'error' }[]>(new Array(store.projectAreas.length).fill(null).map(() => ({ ...t })));

const nDots = ref(0);
const nLoading = ref(0)

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
</template>./BatChart.vue
